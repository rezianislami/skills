import { Pricing } from "@/components/pricing";
import { Signup } from "@/components/signup";

const STATS = [
  { value: "48,000", label: "invoices sent last month" },
  { value: "2 days", label: "faster payment on average" },
  { value: "4.9/5", label: "from 1,200 reviews" },
];

const FEATURES = [
  { title: "One-minute invoices", body: "Pick a client, add lines, send. Tax and totals fill themselves in." },
  { title: "Gentle reminders", body: "Overdue invoices get a polite nudge on a schedule you choose." },
  { title: "Paid, then done", body: "Card and bank payments reconcile automatically when they land." },
];

const FAQ = [
  { q: "Is there a free plan?", a: "Yes. Send up to five invoices a month for free, forever." },
  { q: "Can I use my own branding?", a: "On Pro you can add your logo, colours and a custom email domain." },
  { q: "Which currencies do you support?", a: "Over 40, with live exchange rates on every invoice." },
];

export default function Home() {
  return (
    <div className="wrap">
      <nav className="nav">
        <a href="#" className="logo">
          Tally
        </a>
        <div className="links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
      </nav>

      <header className="hero">
        <h1>Invoices in a minute. Paid in days.</h1>
        <p>Tally writes, sends and chases your invoices, so you can get back to the work you invoice for.</p>
        <Signup />
      </header>

      <section className="stats" aria-label="Tally in numbers">
        {STATS.map((s) => (
          <div key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </section>

      <section id="features" className="section">
        <h2>Everything after &ldquo;the work is done&rdquo;</h2>
        <div className="features">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature">
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="section">
        <h2>Simple pricing</h2>
        <Pricing />
      </section>

      <section id="faq" className="section faq">
        <h2>Questions</h2>
        {FAQ.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>

      <section className="cta">
        <h2>Send your first invoice today.</h2>
        <a href="#" className="button">
          Get started free
        </a>
      </section>

      <footer className="footer">© 2026 Tally</footer>
    </div>
  );
}
