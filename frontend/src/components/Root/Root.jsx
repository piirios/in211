import './Root.css';
import Header from '../Header/Header';

export function Root({ children }) {
  return (
    <div className="root-container">
      <Header />
      <div className="content-container">
        {children}
      </div>
    </div>
  );
}
