import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

export default function Graph() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/popular-gifs?limit=10")
      .then((res) => res.json())
      .then((gifs) => {
        const labels = gifs.map((g) => `${g.tenor_gif_id}`);
        const counts = gifs.map((g) => g.post_count);

        if (chartRef.current) {
          chartRef.current.destroy();
        }

        const ctx = canvasRef.current.getContext("2d");
        chartRef.current = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels,
            datasets: [
              {
                label: "Post Count",
                data: counts,
                backgroundColor: [
                  "#FF6384",
                  "#36A2EB",
                  "#FFCE56",
                  "#4BC0C0",
                  "#9966FF",
                  "#FF9F40",
                  "#FF6384",
                  "#C9CBCF",
                  "#4BC0C0",
                  "#FF6384",
                ],
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  font: { size: 11 },
                  padding: 10,
                },
              },
            },
          },
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  if (loading) return <div>Loading chart...</div>;

  return (
    <div style={{ maxWidth: "300px", margin: "0 auto" }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
