Local development
=================

1) Start the backend (from repo root):
```
npm -w apps/server run dev
```

2) Create `apps/web/.env.local` with:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:8787
```

3) Start the frontend (from repo root):
```
npm -w apps/web run dev
```

Open http://localhost:3000 and create/join a room.


