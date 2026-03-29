import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) navigate(`/user/${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        placeholder="Look up a user..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.input}
      />
      <button type="submit" style={styles.button}>Go</button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    maxWidth: "360px",
  },
  input: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#f1f5f9",
    fontSize: "14px",
  },
  button: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    background: "#0ea5a4",
    color: "#f1f5f9",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
