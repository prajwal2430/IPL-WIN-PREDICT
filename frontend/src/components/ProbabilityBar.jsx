import './ProbabilityBar.css';

export default function ProbabilityBar({ team1, team2, prob1, prob2, winner }) {
  return (
    <div className="prob-bar-wrap animate-fade-up">
      <div className="prob-team-row">
        <div className={`prob-team ${winner === team1 ? 'winner' : ''}`}>
          <span className="prob-pct" style={{ color: '#6366f1' }}>{prob1}%</span>
          <span className="prob-name">{team1}</span>
          {winner === team1 && <span className="crown">🏆</span>}
        </div>
        <div className="prob-vs">VS</div>
        <div className={`prob-team prob-team-right ${winner === team2 ? 'winner' : ''}`}>
          {winner === team2 && <span className="crown">🏆</span>}
          <span className="prob-name">{team2}</span>
          <span className="prob-pct" style={{ color: '#ef4444' }}>{prob2}%</span>
        </div>
      </div>

      <div className="prob-bar-track">
        <div
          className="prob-bar-fill prob-bar-t1"
          style={{ width: `${prob1}%` }}
        />
        <div
          className="prob-bar-fill prob-bar-t2"
          style={{ width: `${prob2}%` }}
        />
      </div>
    </div>
  );
}
