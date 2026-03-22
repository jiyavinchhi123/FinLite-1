import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import finliteLogo from "../FinLiteLogo.png";
import tutorialVideo from "../Tutorial.mp4";

const Landing = () => {
  const videoRef = useRef(null);
  const [aiText, setAiText] = useState("");
  const [aiDone, setAiDone] = useState(false);

  const handleVideoClick = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      video.currentTime = 0;
      if (video.requestFullscreen) {
        await video.requestFullscreen();
      }
      await video.play();
    } catch (err) {
      // If fullscreen is blocked, just play from start.
      try {
        video.currentTime = 0;
        await video.play();
      } catch (_) {
        // ignore
      }
    }
  };

  useEffect(() => {
    const fullText = "Received ₹5000 from client for website design";
    let index = 0;
    let typingTimer = null;
    let resetTimer = null;

    const type = () => {
      setAiText(fullText.slice(0, index));
      index += 1;
      if (index <= fullText.length) {
        typingTimer = setTimeout(type, 45);
      } else {
        setAiDone(true);
        resetTimer = setTimeout(() => {
          setAiText("");
          setAiDone(false);
          index = 0;
          type();
        }, 2000);
      }
    };

    type();
    return () => {
      if (typingTimer) clearTimeout(typingTimer);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="brand">
          <img src={finliteLogo} alt="FinLite" />
        </div>
        <div className="nav-actions">
          <Link className="btn ghost" to="/login">Log In</Link>
          <Link className="btn" to="/register">Register</Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-text hero-content">
          <p className="eyebrow">Built for real business owners</p>
          <h1>Manage your business money without knowing accounting</h1>
          <p className="subhead">
            Just tell us what happened in your business. We handle the tracking and reports
            automatically.
          </p>
          <div className="hero-actions">
            <Link className="btn" to="/login">Get Started</Link>
            <a className="btn ghost" href="#how-it-works">Watch Tutorial</a>
          </div>
          <div className="trust">
            <span>Trusted by growing shops, services, and local teams</span>
          </div>
        </div>
      </section>

      <section className="section problem">
        <h2>
          Running a business is hard. <span>Accounting shouldn't be.</span>
        </h2>
        <p className="problem-subhead">Most software is built for accountants, not you.</p>
        <ul className="bullet-grid">
          <li>
            <span className="problem-icon">?</span>
            <span>Confused by accounting terms?</span>
          </li>
          <li>
            <span className="problem-icon">?</span>
            <span>Not sure what reports mean?</span>
          </li>
          <li>
            <span className="problem-icon">?</span>
            <span>Software feels overwhelming?</span>
          </li>
          <li>
            <span className="problem-icon">?</span>
            <span>Hiring expert is expensive?</span>
          </li>
        </ul>
        <div className="problem-cta">
          <Link className="cta-link" to="/login">
            See how we simplify it <span className="cta-arrow">→</span>
          </Link>
        </div>
      </section>

      <section className="section solution">
        <div className="solution-text">
          <h2>
            Smart Business Finance Manager is built for <span>business owners</span>, not accountants.
          </h2>
          <p>
            Use everyday words to record Money In and Money Out. The system keeps everything organized
            in the background.
          </p>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <h3>Simple language interface</h3>
            <p>Capture money in and money out using words you already use.</p>
          </div>
          <div className="feature-card">
            <h3>AI powered automation</h3>
            <p>Let the system organize and classify entries automatically.</p>
          </div>
          <div className="feature-card">
            <h3>Automatic business insights</h3>
            <p>See clear summaries of how the business is performing.</p>
          </div>
          <div className="feature-card">
            <h3>Mobile friendly dashboard</h3>
            <p>Stay on top of your business from any device.</p>
          </div>
        </div>
      </section>

      <section className="section how" id="how-it-works">
        <div className="how-left">
          <h2>How it works</h2>
          <div className="video-frame">
            <video
              className="demo-video"
              ref={videoRef}
              src={tutorialVideo}
              poster="/demo-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              onClick={handleVideoClick}
            />
          </div>
          <p className="video-label">Tutorial video</p>
        </div>
        <div className="steps-list">
          <div className="step-item">
            <span className="step-number">01</span>
            <div>
              <h3>Tell the system what happened</h3>
              <p>Describe payments in simple words and move on.</p>
            </div>
          </div>
          <div className="step-item">
            <span className="step-number">02</span>
            <div>
              <h3>AI records it automatically</h3>
              <p>The system organizes the entry in the background.</p>
            </div>
          </div>
          <div className="step-item">
            <span className="step-number">03</span>
            <div>
              <h3>Dashboard shows your business health</h3>
              <p>Track money flow with a clear, simple view.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section ai">
        <div className="ai-grid">
          <div className="ai-copy">
            <h2>AI Advantage</h2>
            <p>Let AI do the heavy lifting so you can focus on running your business.</p>
            <ul className="ai-list">
              <li>Smart entries from short sentences</li>
              <li>Automatic insights on what is going well</li>
              <li>Financial predictions to plan the next month</li>
            </ul>
          </div>
          <div className="ai-demo">
            <div className="ai-demo-header">AI Smart Entry</div>
            <div className="ai-input">
              <span className="ai-placeholder">{aiText}</span>
              <span className="ai-cursor" />
            </div>
            <div className={`ai-output ${aiDone ? "show" : ""}`}>
              <div className="ai-row">
                <span>Entry Type</span>
                <strong>Income</strong>
              </div>
              <div className="ai-row">
                <span>Category</span>
                <strong>Services</strong>
              </div>
              <div className="ai-row">
                <span>Amount</span>
                <strong>₹5000</strong>
              </div>
            </div>
            <div className="ai-status">
              Processing<span className="ai-dots" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <h3>FinLite</h3>
            <p>Manage your business finances with clarity and confidence.</p>
          </div>
          <div className="footer-columns">
            <div className="footer-col">
              <h4>Product</h4>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
            <div className="footer-col">
              <h4>Resources</h4>
              <a href="#how-it-works">Tutorial</a>
              <a href="#">Help Center</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 FinLite. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
