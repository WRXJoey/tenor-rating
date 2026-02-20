import React from "react";

export default function UserLeaderboard() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    fetch("/api/leaderboard?limit=10")
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const getMedalEmoji = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}.`;
  };

  if (loading) return <p>Loading leaderboard...</p>;
  if (error) return <p>Error: {error}</p>;
  if (users.length === 0) return <p>No users found</p>;

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Top GIF Posters</h2>
      <div style={styles.leaderboard}>
        {users.map((user, idx) => (
          <div key={user.discord_username} style={styles.leaderboardItem}>
            <span style={styles.rank}>{getMedalEmoji(idx)}</span>
            <span style={styles.username}>{user.discord_username}</span>
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
    fontSize: "20px",
    color: "#f1f5f9",
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
  username: {
    flex: 1,
    fontSize: "16px",
    color: "#f1f5f9",
  },
  count: {
    fontSize: "14px",
    color: "#0ea5a4",
    fontWeight: "600",
  },
};
