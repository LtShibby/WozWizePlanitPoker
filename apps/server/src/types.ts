export type User = {
  id: string;
  name: string;
  color: string;
  seatIndex: number;
  isHost: boolean;
  joinedAt: number;
  socketId: string;
};

export type Round = {
  id: string;
  revealed: boolean;
  votes: Record<string, string | undefined>; // userId -> value
};

export type Task = {
  id: string;
  name: string;
  description?: string;
  status: "active" | "estimated" | "archived";
  finalEstimate?: string;
};

export type RoomState = {
  code: string;
  users: Map<string, User>;
  tasks: Map<string, Task>;
  activeTaskId?: string;
  currentRound: Round;
  locked: boolean;
  lastActiveAt: number;
};
