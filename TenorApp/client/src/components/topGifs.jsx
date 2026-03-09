import React from "react";
import { getRelativeTime } from "../utils/timeUtils.js";

const PAGE_SIZE = 50;

export default function TopGifs() {
  const [open, setOpen] = React.useState(false);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [error, setError] = React.useState("");
  const [hasMore, setHasMore] = React.useState(true);

  React.useEffect(() => {
    if (!open || rows.length > 0) return;
    setLoading(true);
    fetch(`/api/top-gifs?limit=${PAGE_SIZE}&offset=0`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setRows(data);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open]);

  const loadMore = () => {
    setLoadingMore(true);
    fetch(`/api/top-gifs?limit=${PAGE_SIZE}&offset=${rows.length}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setRows((prev) => [...prev, ...data]);
        setHasMore(data.length === PAGE_SIZE);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingMore(false));
  };

  function isVideo(url) {
    return /\.(mp4|webm|webp|mov|m4v)(\?|#|$)/i.test(url); //im not even sure if tenor serves these but whatever, i think webm works
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", background: "#1e293b", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          borderRadius: open ? "12px 12px 0 0" : 12,
          borderBottom: open ? "1px solid #334155" : "none", //style slop
        }}
      >
        <h2 style={{ color: "#f1f5f9", margin: 0, fontSize: 20 }}>GIF Log</h2>
        <span style={{ color: "#94a3b8", fontSize: 20, transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▼
        </span>
      </button>

      {open && (
        <div style={{ padding: "0 24px 24px" }}>
          {loading && <p style={{ color: "#94a3b8" }}>Loading GIFs...</p>}
          {error && <p style={{ color: "#f87171" }}>Error: {error}</p>}
          {!loading && !error && rows.length === 0 && <p style={{ color: "#94a3b8" }}>No GIFs Found :(</p>}
          {rows.length > 0 && (
            <>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
                <thead>
                  <tr>
                    {["Discord User", "Posted", "URL", "GIF"].map((col) => (
                      <th key={col} style={{ textAlign: "center", padding: 8, borderBottom: "1px solid #334155", color: "#f1f5f9" }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td style={{ padding: 8, borderBottom: "1px solid #334155", color: "#f1f5f9" }}>
                        {r.discord_username}
                      </td>
                      <td style={{ padding: 8, borderBottom: "1px solid #334155", fontSize: "14px", color: "#94a3b8" }}>
                        {getRelativeTime(r.posted_at)}
                      </td>
                      <td style={{ padding: 8, borderBottom: "1px solid #334155" }}>
                        <a href={r.tenor_url} target="_blank" rel="noreferrer">
                          open
                        </a>
                      </td>
                      <td style={{ padding: 8, borderBottom: "1px solid #334155" }}>
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
              {hasMore && (
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    style={{ background: "#334155", color: "#f1f5f9", border: "none", padding: "8px 24px", borderRadius: 6, cursor: loadingMore ? "default" : "pointer", fontSize: 14 }}
                  >
                    {loadingMore ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
