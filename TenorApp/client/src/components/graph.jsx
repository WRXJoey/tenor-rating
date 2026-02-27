import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
//i regret this already

//TODO: make this look nice and not like a 5 year old made it in excel 1.4
export default function Graph() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState(null);

  // Fetch data
  useEffect(() => {
    fetch("/api/leaderboard?limit=10")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((users) => {
        const labels = users.map((u) => u.discord_username);
        const counts = users.map((u) => u.gif_count);
        setChartData({ labels, counts });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Graph error:", err.message);
        setError(`Failed to load chart data: ${err.message}`);
        setLoading(false);
      });
  }, []);

  // Create chart after canvas is rendered
  useEffect(() => {
    if (!chartData || !canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: "GIFs Posted",
            data: chartData.counts,
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
              "#FF6B9D",
              "#C9CBCF",
              "#00D9FF",
              "#FFB347",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: "right",
            labels: {
              font: { size: 11 },
              padding: 12,
              color: "#e2e8f0",
              usePointStyle: true,
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

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Top Posters</h2>
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
    maxWidth: "300px",
    margin: "0 auto",
  },
};
