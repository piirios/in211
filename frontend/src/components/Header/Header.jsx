import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <div className="Header-container">
      <div className="header-logo">
        <Link to="/">MovieApp</Link>
      </div>
      <nav className="header-nav">
        <ul>
          <li>
            <Link to="/">Accueil</Link>
          </li>
          <li>
            <Link to="/lists">Mes Listes</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Header;
