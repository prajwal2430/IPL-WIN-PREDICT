import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiActivity } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();

  const links = [
    { to: '/',           label: 'Home' },
    { to: '/predict',    label: 'Predict' },
    { to: '/stats',      label: 'Stats' },
    { to: '/about',      label: 'About' },
  ];

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <FiActivity size={18} />
          </div>
          <span>IPL<span className="brand-accent">Predict</span></span>
        </Link>

        <div className="navbar-links">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link ${pathname === l.to ? 'active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <button className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
          {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
      </div>
    </nav>
  );
}
