export const metadata = {
  title: "About | Planit Poker",
  description: "What Planit Poker is and how it respects your privacy."
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl font-semibold">About Planit Poker</h1>
        <p>
          Planit Poker is a simple, no-login team estimation tool. Create an instant room, invite teammates, point in real time, and even toss a few emojis.
        </p>
        <p>
          Privacy: we don’t store your estimates. Rooms are ephemeral and expire shortly after inactivity.
        </p>
        <p>
          Built by <a href="https://wozwize.com" target="_blank" rel="noopener noreferrer" className="underline">WozWize</a> with care.
        </p>
        <p>
          We don't store your estimates. Rooms are ephemeral and expire shortly after inactivity.
        </p>
        <p>
          Fast, simple, and private.
        </p>
        <p>
          Contact us: <a href="mailto:matt@wozwize.com" className="underline">matt@wozwize.com</a>
        </p>
      </div>
    </main>
  );
}


