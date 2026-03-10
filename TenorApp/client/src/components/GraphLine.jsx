import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

export default function GraphLine() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/activity")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((rows) => {
        const countByDay = Object.fromEntries(
          rows.map((r) => [r.day.slice(0, 10), Number(r.count)])
        );
        const labels = [];
        const counts = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          labels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
          counts.push(countByDay[key] ?? 0);
        }
        setChartData({ labels, counts });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

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
            pointRadius: 3,
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
              maxTicksLimit: 10,
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

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div style={{ color: "#ef4444", fontSize: "14px" }}>{error}</div>;
  if (!chartData || chartData.labels.length === 0) return (
    <div style={styles.card}>
      <h2 style={styles.title}>Activity (Last 30 Days)</h2>
      <div style={styles.empty}>No data yet</div>
    </div>
  );

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Activity (Last 30 Days)</h2>
      <canvas ref={canvasRef}></canvas>
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
  empty: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
    padding: "24px 0",
  },
};
