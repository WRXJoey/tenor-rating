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

  if (loading) return <p>Loading top GIFs...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h2>Top GIFs</h2>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>GIF ID</th>
            <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>Uses</th>
            <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>URL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.tenor_gif_id}>
              <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{r.tenor_gif_id}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{r.uses}</td>
              <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                <a href={r.tenor_url} target="_blank" rel="noreferrer">
                  open
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}