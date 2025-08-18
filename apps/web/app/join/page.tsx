"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function JoinPage() {
  const r = useRouter();
  const search = useSearchParams();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    setName(localStorage.getItem("pp_name") || "");
    const qp = search?.get("code")?.toUpperCase() || "";
    if (qp) setCode(qp);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c || c.length < 2) return;
    localStorage.setItem("pp_name", name.trim() || "Guest");
    r.push(`/r/${c}`);
  };

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-lg mx-auto bg-black/40 border border-white/10 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Join a Room</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block text-sm">Display Name</label>
          <input value={name} onChange={e=>setName(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 outline-none focus:border-blue-500"
            placeholder="Your name" aria-label="Display name" />
          <label className="block text-sm">Room Code</label>
          <input ref={inputRef} value={code} onChange={e=>setCode(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded px-3 py-2 outline-none focus:border-blue-500"
            placeholder="ROOM CODE" aria-label="Room code" />
          <button type="submit" className="w-full px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 transition text-white">Join</button>
        </form>
      </div>
    </main>
  );
}


