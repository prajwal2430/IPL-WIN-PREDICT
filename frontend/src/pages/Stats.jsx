import { useState, useEffect } from 'react';
import { getPredictionHistory } from '../services/api';
import { FiHistory, FiClock } from 'react-icons/fi';

export default function Stats() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    getPredictionHistory().then(setHistory);
  }, []);

  return (
    <div className="container section">
      <div className="flex items-center gap-4 mb-8">
        <div className="feature-icon"><FiHistory /></div>
        <h1 className="section-title">Prediction <span className="gradient-text">History</span></h1>
      </div>

      <div className="card">
        {history.length === 0 ? (
          <p className="text-center text-muted py-8">No prediction history found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="w-full" style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  <th style={{ padding: '12px' }}>Match</th>
                  <th style={{ padding: '12px' }}>Winner</th>
                  <th style={{ padding: '12px' }}>Probability</th>
                  <th style={{ padding: '12px' }}><FiClock /> Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px' }}>
                      <span className="font-bold">{h.batting_team}</span> vs {h.bowling_team}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className="tag">{h.predicted_winner}</span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className="badge badge-green">{(h.batting_win_prob).toFixed(1)}%</span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {new Date(h.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
