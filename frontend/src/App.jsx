import { Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home/Home';
import MoviePage from './pages/Movie/MoviePage'
import Lists from './pages/Lists/Lists';
import ListDetail from './pages/ListDetail/ListDetail';
import './App.css';
import { Root } from './components/Root/Root';
import { MovieProvider } from './context/MovieContext';
//require('dotenv').config()


function App() {
  return (
    <MovieProvider>
      <Root>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MoviePage />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/list/:listId" element={<ListDetail />} />
        </Routes>
      </Root>
    </MovieProvider>
  );
}

export default App;
