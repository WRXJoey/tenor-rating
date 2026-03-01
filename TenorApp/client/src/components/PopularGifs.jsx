import React from "react";

export default function PopularGifs() {
  const [gifs, setGifs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    fetch("/api/popular-gifs?limit=5&min_posts=2")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setGifs(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function isVideo(url) {
    return /\.(mp4|webm)(\?|#|$)/i.test(url);
  }

  function isTrustedUrl(url) {
    if (!url?.startsWith('https://')) return false;
    return url.includes('tenor.com') || url.includes('media.tenor.com');
  }

  if (loading) return <p>Loading popular GIFs...</p>;
  if (error) return <p>Error: {error}</p>;
  if (gifs.length === 0) return null; // Don't show if no popular GIFs

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Most Popular GIFs</h2>
      <div style={styles.grid}>
        {gifs.map((gif) => (
          <div key={gif.tenor_gif_id} style={styles.gifCard}>
            {isTrustedUrl(gif.tenor_url) && (
              <>
                {isVideo(gif.tenor_url) ? (
                  <video
                    src={gif.tenor_url}
                    style={styles.media}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={gif.tenor_url}
                    alt="popular gif"
                    loading="lazy"
                    style={styles.media}
                  />
                )}
              </>
            )}
            <div style={styles.gifInfo}>
              <span style={styles.postCount}>Posted {gif.post_count}x</span>
              <span style={styles.posters}>
                by {gif.posters.length} user{gif.posters.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#1e293b",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
    marginBottom: "24px",
  },
  title: {
    margin: "0 0 16px 0",
    fontSize: "25px",
    color: "#f1f5f9",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "16px",
  },
  gifCard: {
    borderRadius: "8px",
    overflow: "hidden",
    border: "2px solid #0ea5a4",
    background: "#334155",
  },
  media: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    display: "block",
  },
  gifInfo: {
    padding: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  postCount: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#0ea5a4",
  },
  posters: {
    fontSize: "12px",
    color: "#94a3b8",
  },
};
