import { FiCpu, FiDatabase, FiLayers } from 'react-icons/fi';
import './About.css';

const MODELS = [
  { name: 'LightGBM', desc: 'Gradient boosting framework that uses tree-based learning algorithms. Optimized for speed and high performance.' },
  { name: 'Random Forest', desc: 'An ensemble learning method that operates by constructing a multitude of decision trees during training.' },
  { name: 'Logistic Regression', desc: 'A statistical model used for binary classification, providing a baseline for win probability.' },
  { name: 'XGBoost', desc: 'Extreme Gradient Boosting, known for its scalability and efficiency in machine learning competitions.' }
];

export default function About() {
  return (
    <div className="container section">
      <div className="text-center mb-8">
        <h1 className="section-title">About the <span className="gradient-text">Prediction Model</span></h1>
        <p className="section-subtitle">How we use historical data and machine learning to predict match outcomes.</p>
      </div>

      <div className="grid grid-3 mb-8">
        <div className="card text-center">
          <div className="feature-icon" style={{ margin: '0 auto 16px' }}><FiDatabase /></div>
          <h3>Dataset</h3>
          <p className="mt-2 text-secondary">Trained on ball-by-ball IPL data from 2008 to 2024, comprising over 280,000 unique deliveries.</p>
        </div>
        <div className="card text-center">
          <div className="feature-icon" style={{ margin: '0 auto 16px' }}><FiCpu /></div>
          <h3>Processing</h3>
          <p className="mt-2 text-secondary">Features like CRR, RRR, wickets in hand, and historical venue stats are calculated in real-time.</p>
        </div>
        <div className="card text-center">
          <div className="feature-icon" style={{ margin: '0 auto 16px' }}><FiLayers /></div>
          <h3>Ensemble</h3>
          <p className="mt-2 text-secondary">Our backend compares 9 different algorithms to ensure the most robust prediction possible.</p>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-6">Core Algorithms</h2>
        <div className="grid grid-2">
          {MODELS.map(m => (
            <div key={m.name} className="model-info-box">
              <h4 className="gradient-text">{m.name}</h4>
              <p className="text-secondary mt-2">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
