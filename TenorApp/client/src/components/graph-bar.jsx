import { useEffect, useRef, useMemo } from "react";
import Chart from "chart.js/auto";
import { CHART_COLORS } from "./chartColors.js";

export default function GraphBar({ users, loading, error }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const chartData = useMemo(() =>
    users.length > 0
      ? { labels: users.map((u) => u.discord_username), counts: users.map((u) => u.gif_count) }
      : null,
  [users]);

  useEffect(() => {
    if (!chartData || !canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: "GIFs Posted",
            data: chartData.counts,
            backgroundColor: CHART_COLORS,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: "y",
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              color: "rgba(255, 255, 255, 0.1)",
            },
            ticks: {
              color: "#e2e8f0",
            },
          },
          y: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#e2e8f0",
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [chartData]);

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div style={{ color: "#ef4444", fontSize: "14px" }}>{error}</div>;
  if (!chartData) return (
    <div style={styles.card}>
      <h2 style={styles.title}>Top Posters (Bar)</h2>
      <div style={styles.empty}>No data yet</div>
    </div>
  );

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Top Posters (Bar)</h2>
      <div style={styles.chartContainer}>
        <canvas ref={canvasRef}></canvas>
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
  chartContainer: {
    height: "300px",
  },
  empty: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
    padding: "24px 0",
  },
};
