"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function randCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => a[Math.floor(Math.random() * a.length)]).join("");
}

export default function CreatePage() {
  const r = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    setName(localStorage.getItem("pp_name") || "");
  }, []);

  const create = () => {
    localStorage.setItem("pp_name", name.trim() || "Guest");
    const c = randCode();
    r.push(`/r/${c}`);
  };

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-lg mx-auto bg-black/40 border border-white/10 rounded-2xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Create a Room</h1>
        <p className="text-sm opacity-70 mb-6">Instant one-time room. No login, no persistence.</p>
        <label className="block text-sm mb-2">Display Name</label>
        <input
          value={name}
          onChange={e=>setName(e.target.value)}
          placeholder="Your name"
          className="w-full mb-4 bg-black/30 border border-white/10 rounded px-3 py-2 outline-none focus:border-blue-500"
        />
        <button onClick={create} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 transition text-white">Create New Room</button>
      </div>
    </main>
  );
}


