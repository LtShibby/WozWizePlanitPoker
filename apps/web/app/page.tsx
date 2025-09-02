"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

function randCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => a[Math.floor(Math.random() * a.length)]).join("");
}

export default function Page() {
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState("");
  const r = useRouter();

  // Feature cards content and state for desktop interaction
  const features = [
    { title: "Real-time pointing", body: "No sign-up required. Share the URL and start immediately." },
    { title: "Emoji toss", body: "Lighten the vibe by tossing emojis at teammates." },
    { title: "One-time rooms", body: "No history, no persistence — rooms expire after inactivity." },
    { title: "Built by WozWize", body: "Crafted with care. Learn more.", link: "https://wozwize.com" }
  ];
  const [active, setActive] = useState<number | null>(null);

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
    <main className="grid gap-10 py-12">
      
      <section className="w-full max-w-5xl mx-auto px-4">
        <div className="relative h-64 md:h-80 w-full rounded-xl overflow-hidden border border-white/10">
          <Image
            src="/images/poker-owls-cropped.png"
            alt="Planit Poker preview"
            fill
            priority
            sizes="(min-width: 1024px) 960px, (min-width: 768px) 768px, 100vw"
            className="object-cover"
          />
        </div>
      </section>
      
      <section className="w-full max-w-4xl mx-auto text-center px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight font-heading">Planit Poker - simple, no-login team estimation.</h1>
        <p className="text-base md:text-lg opacity-80 mb-6">Real-time pointing, emoji throws, and zero persistence — rooms auto-expire after a short idle.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/create" className="px-5 py-3 rounded-md bg-blue-600 hover:bg-blue-500 transition text-white">Create a Room</Link>
          <Link href="/join" className="px-5 py-3 rounded-md border border-white/20 hover:bg-white/10 transition">Join a Room</Link>
        </div>
      </section>

      {/* Feature cards: stacked on mobile; vertical poker hand with click-to-focus on desktop */}
      <section className="w-full max-w-5xl mx-auto px-4 -mt-6 md:-mt-10 lg:-mt-12 mb-12 md:mb-16 relative">
        {/* Mobile: simple stack */}
        <div className="grid gap-4 md:hidden">
          {features.map((f, i) => (
            <div key={i} className="rounded-2xl bg-white text-gray-900 border border-black/10 p-5 shadow-xl">
              <h3 className="font-semibold mb-2 font-heading">{f.title}</h3>
              <p className="text-sm text-gray-700">
                {f.body} {f.link && (<a className="underline" href={f.link} target="_blank" rel="noreferrer noopener">Learn more</a>)}
              </p>
            </div>
          ))}
        </div>

        {/* Desktop: vertical hand */}
        <div
          className="hidden md:flex items-center justify-center relative
                    h-[16rem] lg:h-[18rem] xl:h-[20rem]
                    -mt-10 md:-mt-14 xl:-mt-16 select-none pointer-events-none"
          onClick={() => setActive(null)}
        >
          {features.map((f, i) => {
            // Base slot positions for a fanned vertical hand
            const slots = [
              { x: -200, y: 0,  r: -8, z: 5  },
              { x:  -65, y: -6, r: -3, z: 10 },
              { x:   65, y: -6, r:  3, z: 15 },
              { x:  200, y: 0,  r:  8, z: 20 },
            ];
            const s = slots[i];

            // When active, spread cards horizontally and center the active one
            let x = s.x, y = s.y, r = s.r, z = s.z, scale = 1, opacity = 1;
            if (active !== null) {
              const offset = i - active;
              x = offset * 220; // push others aside
              y = 0;
              r = 0;
              scale = i === active ? 1.06 : 0.98;
              opacity = i === active ? 1 : 0.9;
              z = i === active ? 50 : 10 + (3 - Math.abs(offset));
            }

            return (
              <motion.div
                key={i}
                layout
                initial={false}
                animate={{ x, y, rotate: r, scale, opacity }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                className="absolute top-[35%] left-[40%] -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
                style={{ zIndex: z }}
                onClick={(e) => { e.stopPropagation(); setActive(i === active ? null : i); }}
              >
                <div className={`w-52 md:w-56 h-72 rounded-2xl border p-5 shadow-2xl shadow-[0_0_30px_rgba(59,130,246,.12)] hover:shadow-[0_0_40px_rgba(59,130,246,.18)] transition-shadow ${i === 3 ? 'bg-gradient-to-b from-blue-600 to-blue-500 text-white border-blue-400' : 'bg-white text-gray-900 border-black/10'}`}>
                  <div className="h-1 w-10 bg-blue-500 rounded mb-3" />
                  <h3 className="font-semibold mb-2 font-heading">{f.title}</h3>
                  <p className={`text-sm ${i === 3 ? 'text-white/90' : 'text-gray-700'}`}>
                    {f.body} {f.link && (<a className={`underline ${i === 3 ? 'text-white hover:text-white/90' : ''}`} href={f.link} target="_blank" rel="noreferrer noopener">Learn more</a>)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="w-full max-w-5xl mx-auto gap-6 px-4">
        <div className="w-full max-w-md mx-auto bg-[#0b0f14] border border-white/10 rounded-2xl p-6 relative z-10">
          <h2 className="text-xl font-bold mb-2 font-heading">Jump right in</h2>
          <p className="text-sm opacity-70 mb-6">Create a room or join an existing one by code.</p>

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
      </section>
    </main>
  );
}
