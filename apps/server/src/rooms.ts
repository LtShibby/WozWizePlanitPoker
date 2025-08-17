import { v4 as uuid } from "uuid";
import { RoomState, User, Task, Round } from "./types.js";

export const rooms = new Map<string, RoomState>();

export const ROOM_TTL_MS = Number(process.env.ROOM_TTL_MS ?? 10 * 60 * 1000);

export function touch(room: RoomState) {
  room.lastActiveAt = Date.now();
}

export function getOrCreateRoom(code: string): RoomState {
  let r = rooms.get(code);
  if (!r) {
    r = {
      code,
      users: new Map(),
      tasks: new Map(),
      currentRound: { id: uuid(), revealed: false, votes: {} },
      locked: false,
      lastActiveAt: Date.now()
    };
    rooms.set(code, r);
  }
  touch(r);
  return r;
}

export function assignSeatIndex(room: RoomState): number {
  // Seats 0..9 by join order; compact seats to avoid gaps.
  const taken = new Set<number>(Array.from(room.users.values()).map(u => u.seatIndex));
  for (let i = 0; i < 10; i++) {
    if (!taken.has(i)) return i;
  }
  return Math.min(9, room.users.size); // fallback
}

export function addUser(room: RoomState, socketId: string, name: string): User {
  const isFirst = room.users.size === 0;
  const user: User = {
    id: uuid(),
    name: sanitizeName(name),
    color: randomColor(),
    seatIndex: assignSeatIndex(room),
    isHost: isFirst,
    joinedAt: Date.now(),
    socketId
  };
  room.users.set(user.id, user);
  touch(room);
  return user;
}

export function removeUser(room: RoomState, userId: string) {
  room.users.delete(userId);
  // host failover
  if (![...room.users.values()].some(u => u.isHost) && room.users.size > 0) {
    const next = [...room.users.values()].sort((a, b) => a.joinedAt - b.joinedAt)[0];
    next.isHost = true;
  }
  touch(room);
}

export function newRound(room: RoomState) {
  room.currentRound = { id: uuid(), revealed: false, votes: {} };
  touch(room);
}

export function vote(room: RoomState, userId: string, value: string) {
  room.currentRound.votes[userId] = value;
  touch(room);
  
  // Auto-reveal when everyone has voted
  if (Object.keys(room.currentRound.votes).length === room.users.size && !room.currentRound.revealed) {
    room.currentRound.revealed = true;
  }
}

export function clearVotes(room: RoomState) {
  room.currentRound.votes = {};
  room.currentRound.revealed = false;
  touch(room);
}

export function reveal(room: RoomState) {
  room.currentRound.revealed = true;
  touch(room);
}

export function createTask(room: RoomState, name: string, description?: string): Task {
  const t: Task = { id: uuid(), name: name.trim(), description, status: "active" };
  room.tasks.set(t.id, t);
  room.activeTaskId = t.id;
  touch(room);
  return t;
}

export function setActiveTask(room: RoomState, taskId: string) {
  if (room.tasks.has(taskId)) room.activeTaskId = taskId;
  touch(room);
}

export function setFinalEstimate(room: RoomState, taskId: string, estimate: string) {
  const t = room.tasks.get(taskId);
  if (t) {
    t.finalEstimate = estimate;
    t.status = "estimated";
  }
  touch(room);
}

export function archiveTask(room: RoomState, taskId: string) {
  const t = room.tasks.get(taskId);
  if (t) t.status = "archived";
  touch(room);
}

export function sanitizeName(name: string) {
  return name.replace(/[\u{1F300}-\u{1FAFF}]/gu, "").trim().slice(0, 24) || "Guest";
}

function randomColor() {
  const hues = [200, 210, 220, 230, 240, 260, 280];
  const h = hues[Math.floor(Math.random() * hues.length)];
  return `hsl(${h} 90% 60%)`;
}

// Idle reaper
setInterval(() => {
  const now = Date.now();
  for (const [code, r] of rooms.entries()) {
    if (r.users.size === 0 && now - r.lastActiveAt > ROOM_TTL_MS) {
      rooms.delete(code);
    }
  }
}, 60 * 1000);
