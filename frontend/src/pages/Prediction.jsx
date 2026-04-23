import { useState, useEffect } from 'react';
import { getTeams, getVenues, predict, getCommentary } from '../services/api';
import { FiZap, FiBarChart2, FiInfo, FiMessageSquare, FiRefreshCw } from 'react-icons/fi';
import ProbabilityBar from '../components/ProbabilityBar';
import { WinProbChart, ModelComparisonChart } from '../components/Charts';
import './Prediction.css';

export default function Prediction() {
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [commentary, setCommentary] = useState('');
  const [loadingCommentary, setLoadingCommentary] = useState(false);

  const [form, setForm] = useState({
    batting_team: '',
    bowling_team: '',
    venue: '',
    toss_winner: '',
    toss_decision: 'field',
    runs_target: 180,
    team_runs: 100,
    team_wicket: 3,
    team_balls: 60,
    model: 'random_forest'
  });

  useEffect(() => {
    getTeams().then(setTeams);
    getVenues().then(setVenues);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      // Calculate derived features
      const runs_left = form.runs_target - form.team_runs;
      const balls_left = 120 - form.team_balls;
      const crr = (form.team_runs * 6) / Math.max(form.team_balls, 1);
      const rrr = (runs_left * 6) / Math.max(balls_left, 1);

      const payload = {
        ...form,
        runs_left,
        balls_left,
        wickets_left: 10 - form.team_wicket,
        crr,
        rrr
      };

      const data = await predict(payload);
      setResult(data);
      
      // Generate commentary
      setLoadingCommentary(true);
      const commData = await getCommentary({
        ...payload,
        batting_win_prob: data.batting_win_prob
      });
      setCommentary(commData.commentary);
      setLoadingCommentary(false);
    } catch (err) {
      console.error(err);
      alert("Prediction failed. Make sure Flask and Node servers are running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prediction-page container section">
      <div className="prediction-grid">
        {/* Left: Input Form */}
        <div className="prediction-form-card card animate-fade-up">
          <div className="flex items-center gap-2 mb-6">
            <div className="feature-icon"><FiZap /></div>
            <h2 className="section-title" style={{ fontSize: 24 }}>Match Configuration</h2>
          </div>

          <form onSubmit={handlePredict} className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Batting Team</label>
              <select name="batting_team" value={form.batting_team} onChange={handleChange} className="form-control" required>
                <option value="">Select Team</option>
                {teams.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Bowling Team</label>
              <select name="bowling_team" value={form.bowling_team} onChange={handleChange} className="form-control" required>
                <option value="">Select Team</option>
                {teams.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-group span-2">
              <label className="form-label">Venue / Stadium</label>
              <select name="venue" value={form.venue} onChange={handleChange} className="form-control" required>
                <option value="">Select Venue</option>
                {venues.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Toss Winner</label>
              <select name="toss_winner" value={form.toss_winner} onChange={handleChange} className="form-control" required>
                <option value="">Select Team</option>
                {teams.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Toss Decision</label>
              <select name="toss_decision" value={form.toss_decision} onChange={handleChange} className="form-control">
                <option value="bat">Bat</option>
                <option value="field">Field</option>
              </select>
            </div>

            <div className="separator span-2" style={{ margin: '12px 0' }}></div>

            <div className="form-group">
              <label className="form-label">Target Score</label>
              <input type="number" name="runs_target" value={form.runs_target} onChange={handleChange} className="form-control" min="1" max="300" />
            </div>

            <div className="form-group">
              <label className="form-label">Current Score</label>
              <input type="number" name="team_runs" value={form.team_runs} onChange={handleChange} className="form-control" min="0" max="300" />
            </div>

            <div className="form-group">
              <label className="form-label">Wickets Lost</label>
              <input type="number" name="team_wicket" value={form.team_wicket} onChange={handleChange} className="form-control" min="0" max="10" />
            </div>

            <div className="form-group">
              <label className="form-label">Balls Bowled</label>
              <input type="number" name="team_balls" value={form.team_balls} onChange={handleChange} className="form-control" min="1" max="119" />
            </div>

            <div className="form-group span-2">
              <label className="form-label">ML Model</label>
              <select name="model" value={form.model} onChange={handleChange} className="form-control">
                <option value="random_forest">Random Forest (Recommended)</option>
                <option value="xgboost">XGBoost</option>
                <option value="lgbm">LightGBM</option>
                <option value="logistic_regression">Logistic Regression</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-lg span-2 mt-4" disabled={loading}>
              {loading ? <FiRefreshCw className="spinner" style={{ width: 16, height: 16 }} /> : <FiZap />}
              {loading ? 'Predicting...' : 'Predict Winner'}
            </button>
          </form>
        </div>

        {/* Right: Results Display */}
        <div className="prediction-result-col">
          {!result ? (
            <div className="card empty-state-card animate-fade">
              <FiBarChart2 size={48} className="mb-4" style={{ color: 'var(--text-muted)' }} />
              <h3>Awaiting Match Details</h3>
              <p>Fill the form and click "Predict Winner" to see the probability analysis.</p>
            </div>
          ) : (
            <div className="result-content animate-fade">
              <div className="card mb-6">
                <ProbabilityBar 
                  team1={result.batting_team} 
                  team2={result.bowling_team}
                  prob1={result.batting_win_prob}
                  prob2={result.bowling_win_prob}
                  winner={result.predicted_winner}
                />
              </div>

              <div className="grid grid-2 mb-6">
                <div className="card chart-card">
                  <h4 className="mb-4 flex items-center gap-2"><FiBarChart2 /> Win Probability</h4>
                  <WinProbChart 
                    battingTeam={result.batting_team}
                    bowlingTeam={result.bowling_team}
                    batProb={result.batting_win_prob}
                    bowlProb={result.bowling_win_prob}
                  />
                </div>

                <div className="card summary-card">
                  <h4 className="mb-4 flex items-center gap-2"><FiInfo /> Match Situation</h4>
                  <div className="summary-grid">
                    <div className="sum-item">
                      <span className="sum-label">Runs Needed</span>
                      <span className="sum-val">{result.match_summary.runs_needed}</span>
                    </div>
                    <div className="sum-item">
                      <span className="sum-label">Balls Left</span>
                      <span className="sum-val">{result.match_summary.balls_left}</span>
                    </div>
                    <div className="sum-item">
                      <span className="sum-label">Required Rate</span>
                      <span className="sum-val">{result.match_summary.rrr}</span>
                    </div>
                    <div className="sum-item">
                      <span className="sum-label">Current Rate</span>
                      <span className="sum-val">{result.match_summary.crr}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card mb-6">
                <h4 className="mb-4 flex items-center gap-2"><FiMessageSquare /> AI Commentary</h4>
                {loadingCommentary ? (
                  <div className="flex items-center gap-2 text-muted">
                    <FiRefreshCw className="spinner" /> Generating analysis...
                  </div>
                ) : (
                  <p className="commentary-text">{commentary}</p>
                )}
              </div>

              <div className="card">
                <h4 className="mb-4 flex items-center gap-2"><FiBarChart2 /> Model Comparison</h4>
                <p className="section-subtitle mb-4" style={{ fontSize: 13 }}>See how different algorithms predict this match situation.</p>
                <ModelComparisonChart allProbs={result.all_model_probs} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
