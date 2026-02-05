import React from "react";


export default function TopGifs() {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    fetch("/api/top-gifs")
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

  if (loading) return <p>Loading top GIFs...</p>;
  if (error) return <p>Error: {error}</p>;
  if (rows.length === 0) return <p>No GIFs Found :( </p>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h2>Recent GIFs</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
          <th style={{ textAlign: "center", padding: 8, borderBottom: "1px solid #ddd" }}>
            Discord User
          </th>
          <th style={{ textAlign: "center", padding: 8, borderBottom: "1px solid #ddd" }}>
            URL
          </th>
          <th style={{ textAlign: "center", padding: 8, borderBottom: "1px solid #ddd" }}>
            GIF
          </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
              <tr key={`${r.tenor_gif_id}-${r.discord_username}-${r.tenor_url}`}>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                  {r.discord_username}
                </td>

                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                  <a href={r.tenor_url} target="_blank" rel="noreferrer">
                    open
                  </a>
                </td>

              <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
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