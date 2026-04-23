import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = '/api';

function App() {
  const [teams, setTeams] = useState([
    'Chennai Super Kings', 'Delhi Capitals', 'Gujarat Titans',
    'Kolkata Knight Riders', 'Lucknow Super Giants', 'Mumbai Indians',
    'Punjab Kings', 'Rajasthan Royals', 'Royal Challengers Bengaluru',
    'Sunrisers Hyderabad'
  ]);
  const [venues, setVenues] = useState([
    'Wankhede Stadium', 'Eden Gardens', 'M Chinnaswamy Stadium', 
    'MA Chidambaram Stadium', 'Arun Jaitley Stadium', 'Narendra Modi Stadium'
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState({ totalMatches: 0, totalTeams: 0 });

  const [form, setForm] = useState({
    batting_team: '',
    bowling_team: '',
    venue: '',
    toss_winner: '',
    toss_decision: 'field',
    runs_target: '',
    team_runs: '',
    team_wicket: '',
    team_balls: ''
  });

  useEffect(() => {
    axios.get(`${API_BASE}/meta/teams`)
      .then(res => { if (res.data && res.data.teams) setTeams(res.data.teams); })
      .catch(err => console.warn("Using fallback teams"));
      
    axios.get(`${API_BASE}/meta/venues`)
      .then(res => { if (res.data && res.data.venues) setVenues(res.data.venues); })
      .catch(err => console.warn("Using fallback venues"));

    axios.get(`${API_BASE}/matches/stats`)
      .then(res => { if (res.data) setStats(res.data); })
      .catch(err => console.warn("Stats unavailable"));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      let newState = { ...prev, [name]: value };
      if (name === 'batting_team' && value !== '' && value === prev.bowling_team) {
        newState.bowling_team = '';
      } else if (name === 'bowling_team' && value !== '' && value === prev.batting_team) {
        newState.batting_team = '';
      }
      return newState;
    });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!form.batting_team || !form.bowling_team || !form.venue || !form.runs_target || !form.team_runs) {
      alert("Please fill in all match details.");
      return;
    }

    setLoading(true);
    try {
      const target = Number(form.runs_target);
      const runs = Number(form.team_runs);
      const wickets = Number(form.team_wicket);
      const balls = Number(form.team_balls);

      const payload = {
        ...form,
        runs_target: target,
        team_runs: runs,
        team_wicket: wickets,
        team_balls: balls,
        runs_left: target - runs,
        balls_left: 120 - balls,
        wickets_left: 10 - wickets,
        crr: (runs * 6) / Math.max(balls, 1),
        rrr: ((target - runs) * 6) / Math.max(120 - balls, 1),
        toss_winner: form.toss_winner || form.batting_team
      };

      const res = await axios.post(`${API_BASE}/predict`, payload);
      const commRes = await axios.post(`${API_BASE}/meta/commentary`, {
        ...payload,
        batting_win_prob: res.data.batting_win_prob
      });
      
      setResult({ ...res.data, commentary: commRes.data.commentary });
    } catch (err) {
      alert("Error fetching prediction.");
    } finally {
      setLoading(false);
    }
  };

  // Helper for dynamic coloring
  const getProbColor = (prob) => (prob >= 50 ? 'var(--primary)' : 'var(--secondary)');

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">🏏</div>
          <span>IPL AI PREDICTOR</span>
        </div>
        <div className="badge">LIVE ANALYTICS ENGINE v2.0</div>
      </header>

      <main className="dashboard-grid">
        <aside className="glass-panel">
          <h3 className="section-title"><span>📋</span> Match Configuration</h3>
          <form onSubmit={handlePredict}>
            <div className="form-group">
              <label>Batting Team (Chasing)</label>
              <select name="batting_team" value={form.batting_team} onChange={handleChange} className="input-style">
                <option value="" disabled>Select Batting Team</option>
                {teams.filter(t => t !== form.bowling_team).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label>Bowling Team (Defending)</label>
              <select name="bowling_team" value={form.bowling_team} onChange={handleChange} className="input-style">
                <option value="" disabled>Select Bowling Team</option>
                {teams.filter(t => t !== form.batting_team).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Venue</label>
              <select name="venue" value={form.venue} onChange={handleChange} className="input-style">
                <option value="" disabled>Select Stadium</option>
                {venues.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div className="form-group">
                <label>Target</label>
                <input type="number" name="runs_target" value={form.runs_target} onChange={handleChange} className="input-style" placeholder="e.g. 180" />
              </div>
              <div className="form-group">
                <label>Runs Scored</label>
                <input type="number" name="team_runs" value={form.team_runs} onChange={handleChange} className="input-style" placeholder="e.g. 100" />
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div className="form-group">
                <label>Wickets</label>
                <input type="number" name="team_wicket" value={form.team_wicket} onChange={handleChange} className="input-style" max="10" placeholder="0-10" />
              </div>
              <div className="form-group">
                <label>Balls</label>
                <input type="number" name="team_balls" value={form.team_balls} onChange={handleChange} className="input-style" max="120" placeholder="0-120" />
              </div>
            </div>

            <button type="submit" className="btn-predict" disabled={loading}>
              {loading ? 'PROCESSING...' : 'RUN AI ANALYTICS'}
            </button>
          </form>
        </aside>

        <section className="dashboard-main">
          {!result ? (
            <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '2rem'}}>
              <div className="empty-state">
                <div style={{fontSize: '4rem', marginBottom: '1.5rem'}}>📊</div>
                <h2 style={{color: '#fff', marginBottom: '1rem'}}>Ready for Analysis</h2>
                <p>Configure the match parameters and initiate the AI engine to generate real-time winning probabilities.</p>
              </div>
              
              <div className="glass-panel" style={{animation: 'fadeInUp 1s ease-out'}}>
                <h3 className="section-title"><span>📈</span> Dataset Coverage</h3>
                <div className="stats-grid" style={{marginTop: '0'}}>
                  <div className="stat-item">
                    <span className="stat-label">Matches</span>
                    <span className="stat-value">{stats.totalMatches || '1097'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Teams</span>
                    <span className="stat-value">{stats.totalTeams || '10'}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Seasons</span>
                    <span className="stat-value">17</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Data Source</span>
                    <span className="stat-value" style={{fontSize: '0.8rem'}}>matches.csv</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="result-card">
              <div className="glass-panel" style={{position: 'relative', overflow: 'hidden'}}>
                {/* PREDICTED WINNER BADGE */}
                <div style={{
                  position: 'absolute', top: 0, right: 0, 
                  background: getProbColor(result.batting_win_prob),
                  padding: '10px 25px', color: '#fff', fontWeight: 900, fontSize: '0.8rem',
                  borderBottomLeftRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.1em'
                }}>
                  Winner: {result.batting_win_prob >= 50 ? result.batting_team : result.bowling_team}
                </div>

                <h3 className="section-title"><span>🎯</span> Win Probability</h3>
                
                <div className="prob-container" style={{marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem'}}>
                  {/* BATTING TEAM PERCENTAGE */}
                  <div className="team-info" style={{flex: 1, textAlign: 'left'}}>
                    <span className="team-name" style={{display: 'block', fontSize: '1.1rem'}}>{result.batting_team}</span>
                    <span style={{color: getProbColor(result.batting_win_prob), fontSize: '0.75rem', fontWeight: 700}}>
                      {result.batting_win_prob >= 50 ? 'WINNING' : 'LOSING'}
                    </span>
                    <div style={{fontSize: '4rem', fontWeight: 900, color: getProbColor(result.batting_win_prob), marginTop: '10px', letterSpacing: '-0.05em'}}>
                      {result.batting_win_prob}%
                    </div>
                  </div>

                  <div className="vs-badge">VS</div>

                  {/* BOWLING TEAM PERCENTAGE */}
                  <div className="team-info" style={{flex: 1, textAlign: 'right'}}>
                    <span className="team-name" style={{display: 'block', fontSize: '1.1rem'}}>{result.bowling_team}</span>
                    <span style={{color: getProbColor(result.bowling_win_prob), fontSize: '0.75rem', fontWeight: 700}}>
                      {result.bowling_win_prob >= 50 ? 'WINNING' : 'LOSING'}
                    </span>
                    <div style={{fontSize: '4rem', fontWeight: 900, color: getProbColor(result.bowling_win_prob), marginTop: '10px', letterSpacing: '-0.05em'}}>
                      {result.bowling_win_prob}%
                    </div>
                  </div>
                </div>

                <div className="progress-track" style={{margin: '2rem 0', background: 'rgba(255,255,255,0.05)'}}>
                  <div className="progress-bar" style={{ 
                    width: `${result.batting_win_prob}%`,
                    background: getProbColor(result.batting_win_prob)
                  }}></div>
                  <div className="progress-bar" style={{ 
                    width: `${result.bowling_win_prob}%`,
                    background: getProbColor(result.bowling_win_prob)
                  }}></div>
                </div>

                {/* WINNER CALLOUT */}
                <div style={{
                  textAlign: 'center', margin: '1rem 0', padding: '1rem',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid var(--border)'
                }}>
                  <p style={{fontSize: '1rem', fontWeight: 600}}>
                    <span style={{color: getProbColor(result.batting_win_prob >= 50 ? result.batting_win_prob : result.bowling_win_prob)}}>
                      {result.batting_win_prob >= 50 ? result.batting_team : result.bowling_team}
                    </span> is dominating the match analysis!
                  </p>
                </div>

                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Req Runs</span>
                    <span className="stat-value">{Number(form.runs_target) - Number(form.team_runs)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Balls Left</span>
                    <span className="stat-value">{120 - Number(form.team_balls)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">RRR</span>
                    <span className="stat-value">{result.match_summary.rrr}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">CRR</span>
                    <span className="stat-value">{result.match_summary.crr}</span>
                  </div>
                </div>

                <div className="commentary-box">
                  <div style={{fontWeight: 700, marginBottom: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span>🧠</span> AI STRATEGIC INSIGHT
                  </div>
                  <p>{result.commentary}</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
