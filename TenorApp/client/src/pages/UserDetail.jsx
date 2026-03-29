import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getRelativeTime } from "../utils/timeUtils.js";

export default function UserDetail() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/users/${encodeURIComponent(username)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setUserData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US");
  };

  const calculateAvgPostsPerDay = () => {
    if (!userData) return 0;
    const first = new Date(userData.first_post);
    const last = new Date(userData.last_post);
    const days = Math.max(1, Math.floor((last - first) / (1000 * 60 * 60 * 24)) + 1);
    return (userData.total_gifs / days).toFixed(2);
  };

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.loadingContainer}>Loading user data...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={styles.page}>
        <div style={styles.errorContainer}>
          <div style={styles.errorText}>Error: {error}</div>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </main>
    );
  }

  if (!userData) {
    return (
      <main style={styles.page}>
        <div style={styles.errorContainer}>
          <div style={styles.errorText}>User not found</div>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backButton} onClick={() => navigate(-1)}>
            ← Back
          </button>
          <h1 style={styles.username}>{userData.discord_username}</h1>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total GIFs</div>
            <div style={styles.statValue}>{userData.total_gifs}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>First Post</div>
            <div style={styles.statValue}>{formatDate(userData.first_post)}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Last Post</div>
            <div style={styles.statValue}>{formatDate(userData.last_post)}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Avg Posts/Day</div>
            <div style={styles.statValue}>{calculateAvgPostsPerDay()}</div>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Posting Timeline (Recent {(userData.all_posts ?? []).length})</h2>
          <div style={styles.timeline}>
            {(userData.all_posts ?? []).map((post) => (
              <div key={`${post.tenor_gif_id}-${post.posted_at}`} style={styles.timelineItem}>
                <div style={styles.timelineDot}></div>
                <div style={styles.timelineContent}>
                  <div style={styles.timelineDate}>
                    {formatDate(post.posted_at)} · {getRelativeTime(post.posted_at)}
                  </div>
                  <div style={styles.timelineId}>GIF #{post.tenor_gif_id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {(userData.favorite_gifs?.length ?? 0) > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Favorite GIFs ({userData.favorite_gifs.length})</h2>
            <div style={styles.gifGrid}>
              {userData.favorite_gifs.map((gif) => (
                <div key={gif.tenor_gif_id} style={styles.gifCard}>
                  <div style={styles.gifContainer}>
                    {gif.tenor_url && gif.tenor_url.match(/\.(mp4|webm)(\?|#|$)/i) ? (
                      <video
                        src={gif.tenor_url}
                        style={styles.gifMedia}
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={gif.tenor_url}
                        alt={`GIF ${gif.tenor_gif_id}`}
                        loading="lazy"
                        style={styles.gifMedia}
                      />
                    )}
                  </div>
                  <div style={styles.gifInfo}>
                    <span style={styles.postCount}>{gif.count}x posted</span>
                    <span style={styles.lastPosted}>{getRelativeTime(gif.last_posted)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

const styles = {
  page: {
    background: "#0f172a",
    minHeight: "100vh",
    padding: "20px",
    color: "#f1f5f9",
  },
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "40px",
  },
  backButton: {
    backgroundColor: "#334155",
    color: "#f1f5f9",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background-color 0.2s ease",
  },
  username: {
    fontSize: "32px",
    margin: "0",
    color: "#f1f5f9",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "40px",
  },
  statCard: {
    background: "#1e293b",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
  },
  statLabel: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#0ea5a4",
  },
  section: {
    marginBottom: "40px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#f1f5f9",
    margin: "0 0 20px 0",
  },
  timeline: {
    position: "relative",
    paddingLeft: "30px",
  },
  timelineItem: {
    position: "relative",
    marginBottom: "20px",
    display: "flex",
    gap: "16px",
  },
  timelineDot: {
    position: "absolute",
    left: "-30px",
    top: "4px",
    width: "12px",
    height: "12px",
    backgroundColor: "#0ea5a4",
    borderRadius: "50%",
    border: "2px solid #0f172a",
  },
  timelineContent: {
    background: "#1e293b",
    padding: "12px 16px",
    borderRadius: "8px",
    flex: 1,
  },
  timelineDate: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "4px",
  },
  timelineId: {
    fontSize: "14px",
    color: "#f1f5f9",
    fontWeight: "500",
  },
  gifGrid: {
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
  gifContainer: {
    position: "relative",
    width: "100%",
    paddingBottom: "100%",
  },
  gifMedia: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
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
  lastPosted: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
    fontSize: "16px",
    color: "#94a3b8",
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    minHeight: "400px",
  },
  errorText: {
    fontSize: "16px",
    color: "#ef4444",
  },
};
