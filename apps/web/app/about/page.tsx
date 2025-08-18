// app/about/page.tsx
import Image from "next/image";

export const metadata = {
  title: "About | Planit Poker",
  description: "The tiny origin story, privacy in plain English, and why this thing exists."
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid lg:grid-cols-[1fr,320px] gap-10 items-start">
        {/* Copy */}
        <article className="space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              About Planit Poker
            </h1>
            <p className="text-zinc-400">
              A tiny origin story, what it is (and isn’t), and how we treat your data
              like it’s hot lava.
            </p>
          </header>

          {/* Origin story */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">A tiny origin story (with caffeine and spite)</h2>
            <p>
              Once upon a stand-up, we tried yet another “free” planning poker site.
              It wanted accounts, emails, cookies, zodiac signs—maybe our firstborn.
              So we did what mildly irritated engineers do: we built our own that night.
            </p>
            <p>
              <span className="font-semibold">Planit Poker</span> is the result—dead simple,
              no login, no drama. Create a room, send a link, point your stories, toss a few
              emojis, and get back to shipping.
            </p>
          </section>

          {/* What it is / isn't */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">What it is (and what it isn’t)</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><span className="font-medium">No logins, ever.</span> If you can paste a URL, you can play.</li>
              <li><span className="font-medium">Fast &amp; ephemeral.</span> Rooms exist just long enough to be useful, then evaporate after a short idle.</li>
              <li><span className="font-medium">Lightweight fun.</span> Emoji toss to celebrate (or roast) estimates.</li>
              <li><span className="font-medium">No bloat.</span> No signup funnels, no creepy trackers, no cockpit UI.</li>
            </ul>
          </section>

          {/* Decks */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Sizing deck</h2>
            <p>
              We currently offer <span className="font-medium">Fibonacci</span> only:
              <span className="ml-2 inline-block rounded-md bg-white/5 px-2 py-1 border border-white/10">
                0, 1, 2, 3, 5, 8, 13, 21
              </span>
            </p>
          </section>

          {/* Privacy */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Privacy, in plain English</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>We <span className="font-semibold">don’t store</span> your estimates. We don’t want them.</li>
              <li>Rooms are <span className="font-semibold">temporary</span> and expire after inactivity.</li>
              <li>Your nickname is saved locally via <code className="px-1 py-0.5 bg-white/5 border border-white/10 rounded">localStorage</code>.
                  Delete it anytime.</li>
              <li>Minimal, aggregated server logs keep the lights on—<em>not</em> your data.</li>
            </ul>
          </section>

          {/* Why free */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Why free?</h2>
            <p>
              Because estimation shouldn’t require procurement. If this saves your team five minutes
              a sprint, it’s already paying rent.
            </p>
          </section>

          {/* Easter egg + contact */}
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Say hi</h2>
            <p>
              If you actually read this page (you monster), email us with the subject
              <span className="mx-1 font-semibold">“🦉 I read the About”</span>
              and we’ll reply with a terrible dad joke.
            </p>
            <p>
              Contact:{" "}
              <a href="mailto:matt@wozwize.com" className="underline">
                matt@wozwize.com
              </a>
            </p>
          </section>
        </article>

        {/* Sidebar */}
        <aside className="sticky top-20 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0b0f14] to-[#0e1420] p-5 shadow-[0_0_30px_rgba(59,130,246,.12)]">
            <div className="flex items-center gap-3">
              <Image
                src="/images/wozwize-owl.png"
                alt="WozWize Owl"
                width={36}
                height={36}
                className="rounded"
                priority
              />
              <div className="leading-tight">
                <div className="font-semibold">Built by WozWize</div>
                <a
                  href="https://wozwize.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  wozwize.com
                </a>
              </div>
            </div>
            <p className="mt-4 text-sm text-zinc-400">
              Our north star is <span className="font-medium">WIZE</span>:
              <span className="ml-1">Wisdom, Impact, Zero&nbsp;Guessing, Execution.</span>
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 p-5 bg-white/5">
            <h3 className="font-semibold mb-2">Roadmap-ish (no promises, only vibes)</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Room timers &amp; auto-reveal</li>
              <li>Quick copy-to-Jira / clipboard export</li>
              <li>More tasteful chaos in the emoji armory</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}