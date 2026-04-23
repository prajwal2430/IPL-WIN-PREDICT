import { useNavigate } from 'react-router-dom';
import { FiZap, FiBarChart2, FiBrain, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import './Home.css';

const FEATURES = [
  { icon: <FiBrain size={22} />, title: 'Multi-Model ML', desc: '9 ML algorithms including LightGBM, XGBoost, Random Forest & more, compared in real-time.' },
  { icon: <FiBarChart2 size={22} />, title: 'Live Charts', desc: 'Beautiful win-probability pie charts and model comparison bar graphs powered by Recharts.' },
  { icon: <FiZap size={22} />, title: 'AI Commentary', desc: 'AI-generated ball-by-ball match commentary based on the current match situation.' },
  { icon: <FiTrendingUp size={22} />, title: 'Real-time Updates', desc: 'Update any input and instantly get recalculated predictions without page reload.' },
];

const TEAMS = [
  'CSK', 'MI', 'RCB', 'KKR', 'SRH', 'DC', 'RR', 'PBKS', 'GT', 'LSG',
];

const STATS = [
  { value: '9+', label: 'ML Models' },
  { value: '99.6%', label: 'Best Accuracy' },
  { value: '280K+', label: 'Training Rows' },
  { value: '17', label: 'IPL Seasons' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg-glow" />
        <div className="container hero-content">
          <div className="badge badge-purple hero-badge animate-fade-up">
            <FiZap size={12} /> Powered by LightGBM &amp; 8 more ML models
          </div>

          <h1 className="hero-title animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Predict IPL Match<br />
            <span className="gradient-text">Winners with AI</span>
          </h1>

          <p className="hero-subtitle animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Enter live match data — runs, wickets, overs — and get instant win-probability
            predictions powered by 9 machine-learning models trained on 17 seasons of IPL data.
          </p>

          <div className="hero-actions animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <button className="btn btn-primary btn-lg animate-pulse-glow" onClick={() => navigate('/predict')}>
              <FiZap /> Start Prediction
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/about')}>
              How It Works
            </button>
          </div>

          {/* Stats row */}
          <div className="hero-stats animate-fade-up" style={{ animationDelay: '0.4s' }}>
            {STATS.map(s => (
              <div className="hero-stat" key={s.label}>
                <span className="hero-stat-value gradient-text">{s.value}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TEAM TICKER ===== */}
      <div className="team-ticker-wrap">
        <div className="team-ticker">
          {[...TEAMS, ...TEAMS].map((t, i) => (
            <span key={i} className="ticker-item">{t}</span>
          ))}
        </div>
      </div>

      {/* ===== FEATURES ===== */}
      <section className="section container">
        <div className="text-center mb-6">
          <h2 className="section-title">Everything you need to<br /><span className="gradient-text">predict a winner</span></h2>
          <p className="section-subtitle">A full-stack ML-powered platform built for precision & speed.</p>
        </div>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div className="card feature-card animate-fade-up" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="section container">
        <div className="text-center mb-6">
          <h2 className="section-title">How It <span className="gradient-text">Works</span></h2>
        </div>
        <div className="steps-row">
          {[
            { step: '01', title: 'Enter Match Details', desc: 'Select teams, venue, toss info, current score, overs and wickets.' },
            { step: '02', title: 'ML Model Processes', desc: 'Flask API runs 9 ML models in parallel. LightGBM is recommended.' },
            { step: '03', title: 'See Predictions', desc: 'Get win probabilities, charts, AI commentary and model comparison.' },
          ].map((s, i) => (
            <div key={i} className="step-item animate-fade-up" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="step-num">{s.step}</div>
              <div className="step-body">
                <h4 className="step-title">{s.title}</h4>
                <p className="step-desc">{s.desc}</p>
              </div>
              {i < 2 && <div className="step-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section container">
        <div className="cta-card card animate-fade-up">
          <h2 className="section-title text-center">Ready to predict?</h2>
          <p className="section-subtitle text-center">Start making data-driven IPL predictions right now.</p>
          <div className="flex justify-center mt-6">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/predict')}>
              <FiZap /> Start Now — It's Free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
