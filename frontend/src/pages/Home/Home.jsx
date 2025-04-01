import logo from './logo.svg';
import './Home.css';

import MovieTable from '../../components/MovieTable/MovieTable'
import AddMovieForm from '../../components/AddMovieForm/AddMovieFom'
import { useState } from 'react';


function Home() {
  const [MovieList, SetMovieList] = useState([
    { title: "Macbeth" },
    { title: "Les oiseaux" },
    { title: "2001: L'odyssey de l'espace" },
  ])

  return (
    <div className="App">
      <AddMovieForm MovieList={MovieList} SetMovieList={SetMovieList} />
      <MovieTable MovieList={MovieList} />
    </div>
  );
}

export default Home;
