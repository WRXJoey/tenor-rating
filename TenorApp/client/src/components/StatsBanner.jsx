import { useState, useEffect } from "react";

export default function StatsBanner() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return null;

  const formatDay = (day) => {
    if (!day) return "—";
    return new Date(day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  };

  const items = [
    { label: "Total GIFs", value: stats.total_gifs.toLocaleString() },
    { label: "Total Users", value: stats.total_users.toLocaleString() },
    { label: "Most Active Day", value: formatDay(stats.most_active_day) },
    { label: "GIFs That Day", value: stats.most_active_day_count?.toLocaleString() ?? "—" },
  ];

  return (
    <div style={styles.banner}>
      {items.map(({ label, value }) => (
        <div key={label} style={styles.item}>
          <span style={styles.value}>{value}</span>
          <span style={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  );
}

const styles = {
  banner: {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: "16px",
    background: "#1e293b",
    borderRadius: "12px",
    padding: "20px 24px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
  },
  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  value: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#0ea5a4",
  },
  label: {
    fontSize: "12px",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
};
