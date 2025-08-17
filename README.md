# WozWize PlanIt Poker (Ephemeral, No DB)

Planning Poker with Socket.IO, in-memory rooms, and throwable emoji. No accounts, no database, no history.

## Dev
1. `npm i`
2. Start backend and frontend: `npm run dev`
   - Server: http://localhost:8787 (WebSocket path `/rt`)
   - Web: http://localhost:3000
3. In `apps/web`, create `.env.local`:
```
NEXT_PUBLIC_SOCKET_URL=http://localhost:8787
```
4. Open the web app, choose a name, Create or Join with a code. Share URL.

## Deploy
- **Server**: Deploy `apps/server` to Railway/Render/Fly (keep a single Node instance warm). Set env:
- `WEB_ORIGIN=https://your-frontend-domain`
- (optional) `ROOM_TTL_MS=600000` (10 min)
- **Web**: Deploy `apps/web` to Vercel. Env:
- `NEXT_PUBLIC_SOCKET_URL=https://your-server-domain`

## Notes
- No persistence; rooms die on restart or after idle TTL.
- First joiner is Host. Host can reveal/clear/new round, manage tasks, lock room.
- Emoji throw has server-side rate limit.
