import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { getOrCreateRoom, addUser, removeUser, vote, reveal, clearVotes, newRound, createTask, setActiveTask, setFinalEstimate, archiveTask, rooms, touch } from "./rooms.js";
import { makeLimiter } from "./ratelimit.js";

const PORT = Number(process.env.PORT ?? 8787);
const ORIGIN = process.env.WEB_ORIGIN ?? "http://localhost:3000";

const app = express();
app.use(cors({ origin: ORIGIN }));
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: ORIGIN },
  path: "/rt"
});

type Client = { userId?: string; roomCode?: string };

const allowThrow = makeLimiter(1, 1500);     // 1 per 1.5s
const allowVote = makeLimiter(3, 3000);      // 3 per 3s
const allowTask = makeLimiter(3, 10000);     // 3 per 10s

io.on("connection", (socket) => {
  const c: Client = {};

  socket.on("joinRoom", ({ roomCode, name }: { roomCode: string; name: string }, ack) => {
    if (!roomCode || !name) return ack?.({ error: "bad_request" });
    const code = roomCode.toUpperCase().slice(0, 8);
    const room = getOrCreateRoom(code);
    if (room.locked) return ack?.({ error: "locked" });
    const user = addUser(room, socket.id, name);
    c.userId = user.id;
    c.roomCode = code;
    socket.join(code);
    io.to(code).emit("presenceChanged", snapshotRoom(code));
    ack?.({ you: user, room: snapshotRoom(code) });
  });

  socket.on("castVote", ({ value }: { value: string }) => {
    if (!c.roomCode || !c.userId) return;
    const key = `${socket.id}:vote`;
    if (!allowVote(key)) return;
    const room = rooms.get(c.roomCode);
    if (!room) return;
    vote(room, c.userId, value);
    io.to(c.roomCode).emit("votesChanged", { round: room.currentRound });
  });

  socket.on("reveal", () => {
    const room = guardHost(c);
    if (!room) return;
    reveal(room);
    io.to(room.code).emit("roundRevealed", { round: room.currentRound });
  });

  socket.on("clearVotes", () => {
    const room = guardHost(c);
    if (!room) return;
    clearVotes(room);
    io.to(room.code).emit("votesChanged", { round: room.currentRound });
  });

  socket.on("newRound", () => {
    const room = guardHost(c);
    if (!room) return;
    newRound(room);
    io.to(room.code).emit("roundChanged", { round: room.currentRound });
  });

  socket.on("createTask", ({ name, description }: { name: string; description?: string }) => {
    if (!c.roomCode || !c.userId) return;
    const key = `${socket.id}:task`;
    if (!allowTask(key)) return;
    const room = rooms.get(c.roomCode);
    if (!room) return;
    const me = room.users.get(c.userId);
    if (!me?.isHost) return;
    const t = createTask(room, name, description);
    io.to(room.code).emit("tasksChanged", { tasks: mapToArray(room.tasks), activeTaskId: room.activeTaskId });
  });

  socket.on("setActiveTask", ({ taskId }: { taskId: string }) => {
    const room = guardHost(c);
    if (!room) return;
    setActiveTask(room, taskId);
    io.to(room.code).emit("tasksChanged", { tasks: mapToArray(room.tasks), activeTaskId: room.activeTaskId });
  });

  socket.on("setFinalEstimate", ({ taskId, estimate }: { taskId: string; estimate: string }) => {
    const room = guardHost(c);
    if (!room) return;
    setFinalEstimate(room, taskId, estimate);
    io.to(room.code).emit("tasksChanged", { tasks: mapToArray(room.tasks), activeTaskId: room.activeTaskId });
  });

  socket.on("archiveTask", ({ taskId }: { taskId: string }) => {
    const room = guardHost(c);
    if (!room) return;
    archiveTask(room, taskId);
    io.to(room.code).emit("tasksChanged", { tasks: mapToArray(room.tasks), activeTaskId: room.activeTaskId });
  });

  socket.on("throwEmoji", ({ toUserId, emoji }: { toUserId: string; emoji: string }) => {
    if (!c.roomCode || !c.userId) return;
    const key = `${socket.id}:throw`;
    if (!allowThrow(key)) return;
    const room = rooms.get(c.roomCode);
    if (!room) return;
    if (!room.users.has(toUserId)) return;
    touch(room);
    io.to(room.code).emit("emojiThrown", {
      id: cryptoRandom(),
      fromUserId: c.userId,
      toUserId,
      emoji,
      at: Date.now()
    });
  });

  socket.on("transferHost", ({ toUserId }: { toUserId: string }) => {
    const room = guardHost(c);
    if (!room) return;
    const from = room.users.get(c.userId!);
    const to = room.users.get(toUserId);
    if (!from || !to) return;
    from.isHost = false;
    to.isHost = true;
    io.to(room.code).emit("presenceChanged", snapshotRoom(room.code));
  });

  socket.on("lockRoom", ({ locked }: { locked: boolean }) => {
    const room = guardHost(c);
    if (!room) return;
    room.locked = !!locked;
    io.to(room.code).emit("roomLocked", { locked: room.locked });
  });

  socket.on("kick", ({ userId }: { userId: string }) => {
    const room = guardHost(c);
    if (!room) return;
    if (!room.users.has(userId)) return;
    io.to(room.code).emit("userKicked", { userId });
    const socketToKick = [...io.of("/").sockets.values()].find(s => (s as any)._client?.userId === userId);
    // best-effort
    socketToKick?.disconnect(true);
  });

  (socket as any)._client = c; // for crude kick lookup

  socket.on("disconnect", () => {
    if (!c.roomCode || !c.userId) return;
    const room = rooms.get(c.roomCode);
    if (!room) return;
    removeUser(room, c.userId);
    io.to(c.roomCode).emit("presenceChanged", snapshotRoom(c.roomCode));
  });
});

function cryptoRandom() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

function snapshotRoom(code: string) {
  const r = rooms.get(code)!;
  return {
    code: r.code,
    users: mapToArray(r.users),
    tasks: mapToArray(r.tasks),
    activeTaskId: r.activeTaskId,
    round: r.currentRound,
    locked: r.locked
  };
}

function guardHost(c: { roomCode?: string; userId?: string }) {
  if (!c.roomCode || !c.userId) return null;
  const room = rooms.get(c.roomCode);
  if (!room) return null;
  const me = room.users.get(c.userId);
  if (!me?.isHost) return null;
  return room;
}

function mapToArray<T>(m: Map<string, T>) {
  return [...m.values()];
}

httpServer.listen(PORT, () => {
  console.log(`server on :${PORT} (origin: ${ORIGIN})`);
});
