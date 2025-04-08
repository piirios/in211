import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home/Home';
import MoviePage from './pages/Movie/MoviePage'
import './App.css';
import { Root } from './components/Root/Root';
//require('dotenv').config()


function App() {
  return (
    <Root>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MoviePage />} />
      </Routes>
    </Root>
  );
}

export default App;
