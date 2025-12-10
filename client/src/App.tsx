import { useState, useEffect } from 'react';
import './App.css';

interface HealthCheckResponse {
  status: string;
  timestamp: string;
}

function App() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('http://localhost:3001/health');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setHealth(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch health status');
        setHealth(null);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="App">
      <h1>Full-Stack App</h1>
      <div className="status-container">
        <h2>Server Health</h2>
        {loading && <p>Loading...</p>}
        {error && <p className="error">Error: {error}</p>}
        {health && (
          <div className="health-status">
            <p>
              <strong>Status:</strong> {health.status}
            </p>
            <p>
              <strong>Timestamp:</strong> {health.timestamp}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
