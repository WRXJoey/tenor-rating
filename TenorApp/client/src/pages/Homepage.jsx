import { useState, useEffect } from "react";
import "../styles/Homepage.css";
import TopGifs from "../components/topGifs.jsx";
import UserLeaderboard from "../components/UserLeaderboard.jsx";
import PopularGifs from "../components/PopularGifs.jsx";
import Graph from "../components/graph.jsx";
import GraphBar from "../components/graph-bar.jsx";
import GraphLine from "../components/GraphLine.jsx";
import StatsBanner from "../components/StatsBanner.jsx";

const Homepage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/leaderboard?limit=10")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page" aria-labelledby="homepage-title">

      <header className="hero">
        <div>
          <h1 id="homepage-title" className="title">
            Welcome to Tenor Before its Gone.
          </h1>
          <StatsBanner />
        </div>
      </header>

      <div className="stats-grid">
        <UserLeaderboard users={users} loading={loading} error={error} />
        <Graph users={users} loading={loading} error={error} />
        <div className="bar-centered">
          <GraphBar users={users} loading={loading} error={error} />
        </div>
        <div className="full-centered">
          <PopularGifs />
        </div>
      </div>

      <GraphLine />

      <TopGifs />
    </main>
  );
};

export default Homepage;
