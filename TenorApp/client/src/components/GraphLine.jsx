import { useEffect, useRef, useState, useMemo } from "react";
import Chart from "chart.js/auto";

const RANGES = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "365d", days: 365 },
];

export default function GraphLine({ username = null }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    setRows(null);
    const url = username
      ? `/api/activity?days=${days}&username=${encodeURIComponent(username)}`
      : `/api/activity?days=${days}`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [days, username]);

  // Fill in the full date range so gaps show as 0, and format labels as "Mar 1"
  const chartData = useMemo(() => {
    if (!rows) return null;

    const countByDay = Object.fromEntries(
      rows.map((r) => [r.day.slice(0, 10), Number(r.count)])
    );
    const labels = [];
    const counts = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      labels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
      counts.push(countByDay[key] ?? 0);
    }
    return { labels, counts };
  }, [rows, days]);

  useEffect(() => {
    if (!chartData || !canvasRef.current) return;

    if (chartRef.current) chartRef.current.destroy();

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: "GIFs Posted",
            data: chartData.counts,
            borderColor: "#0ea5a4",
            backgroundColor: "rgba(14, 165, 164, 0.15)",
            borderWidth: 2,
            pointRadius: days <= 30 ? 3 : 1,
            pointBackgroundColor: "#0ea5a4",
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: {
              color: "#94a3b8",
              maxTicksLimit: days <= 30 ? 10 : 12,
              maxRotation: 0,
            },
          },
          y: {
            beginAtZero: true,
            grid: { color: "rgba(255,255,255,0.05)" },
            ticks: {
              color: "#94a3b8",
              precision: 0,
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [chartData]);

  const title = `Activity (Last ${days === 365 ? "Year" : `${days} Days`})`;

  if (error) return <div style={{ color: "#ef4444", fontSize: "14px" }}>{error}</div>;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>{title}</h2>
        <div style={styles.toggle}>
          {RANGES.map(({ label, days: d }) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{ ...styles.toggleBtn, ...(days === d ? styles.toggleBtnActive : {}) }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {loading
        ? <div style={styles.empty}>Loading...</div>
        : !chartData || chartData.counts.every(c => c === 0)
          ? <div style={styles.empty}>No data yet</div>
          : <canvas ref={canvasRef}></canvas>
      }
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
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: {
    margin: 0,
    fontSize: "25px",
    color: "#f1f5f9",
  },
  toggle: {
    display: "flex",
    gap: "6px",
  },
  toggleBtn: {
    background: "#334155",
    color: "#94a3b8",
    border: "none",
    padding: "4px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  toggleBtnActive: {
    background: "#0ea5a4",
    color: "#f1f5f9",
  },
  empty: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
    padding: "24px 0",
  },
};
