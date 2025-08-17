"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { motion } from "framer-motion";

type User = { id: string; name: string; color: string; seatIndex: number; isHost: boolean; joinedAt: number; socketId: string; };
type Round = { id: string; revealed: boolean; votes: Record<string, string|undefined> };
type Task = { id: string; name: string; description?: string; status: "active"|"estimated"|"archived"; finalEstimate?: string; };
type RoomSnap = { code: string; users: User[]; tasks: Task[]; activeTaskId?: string; round: Round; locked: boolean };

const DECK = ["0","1","2","3","5","8","13","20","40","100","?","☕"];

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const roomCode = (params.code || "").toUpperCase();
  const [snap, setSnap] = useState<RoomSnap|null>(null);
  const [me, setMe] = useState<User|null>(null);
  const [activeTaskName, setActiveTaskName] = useState("");
  const [activeTaskDesc, setActiveTaskDesc] = useState("");
     const [selected, setSelected] = useState<string|undefined>(undefined);
   const [throwTarget, setThrowTarget] = useState<string|undefined>();
   const [projectiles, setProjectiles] = useState<Array<{id:string;emoji:string;from:string;to:string}>>([]);
   const [showAutoReveal, setShowAutoReveal] = useState(false);
  const sockRef = useRef<Socket|null>(null);

     useEffect(()=> {
     const name = localStorage.getItem("pp_name") || "Guest";
     const url = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8787";
    
    const s = io(url, { 
      path: "/rt", 
      transports: ["websocket", "polling"], // Try both transports
      withCredentials: false,
      timeout: 20000,
      forceNew: true
    });
    
    sockRef.current = s;
    
         s.on("connect", () => {
       console.log("✅ Socket.IO connected!");
     });
     
     s.on("connect_error", (error) => {
       console.error("❌ Socket.IO connection error:", error.message);
     });
    
         // Try to join room after a short delay to ensure connection is ready
     setTimeout(() => {
       s.emit("joinRoom", { roomCode, name }, (res: any) => {
         if (res?.error) { 
           alert(res.error); 
           return; 
         }
         setMe(res.you);
         setSnap(res.room);
       });
     }, 1000);

         s.on("presenceChanged", (room: RoomSnap)=> {
       setSnap(room);
     });
     s.on("votesChanged", ({ round }: { round: Round }) => {
       setSnap(prev => prev ? ({...prev, round}) : prev);
     });
     s.on("roundChanged", ({ round }: { round: Round }) => { 
       setSelected(undefined); 
       setSnap(prev=>prev?({...prev, round}):prev); 
       setShowAutoReveal(false);
     });
     s.on("roundRevealed", ({ round }: { round: Round }) => {
       setSnap(prev => prev ? ({...prev, round}) : prev);
       setShowAutoReveal(true);
       setTimeout(() => setShowAutoReveal(false), 3000); // Hide after 3 seconds
     });
     s.on("tasksChanged", ({ tasks, activeTaskId }: { tasks: Task[]; activeTaskId?: string }) => {
       setSnap(prev => prev ? ({...prev, tasks, activeTaskId}) : prev);
     });
     s.on("emojiThrown", (e: {id:string; fromUserId:string; toUserId:string; emoji:string}) => {
       setProjectiles(p => [...p, { id: e.id, emoji: e.emoji, from: e.fromUserId, to: e.toUserId }]);
       setTimeout(()=> setProjectiles(p => p.filter(x=>x.id!==e.id)), 1500);
     });

         return ()=> { 
       s.disconnect(); 
     };
  }, [roomCode]);

  const isHost = !!me && snap?.users.find(u=>u.id===me.id)?.isHost;
  const seats = useMemo(()=> {
    const n = Math.max(2, Math.min(10, snap?.users.length ?? 0) || 2);
    const arr = new Array(n).fill(null) as Array<User|null>;
    snap?.users.forEach(u => { if (u.seatIndex < n) arr[u.seatIndex] = u; });
    return arr;
  }, [snap]);

     // Debug logging removed for cleaner console

     function cast(value: string) {
     if (!sockRef.current?.connected) {
       console.error("❌ Socket not connected!");
       return;
     }
     
     setSelected(value);
     sockRef.current.emit("castVote", { value });
   }

     function createTask() {
     if (!activeTaskName.trim()) {
       return;
     }
     
     if (!sockRef.current?.connected) {
       console.error("❌ Socket not connected!");
       return;
     }
     
     sockRef.current.emit("createTask", { name: activeTaskName.trim(), description: activeTaskDesc.trim() });
     setActiveTaskName(""); 
     setActiveTaskDesc("");
   }

           function throwEmoji(emoji: string) {
      if (!throwTarget) {
        return;
      }
      
      if (!sockRef.current?.connected) {
        console.error("❌ Socket not connected!");
        return;
      }
      
      sockRef.current.emit("throwEmoji", { toUserId: throwTarget, emoji });
      // Keep the target selected so user can throw more emojis
    }

     function getVoteDisplayClass(vote: string | undefined, round: Round): string {
     if (!vote || !round.revealed) return "";
     
     const votes = Object.values(round.votes).filter(Boolean) as string[];
     const nums = votes.map(v => Number(v)).filter(n => Number.isFinite(n)).sort((a,b)=>a-b);
     
     if (nums.length < 2) return "text-green-500 font-bold";
     
     const min = nums[0];
     const max = nums[nums.length - 1];
     const voteNum = Number(vote);
     
     if (voteNum === min && voteNum === max) return "text-green-500 font-bold"; // Consensus
     if (voteNum === min) return "text-red-500 font-bold"; // Lowest outlier
     if (voteNum === max) return "text-orange-500 font-bold"; // Highest outlier
     
     return "text-blue-500"; // Normal vote
   }

   function stats(round: Round) {
    const vals = Object.values(round.votes).filter(Boolean) as string[];
    const nums = vals.map(v => Number(v)).filter(n => Number.isFinite(n)).sort((a,b)=>a-b);
    if (!nums.length) return { min: "-", max: "-", median: "-", agree: "0%" };
    const median = nums.length % 2 ? nums[(nums.length-1)/2] : (nums[nums.length/2-1] + nums[nums.length/2]) / 2;
    const agree = (new Set(vals)).size === 1 ? "100%" : Math.round((nums.length / seats.filter(Boolean).length) * 100) + "%";
    return { min: String(nums[0]), max: String(nums[nums.length-1]), median: String(median), agree };
  }

  return (
    <main className="min-h-screen p-4">
      <header className="flex items-center justify-between mb-3">
        <div className="text-sm opacity-70">Room <span className="font-mono">{roomCode}</span></div>
                 <div className="flex gap-2">
           {isHost && (
            <>
              <button className="px-3 py-1 bg-primary/20 border border-primary/40 rounded" onClick={()=>sockRef.current?.emit("reveal")}>Reveal</button>
              <button className="px-3 py-1 bg-white/10 border border-white/15 rounded" onClick={()=>sockRef.current?.emit("clearVotes")}>Clear</button>
              <button className="px-3 py-1 bg-white/10 border border-white/15 rounded" onClick={()=>sockRef.current?.emit("newRound")}>New Round</button>
            </>
          )}
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
                 {/* Table */}
         <div className="relative bg-black/30 border border-white/10 rounded-2xl p-4 overflow-hidden">
           <div className="absolute inset-8 rounded-full border border-white/10 bg-black/30 pointer-events-none" />
           {/* Seats */}
          <div className="relative h-[520px]">
            {seats.map((u, i) => {
              const pos = seatPos(i, seats.length, 190);
              return (
                <div key={i} className="absolute" style={{ left: `calc(50% + ${pos.x}px)`, top: `calc(50% + ${pos.y}px)` }}>
                                     <div
                     onClick={()=> u && setThrowTarget(u.id)}
                     className={`w-28 -ml-14 -mt-12 text-center cursor-pointer select-none ${throwTarget===u?.id ? "ring-2 ring-accent" : ""}`}>
                     <div className={`relative w-16 h-16 rounded-full mx-auto mb-1 transition-all duration-300 ${u && snap?.round.votes[u.id] ? "ring-2 ring-green-400 scale-110" : ""}`} style={{ background: u ? u.color : "#333" }}>
                       {/* Vote display inside circle */}
                       {u && snap?.round.votes[u.id] && (
                         <div className="absolute inset-0 flex items-center justify-center">
                           {snap.round.revealed ? (
                             <span className={`text-lg font-bold ${getVoteDisplayClass(snap.round.votes[u.id], snap.round)}`}>
                               {snap.round.votes[u.id]}
                             </span>
                           ) : (
                             <span className="text-white text-sm">✓</span>
                           )}
                         </div>
                       )}
                     </div>
                     <div className="text-xs truncate font-medium">{u?.name ?? "Waiting…"}</div>
                     <div className="text-[10px] opacity-60">
                        {u ? (
                          snap?.round.revealed ? (
                            <span className="text-white/60">Final</span>
                          ) : (
                            snap?.round.votes[u.id] ? (
                              <span className="text-green-500 font-semibold">Voted</span>
                            ) : (
                              "Picking…"
                            )
                          )
                        ) : ""}
                        {u?.isHost && <span className="text-yellow-400"> • Host</span>}
                      </div>
                   </div>
                </div>
              );
            })}
            {/* Emoji projectiles */}
            {projectiles.map(p => <Projectile key={p.id} snap={snap} from={p.from} to={p.to} emoji={p.emoji} />)}
            <div className="absolute left-4 bottom-4 text-xs opacity-50">Click a seat to target; then pick an emoji below.</div>
          </div>

          {/* Deck */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {DECK.map(v => (
              <button key={v}
                onClick={()=>cast(v)}
                className={`px-3 py-2 rounded border ${selected===v?"border-primary bg-primary/20":"border-white/10 bg-white/5"} hover:bg-white/10`}>
                {v}
              </button>
            ))}
          </div>

          {/* Emoji throw picker */}
          {throwTarget && (
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {["🍅","🎯","💥","🙌","😂","😴","🤡","🚀","🔥"].map(e => (
                <button key={e} onClick={()=>throwEmoji(e)} className="px-2 py-1 bg-white/10 rounded text-xl hover:bg-white/20">{e}</button>
              ))}
              <button onClick={()=>setThrowTarget(undefined)} className="px-2 py-1 text-xs border border-white/15 rounded">Cancel</button>
            </div>
          )}

                     {/* Auto-reveal notification */}
           {showAutoReveal && (
             <div className="mt-4 text-center">
               <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-2 text-yellow-300 text-sm animate-pulse">
                 🎉 Auto-revealed! All votes are in!
               </div>
             </div>
           )}
           
           {/* Stats */}
           <div className="mt-4 text-center">
             {snap && snap.round.revealed && (
               <div className="bg-green-500/20 border border-green-500/40 rounded-lg p-3 mb-2">
                 <div className="text-green-300 font-semibold mb-2">🎯 Results Revealed!</div>
                                    <div className="flex justify-center gap-6 text-sm">
                     <span className="bg-white/10 px-3 py-1 rounded">min: <span className="font-mono text-red-500 font-bold">{stats(snap.round).min}</span></span>
                     <span className="bg-white/10 px-3 py-1 rounded">max: <span className="font-mono text-orange-500 font-bold">{stats(snap.round).max}</span></span>
                     <span className="bg-white/10 px-3 py-1 rounded">median: <span className="font-mono text-blue-500 font-bold">{stats(snap.round).median}</span></span>
                     <span className="bg-white/10 px-3 py-1 rounded">agree: <span className="font-mono text-green-500 font-bold">{stats(snap.round).agree}</span></span>
                   </div>
               </div>
             )}
             {snap && !snap.round.revealed && (
               <div className="text-sm">
                 {Object.keys(snap.round.votes).length === snap.users.length ? (
                   <div className="text-green-500 font-bold animate-pulse text-base">
                     🎉 All votes in! Auto-revealing...
                   </div>
                 ) : (
                   <div className="opacity-80">
                     Votes: <span className="font-mono text-blue-500 font-bold">{Object.keys(snap.round.votes).length}</span>/<span className="font-mono font-bold">{snap.users.length}</span>
                   </div>
                 )}
               </div>
             )}
           </div>
        </div>

        {/* Tasks Panel */}
        <aside className="bg-black/30 border border-white/10 rounded-2xl p-4">
          <h2 className="font-semibold mb-2">Tasks</h2>
          {isHost && (
            <div className="mb-3 space-y-2">
              <input value={activeTaskName} onChange={e=>setActiveTaskName(e.target.value)} placeholder="Task name"
                className="w-full bg-black/30 border border-white/10 rounded px-2 py-1"/>
              <textarea value={activeTaskDesc} onChange={e=>setActiveTaskDesc(e.target.value)} placeholder="Description (optional)"
                className="w-full bg-black/30 border border-white/10 rounded px-2 py-1 h-16"/>
              <button onClick={createTask} className="px-3 py-1 bg-primary/20 border border-primary/40 rounded">Create + Set Active</button>
            </div>
          )}
          <div className="space-y-2 max-h-[60vh] overflow-auto pr-1">
            {snap?.tasks?.map(t => (
              <div key={t.id} className={`p-2 rounded border ${snap.activeTaskId===t.id?"border-primary/60":"border-white/10"} bg-white/5`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t.name}</div>
                    {t.description && <div className="text-xs opacity-70">{t.description}</div>}
                    <div className="text-[10px] opacity-60 mt-1">Status: {t.status}{t.finalEstimate?` • Final: ${t.finalEstimate}`:""}</div>
                  </div>
                  <div className="flex gap-2">
                    {isHost && <button onClick={()=>sockRef.current?.emit("setActiveTask",{taskId:t.id})} className="text-xs border border-white/15 rounded px-2 py-1">Set Active</button>}
                    {isHost && snap?.round?.revealed && <button onClick={()=>{
                      const est = prompt("Final estimate (e.g., 5, 8, 13):")?.trim();
                      if (est) sockRef.current?.emit("setFinalEstimate",{taskId:t.id, estimate:est});
                    }} className="text-xs border border-white/15 rounded px-2 py-1">Set Final</button>}
                    {isHost && <button onClick={()=>sockRef.current?.emit("archiveTask",{taskId:t.id})} className="text-xs border border-white/15 rounded px-2 py-1">Archive</button>}
                  </div>
                </div>
              </div>
            ))}
            {!snap?.tasks?.length && <div className="text-xs opacity-60">No tasks yet.</div>}
          </div>
        </aside>
      </div>
    </main>
  );
}

function seatPos(i: number, n: number, r: number) {
  const angle = -Math.PI/2 + (2*Math.PI*i)/n;
  return { x: Math.cos(angle)*r, y: Math.sin(angle)*r };
}

function Projectile({ snap, from, to, emoji }: { snap: RoomSnap|null, from: string, to: string, emoji: string }) {
  if (!snap) return null;
  const users = snap.users;
  const iFrom = users.find(u=>u.id===from)?.seatIndex ?? 0;
  const iTo = users.find(u=>u.id===to)?.seatIndex ?? 0;
  const p1 = seatPos(iFrom, Math.max(2, users.length||2), 190);
  const p2 = seatPos(iTo, Math.max(2, users.length||2), 190);
  return (
    <motion.div
      className="absolute text-2xl"
      initial={{ left: `calc(50% + ${p1.x}px)`, top: `calc(50% + ${p1.y}px)`, scale: 1 }}
      animate={{ left: `calc(50% + ${p2.x}px)`, top: `calc(50% + ${p2.y}px)`, scale: 1.2 }}
      transition={{ duration: 0.9, ease: "easeInOut" }}
    >
      {emoji}
    </motion.div>
  );
}