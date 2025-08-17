"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

function randCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => a[Math.floor(Math.random() * a.length)]).join("");
}

export default function Page() {
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState("");
  const r = useRouter();

  // Load name from localStorage only on client side
  useEffect(() => {
    const savedName = localStorage.getItem("pp_name") || "";
    setName(savedName);
  }, []);

  const go = (c: string) => {
    localStorage.setItem("pp_name", name.trim() || "Guest");
    r.push(`/r/${c.toUpperCase()}`);
  };

  return (
    <main className="min-h-screen grid place-items-center">
      <div className="w-full max-w-md bg-black/40 border border-white/10 rounded-2xl p-6 shadow-neon">
        <h1 className="text-2xl font-bold mb-2">WozWize PlanIt Poker</h1>
        <p className="text-sm opacity-70 mb-6">Ephemeral rooms. No sign-in. Throw emojis at your PM.</p>

        <label className="block text-sm mb-2">Display Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Matt"
          className="w-full mb-4 bg-black/30 border border-white/10 rounded px-3 py-2 outline-none focus:border-primary"/>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={()=>go(randCode())}
            className="col-span-3 md:col-span-1 bg-primary/20 border border-primary/40 rounded px-3 py-2 hover:bg-primary/30">Create</button>
          <input value={code} onChange={e=>setCode(e.target.value)}
            className="col-span-2 bg-black/30 border border-white/10 rounded px-3 py-2" placeholder="ROOM CODE"/>
        </div>
        <button onClick={()=>code && go(code)}
          className="mt-3 w-full bg-white/10 hover:bg-white/20 border border-white/15 rounded px-3 py-2">Join</button>
        <div className="mt-4 text-xs opacity-60">Tip: Share the URL to invite teammates. Rooms die after ~10 minutes idle.</div>
      </div>
    </main>
  );
}
