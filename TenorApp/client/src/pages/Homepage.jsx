import React, { useEffect, useState } from "react";
import "../styles/Homepage.css";
import TopGifs from "../components/topGifs.jsx";
import UserLeaderboard from "../components/UserLeaderboard.jsx";
import PopularGifs from "../components/PopularGifs.jsx";
import Graph from "../components/graph.jsx";

const Homepage = () => {

  return (
    <main className="page" aria-labelledby="homepage-title">
      <header className="hero">
        <div>
          <h1 id="homepage-title" className="title">
            Welcome to Tenor Before its Gone.
          </h1>
        </div>
      </header>

      <div className="stats-grid">
        <UserLeaderboard />
        <Graph />
        <PopularGifs />
      </div>

      <TopGifs />
    </main>
  );
};

export default Homepage;