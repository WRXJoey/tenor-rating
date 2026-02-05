import React, { useEffect, useState } from "react";
import "../styles/Homepage.css";
import TopGifs from "../components/topGifs.jsx";

const Homepage = () => {

  return (
    <main className="page" aria-labelledby="homepage-title">
      <header className="hero">
        <div>
          <h1 id="homepage-title" className="title">
            Welcome to Tenor Before its Gone.
          </h1>
          <TopGifs />
        </div>
      </header>
    </main>
  );
};

export default Homepage;