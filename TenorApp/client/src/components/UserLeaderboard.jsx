import { useNavigate } from "react-router-dom";

export default function UserLeaderboard({ users, loading, error }) {
  const navigate = useNavigate();

  const renderUsername = (user) => (
    <button
      style={styles.usernameButton}
      onClick={() => navigate(`/user/${encodeURIComponent(user.discord_username)}`)}
    >
      {user.discord_username}
    </button>
  );

  if (loading) return <p>Loading leaderboard...</p>;
  if (error) return <p>Error: {error}</p>;
  if (users.length === 0) return (
    <div style={styles.card}>
      <h2 style={styles.title}>Top GIF Posters</h2>
      <div style={styles.empty}>No data yet</div>
    </div>
  );

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Top GIF Posters</h2>
      <div style={styles.leaderboard}>
        {users.map((user, idx) => (
          <div key={user.discord_username} style={styles.leaderboardItem}>
            <span style={styles.rank}>{idx + 1}.</span>
            {renderUsername(user)}
            <span style={styles.count}>{user.gif_count} GIF{user.gif_count !== 1 ? 's' : ''}</span>
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
  leaderboard: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  leaderboardItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "8px 12px",
    borderRadius: "8px",
    background: "#334155",
  },
  rank: {
    fontSize: "18px",
    fontWeight: "bold",
    minWidth: "40px",
  },
  usernameButton: {
    flex: 1,
    fontSize: "16px",
    color: "#0ea5a4",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0",
    textAlign: "left",
    fontWeight: "500",
    transition: "color 0.2s ease",
  },
  count: {
    fontSize: "14px",
    color: "#0ea5a4",
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
    padding: "24px 0",
  },
};
