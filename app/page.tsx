"use client";

import { useState } from "react";

const EXAMPLES = [
  "Stag do for 12 lads, 3 nights in Malaga, beach activities + bar crawl",
  "Birthday weekend for 20 guys, Ibiza villa, pool party + club nights",
  "Golf trip for 8 mates, 4 days Portugal, accommodation + tee times needed",
  "Corporate team jolly, 30 blokes, 2 nights Amsterdam, pub tour + dinner",
];

interface Recipient {
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
}

interface ProposalResult {
  url: string;
  uuid: string;
  title: string;
  description: string;
}

export default function Home() {
  const [inquiry, setInquiry] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [recipient, setRecipient] = useState<Recipient>({
    first_name: "",
    last_name: "",
    email: "",
    company_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [result, setResult] = useState<ProposalResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRecipientChange = (field: keyof Recipient, value: string) => {
    setRecipient((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!inquiry.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      setLoadingStep("Getting the lads together...");
      await new Promise((r) => setTimeout(r, 700));
      setLoadingStep("Writing up the proposal, hold tight...");

      const res = await fetch("/api/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inquiry, arrivalDate, departureDate, recipient }),
      });

      setLoadingStep("Sending it over to Proposales...");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Something went wrong. Give it another go!");
      }

      setResult(data.proposal);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setInquiry("");
    setArrivalDate("");
    setDepartureDate("");
    setRecipient({ first_name: "", last_name: "", email: "", company_name: "" });
  };

  return (
    <div className="page">

      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="header-logo">
            <img src="/logo.png" alt="Axels Beer @ Breakfast" />
          </div>
          <span className="header-tagline">Makes A Lad Glad! 🍺</span>
          <span className="header-badge">⚡ AI Powered</span>
        </div>
      </header>

      {/* Banner */}
      <img src="/banner.png" alt="Axels Beer @ Breakfast" className="banner" />

      {/* Hero */}
      <section className="hero">
        <div className="hero-eyebrow">🌴 Proposal Generator 🌴</div>
        <h1>
          Tell us about your <span className="highlight">lads&apos; trip</span>
          <br />and we&apos;ll sort the proposal!
        </h1>
        <p>
          Describe the event, we&apos;ll handle the paperwork. You focus on who&apos;s bringing the sunscreen. 😎
        </p>
      </section>

      {/* Main */}
      <main className="main">
        {!result ? (
          <div className="form-card">

            {/* Inquiry */}
            <label className="form-label" htmlFor="inquiry">
              🎉 What&apos;s the occasion?
            </label>
            <textarea
              id="inquiry"
              className="form-textarea"
              placeholder="e.g. Stag do for 15 lads, long weekend in Benidorm, July, need accommodation + activities + bar packages + breakfast. Budget around £500 per head."
              value={inquiry}
              onChange={(e) => setInquiry(e.target.value)}
              disabled={loading}
            />
            <p className="form-hint">
              Drop in the details — who, how many, where, when, budget, breakfast yes/no?. The more the merrier!
            </p>

            <p className="form-examples-label">🍻 Quick examples:</p>
            <div className="form-examples">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  className="example-chip"
                  onClick={() => setInquiry(ex)}
                  disabled={loading}
                >
                  {ex}
                </button>
              ))}
            </div>

            <div className="divider" />

            {/* Dates */}
            <p className="form-label">📅 When are the dates? <span className="form-label-optional">(optional)</span></p>
            <div className="recipient-grid">
              <div className="input-group">
                <label className="input-label" htmlFor="arrival_date">Arrival Date</label>
                <input
                  id="arrival_date"
                  className="form-input"
                  type="date"
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="departure_date">Departure Date</label>
                <input
                  id="departure_date"
                  className="form-input"
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="divider" />

            {/* Recipient */}
            <p className="form-label">👤 Who&apos;s it for? <span className="form-label-optional">(optional)</span></p>
            <div className="recipient-grid">
              <div className="input-group">
                <label className="input-label" htmlFor="first_name">First Name</label>
                <input
                  id="first_name"
                  className="form-input"
                  type="text"
                  placeholder="John"
                  value={recipient.first_name}
                  onChange={(e) => handleRecipientChange("first_name", e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="last_name">Last Name</label>
                <input
                  id="last_name"
                  className="form-input"
                  type="text"
                  placeholder="Smith"
                  value={recipient.last_name}
                  onChange={(e) => handleRecipientChange("last_name", e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  className="form-input"
                  type="email"
                  placeholder="john@example.com"
                  value={recipient.email}
                  onChange={(e) => handleRecipientChange("email", e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="company_name">Company</label>
                <input
                  id="company_name"
                  className="form-input"
                  type="text"
                  placeholder="Lads Inc."
                  value={recipient.company_name}
                  onChange={(e) => handleRecipientChange("company_name", e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="divider" />

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading || inquiry.trim().length < 10}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  One sec lads...
                </>
              ) : (
                <>🍺 Generate My Proposal!</>
              )}
            </button>

            {loading && (
              <div className="loading-status">
                <p>{loadingStep}</p>
              </div>
            )}

            {error && <div className="error-box">😬 {error}</div>}
          </div>
        ) : (
          <div className="result-card">
            <div className="result-header">
              <div className="result-header-icon">🎉</div>
              <div className="result-header-text">
                <h3>Proposal&apos;s Ready, Lads!</h3>
                <p>Draft saved to your Proposales account — go check it out</p>
              </div>
            </div>

            <div className="result-body">
              <h2 className="result-title">{result.title}</h2>
              <div className="result-description">
                {result.description
                  .replace(/[#*]/g, "")
                  .split("\n")
                  .filter(Boolean)
                  .map((line, i) => (
                    <p key={i} style={{ marginBottom: "0.6rem" }}>{line}</p>
                  ))}
              </div>

              <div className="result-actions">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  🍺 Open in Proposales
                </a>
                <button className="btn-secondary" onClick={handleReset}>
                  🔄 New Proposal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="how-it-works">
          <div className="step">
            <span className="step-emoji">📝</span>
            <h4>Describe It</h4>
            <p>Tell us about the trip — who, where, when, and how many pints budget.</p>
          </div>
          <div className="step">
            <span className="step-emoji">🤖</span>
            <h4>AI Does the Work</h4>
            <p>Llama writes a proper proposal so you don&apos;t have to.</p>
          </div>
          <div className="step">
            <span className="step-emoji">🍺</span>
            <h4>Crack On</h4>
            <p>Review, tweak, and send it. Then get back to planning the fun stuff.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <span className="tagline">Makes A Lad Glad! 🍺</span>
        Built with{" "}
        <a href="https://proposales.com" target="_blank" rel="noopener noreferrer">Proposales</a>
        {" & "}
        <a href="https://groq.com" target="_blank" rel="noopener noreferrer">Groq AI</a>
        {" · Hosted on Vercel"}
      </footer>
    </div>
  );
}