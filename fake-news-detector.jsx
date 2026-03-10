import { useState, useEffect, useRef } from "react";

const SYSTEM_PROMPT = `You are a fake news detection AI trained on thousands of news articles. Analyze the provided news article text and determine if it is REAL or FAKE news.

Respond ONLY with a JSON object in this exact format (no markdown, no backticks):
{
  "verdict": "FAKE" or "REAL",
  "confidence": <number between 0.5 and 0.99>,
  "reasoning": "<2-3 sentence explanation of key signals>",
  "signals": [
    { "label": "<signal name>", "value": "<short description>", "flag": "red" or "green" or "yellow" }
  ],
  "credibility_score": <integer 0-100>
}

Provide exactly 4 signals. Signals should be: Emotional Language, Source Credibility, Factual Consistency, Writing Quality.
Base your analysis on: sensationalist language, logical inconsistencies, emotional manipulation, extraordinary unverified claims, credible sourcing, journalistic standards, and factual plausibility.`;

const SAMPLE_ARTICLES = [
  {
    label: "Suspicious Article",
    text: `SHOCKING: Scientists REFUSE to tell you the truth about 5G towers! Government insiders have leaked classified documents proving that 5G radiation is being used to control human behavior. Thousands of birds are dying EVERY DAY near cell towers, and the mainstream media WON'T REPORT IT. Share this before it gets deleted! Anonymous sources within the CDC have confirmed a massive cover-up is underway. This is the biggest scandal of the century and they're hiding it from YOU!`,
  },
  {
    label: "Credible Article",
    text: `Researchers at Stanford University have published a new study in the journal Nature Climate Change showing that global average temperatures rose by 1.1°C above pre-industrial levels in 2023. The study, which analyzed data from over 10,000 weather stations worldwide, indicates that the pace of warming has accelerated in the past decade. Lead author Dr. Sarah Chen noted that while the findings align with existing climate models, the rate of change in polar regions exceeded previous projections. The research has been peer-reviewed and independently verified by teams at MIT and Oxford.`,
  },
];

export default function FakeNewsDetector() {
  const [articleText, setArticleText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [glitchActive, setGlitchActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const glitch = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 4000);
    return () => clearInterval(glitch);
  }, []);

  const analyzeArticle = async () => {
    if (!articleText.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    setScanProgress(0);

    intervalRef.current = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 92) { clearInterval(intervalRef.current); return 92; }
        return p + Math.random() * 8;
      });
    }, 200);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Analyze this article:\n\n${articleText}` }],
        }),
      });

      const data = await response.json();
      const raw = data.content?.map(b => b.text || "").join("") || "";
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      clearInterval(intervalRef.current);
      setScanProgress(100);
      setTimeout(() => setResult(parsed), 400);
    } catch (e) {
      clearInterval(intervalRef.current);
      setError("Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const flagColor = (flag) => {
    if (flag === "red") return "#ff3b3b";
    if (flag === "green") return "#00e676";
    return "#ffd600";
  };

  const flagBg = (flag) => {
    if (flag === "red") return "rgba(255,59,59,0.1)";
    if (flag === "green") return "rgba(0,230,118,0.1)";
    return "rgba(255,214,0,0.1)";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      fontFamily: "'Courier New', monospace",
      color: "#e8e0d0",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        textarea:focus { border-color: #2a2a2a !important; }
        textarea::placeholder { color: #333; }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; }
      `}</style>

      {/* Scanline overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
      }} />

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <header style={{ borderBottom: "3px double #2a2a2a", paddingBottom: 20, marginBottom: 36, textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: 6, color: "#444", marginBottom: 8, textTransform: "uppercase" }}>
            Vol. MMXXVI &nbsp;·&nbsp; AI-Powered Truth Engine &nbsp;·&nbsp; NLP Edition
          </div>
          <h1 style={{
            fontSize: "clamp(42px, 8vw, 80px)",
            fontFamily: "'Georgia', serif",
            fontWeight: 900,
            letterSpacing: "-3px",
            margin: 0,
            lineHeight: 1,
            color: "#f0e8d8",
            filter: glitchActive ? "blur(0.5px)" : "none",
            transition: "filter 0.05s",
          }}>
            <span style={{ color: "#ff3b3b" }}>TRUTH</span>SCAN
          </h1>
          <div style={{ fontSize: 11, letterSpacing: 4, color: "#444", marginTop: 8, textTransform: "uppercase" }}>
            ── Fake News Detection System ──
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 12 }}>
            {["NLP Preprocessing", "Transformer Model", "Confidence Scoring"].map(t => (
              <div key={t} style={{ fontSize: 9, color: "#333", letterSpacing: 1, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 5, height: 5, background: "#ff3b3b", borderRadius: "50%" }} />
                {t}
              </div>
            ))}
          </div>
        </header>

        {/* Sample buttons */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#444", letterSpacing: 2, textTransform: "uppercase" }}>Load sample:</span>
          {SAMPLE_ARTICLES.map((s, i) => (
            <button key={i} onClick={() => { setArticleText(s.text); setResult(null); setError(null); }}
              style={{
                background: "transparent", border: "1px solid #222", color: "#555",
                padding: "5px 12px", cursor: "pointer", fontSize: 10, letterSpacing: 1,
                fontFamily: "'Courier New', monospace", textTransform: "uppercase",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.target.style.borderColor = "#ff3b3b"; e.target.style.color = "#ff3b3b"; }}
              onMouseLeave={e => { e.target.style.borderColor = "#222"; e.target.style.color = "#555"; }}
            >{s.label}</button>
          ))}
        </div>

        {/* Input Area */}
        <div style={{ position: "relative", marginBottom: 16 }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #ff3b3b 0%, #ff3b3b 30%, transparent 100%)" }} />
          <textarea
            value={articleText}
            onChange={e => { setArticleText(e.target.value); setResult(null); setError(null); }}
            placeholder="Paste your news article here for analysis..."
            rows={8}
            style={{
              width: "100%", background: "#0d0d0d", border: "1px solid #1e1e1e",
              borderTop: "none", color: "#c8c0b0", padding: "20px",
              fontFamily: "'Courier New', monospace", fontSize: 13, lineHeight: 1.9,
              resize: "vertical", outline: "none", boxSizing: "border-box",
              caretColor: "#ff3b3b",
            }}
          />
          <div style={{ position: "absolute", bottom: 12, right: 16, fontSize: 9, color: "#2a2a2a", letterSpacing: 1 }}>
            {articleText.length} CHARS
          </div>
        </div>

        {/* Analyze Button */}
        <button
          onClick={analyzeArticle}
          disabled={isAnalyzing || !articleText.trim()}
          style={{
            width: "100%", padding: "18px", 
            background: isAnalyzing ? "#100000" : (!articleText.trim() ? "#111" : "#ff3b3b"),
            border: isAnalyzing ? "1px solid #ff3b3b" : "none",
            color: isAnalyzing ? "#ff3b3b" : (!articleText.trim() ? "#333" : "#0a0a0a"),
            fontSize: 12, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase",
            fontFamily: "'Courier New', monospace", cursor: isAnalyzing ? "wait" : (!articleText.trim() ? "default" : "pointer"),
            transition: "all 0.3s", position: "relative", overflow: "hidden",
          }}
        >
          {isAnalyzing ? (
            <span>
              ▓▓▓ SCANNING &nbsp;
              {Math.round(scanProgress)}% COMPLETE
              <span style={{ animation: "blink 0.8s infinite" }}>█</span>
            </span>
          ) : "► RUN TRUTH ANALYSIS"}
          {isAnalyzing && (
            <div style={{
              position: "absolute", left: 0, bottom: 0, height: 2,
              width: `${scanProgress}%`, background: "#ff3b3b",
              transition: "width 0.2s ease", boxShadow: "0 0 8px #ff3b3b",
            }} />
          )}
        </button>

        {error && (
          <div style={{ marginTop: 16, padding: "12px 16px", border: "1px solid #ff3b3b33", color: "#ff3b3b", fontSize: 11, letterSpacing: 1 }}>
            ⚠ {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ marginTop: 40, animation: "fadeIn 0.6s ease" }}>

            {/* Verdict Banner */}
            <div style={{
              border: `1px solid ${result.verdict === "FAKE" ? "#ff3b3b" : "#00e676"}`,
              background: result.verdict === "FAKE" ? "rgba(255,59,59,0.06)" : "rgba(0,230,118,0.06)",
              padding: "28px 32px", marginBottom: 20, position: "relative",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: result.verdict === "FAKE"
                  ? "linear-gradient(90deg, #ff3b3b 0%, transparent 100%)"
                  : "linear-gradient(90deg, #00e676 0%, transparent 100%)",
              }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 10, color: "#444", letterSpacing: 4, marginBottom: 4, textTransform: "uppercase" }}>Verdict</div>
                  <div style={{
                    fontSize: "clamp(48px, 9vw, 80px)", fontFamily: "'Georgia', serif",
                    fontWeight: 900, letterSpacing: -3, lineHeight: 1,
                    color: result.verdict === "FAKE" ? "#ff3b3b" : "#00e676",
                  }}>
                    {result.verdict}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: "#444", letterSpacing: 4, marginBottom: 4, textTransform: "uppercase" }}>Confidence</div>
                  <div style={{ fontSize: 52, fontWeight: 700, color: "#e8e0d0", lineHeight: 1, letterSpacing: -2 }}>
                    {Math.round(result.confidence * 100)}<span style={{ fontSize: 22, color: "#444" }}>%</span>
                  </div>
                  <div style={{ width: 130, height: 3, background: "#1a1a1a", marginTop: 10, marginLeft: "auto" }}>
                    <div style={{
                      height: "100%", width: `${result.confidence * 100}%`,
                      background: result.verdict === "FAKE" ? "#ff3b3b" : "#00e676",
                      boxShadow: `0 0 8px ${result.verdict === "FAKE" ? "#ff3b3b" : "#00e676"}`,
                      transition: "width 1.2s ease",
                    }} />
                  </div>
                </div>
              </div>

              {/* Credibility bar */}
              <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #1a1a1a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: "#444", letterSpacing: 2, textTransform: "uppercase" }}>Credibility Score</span>
                  <span style={{ fontSize: 10, color: "#666", letterSpacing: 1 }}>{result.credibility_score} / 100</span>
                </div>
                <div style={{ height: 8, background: "#111", position: "relative", borderRadius: 1 }}>
                  <div style={{
                    height: "100%",
                    width: `${result.credibility_score}%`,
                    background: result.credibility_score > 60
                      ? "linear-gradient(90deg, #ff9800, #00e676)"
                      : "linear-gradient(90deg, #ff3b3b, #ff9800)",
                    transition: "width 1.4s cubic-bezier(0.4,0,0.2,1)",
                    borderRadius: 1,
                  }} />
                  {[25, 50, 75].map(m => (
                    <div key={m} style={{ position: "absolute", top: 0, left: `${m}%`, width: 1, height: "100%", background: "#0a0a0a" }} />
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  {["Unreliable", "Questionable", "Mixed", "Credible"].map(l => (
                    <span key={l} style={{ fontSize: 8, color: "#2a2a2a", letterSpacing: 0.5, textTransform: "uppercase" }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <div style={{ border: "1px solid #1a1a1a", padding: "20px 24px", marginBottom: 20, background: "#0c0c0c" }}>
              <div style={{ fontSize: 9, color: "#444", letterSpacing: 4, marginBottom: 12, textTransform: "uppercase" }}>── AI Reasoning ──</div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 2, color: "#998f80", fontStyle: "italic" }}>
                "{result.reasoning}"
              </p>
            </div>

            {/* Signals Grid */}
            <div style={{ fontSize: 9, color: "#444", letterSpacing: 4, marginBottom: 12, textTransform: "uppercase" }}>
              ── Detection Signals ──
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 10, marginBottom: 28 }}>
              {result.signals?.map((s, i) => (
                <div key={i} style={{
                  border: `1px solid ${flagColor(s.flag)}22`,
                  background: flagBg(s.flag),
                  padding: "14px 16px",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, width: 2, height: "100%",
                    background: flagColor(s.flag),
                    boxShadow: `0 0 6px ${flagColor(s.flag)}`,
                  }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ fontSize: 9, color: "#444", letterSpacing: 1, textTransform: "uppercase", lineHeight: 1.4 }}>{s.label}</div>
                    <div style={{
                      width: 7, height: 7, borderRadius: "50%", flexShrink: 0, marginLeft: 6,
                      background: flagColor(s.flag),
                      boxShadow: `0 0 8px ${flagColor(s.flag)}`,
                      animation: s.flag === "red" ? "pulse 1.5s ease infinite" : "none",
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#a09080", lineHeight: 1.6 }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 24 }}>
              {[["red","High Risk"], ["yellow","Caution"], ["green","Positive"]].map(([f, l]) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: "#333", letterSpacing: 1, textTransform: "uppercase" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: flagColor(f), boxShadow: `0 0 4px ${flagColor(f)}` }} />
                  {l}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ borderTop: "1px solid #111", paddingTop: 14, fontSize: 9, color: "#222", letterSpacing: 1, textAlign: "center" }}>
              TRUTHSCAN AI — POWERED BY CLAUDE NLP · INFORMATIONAL PURPOSES ONLY · ALWAYS VERIFY INDEPENDENTLY
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
