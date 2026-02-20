import React from "react";
import { getRelativeTime } from "../utils/timeUtils.js";


export default function TopGifs() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    fetch("/api/top-gifs?limit=50")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setRows(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function isVideo(url) {
    return /\.(mp4|webm)(\?|#|$)/i.test(url);
  }

  if (loading) return <p>Loading GIFs...</p>;
  if (error) return <p>Error: {error}</p>;
  if (rows.length === 0) return <p>No GIFs Found :( </p>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, background: "#1e293b", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
      <h2 style={{ color: "#f1f5f9", marginTop: 0 }}>Recent GIFs</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
          <th style={{ textAlign: "center", padding: 8, borderBottom: "1px solid #334155", color: "#f1f5f9" }}>
            Discord User
          </th>
          <th style={{ textAlign: "center", padding: 8, borderBottom: "1px solid #334155", color: "#f1f5f9" }}>
            Posted
          </th>
          <th style={{ textAlign: "center", padding: 8, borderBottom: "1px solid #334155", color: "#f1f5f9" }}>
            URL
          </th>
          <th style={{ textAlign: "center", padding: 8, borderBottom: "1px solid #334155", color: "#f1f5f9" }}>
            GIF
          </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: 8, borderBottom: "1px solid #1e293b", color: "#f1f5f9" }}>
                  {r.discord_username}
                </td>

                <td style={{ padding: 8, borderBottom: "1px solid #1e293b", fontSize: "14px", color: "#94a3b8" }}>
                  {getRelativeTime(r.posted_at)}
                </td>

                <td style={{ padding: 8, borderBottom: "1px solid #1e293b" }}>
                  <a href={r.tenor_url} target="_blank" rel="noreferrer">
                    open
                  </a>
                </td>

              <td style={{ padding: 8, borderBottom: "1px solid #1e293b" }}>
                {isVideo(r.tenor_url) ? (
                  <video
                    src={r.tenor_url}
                    style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8 }}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={r.tenor_url}
                    alt="gif"
                    loading="lazy"
                    style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8 }}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}