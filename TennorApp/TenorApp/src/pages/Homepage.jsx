import React, { useEffect, useState } from "react";
import "../styles/Homepage.css";

const Homepage = () => {
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const hour = new Date().getHours();
    const txt =
      hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    setGreeting(txt);
  }, []);

  return (
    <main className="page" aria-labelledby="homepage-title">
      <header className="hero">
        <div>
          <h1 id="homepage-title" className="title">
            {greeting}, welcome to TenorApp
          </h1>
          <p className="lead">Showing the best GIFs on Michael.</p>
          <div className="cta-row">
            <button
              className="primary"
              onClick={() => window.scrollTo({ top: 400, behavior: "smooth" })}
            >
              Get started
            </button>
            <button
              className="ghost"
              onClick={() => alert("Open docs or onboarding flow")}
            >
              Learn more
            </button>
          </div>
        </div>
        <div className="illustration" aria-hidden="true">
          <span className="emoji">🎬</span>
        </div>
      </header>

      <section className="features" aria-label="Key features">
        <article className="card">
          <h3 className="card-title">Search GIFs</h3>
          <p className="card-text">
            Instant results with filters for mood, category, and size.
          </p>
        </article>

        <article className="card">
          <h3 className="card-title">Rate & Save</h3>
          <p className="card-text">
            Keep your favorites and build a personal collection.
          </p>
        </article>
      </section>
    </main>
  );
};

export default Homepage;