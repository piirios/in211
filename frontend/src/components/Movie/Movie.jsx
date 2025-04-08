import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useMovieContext } from '../../context/MovieContext';
import "./Movie.css"


function Movie({ movie }) {
    const navigate = useNavigate();
    const { myMovieList, addMovie, removeMovie } = useMovieContext();

    const isInList = myMovieList.some(item => item.id === movie.id);

    const handleViewDetails = () => {
        navigate(`/movie/${movie.id}`);
    };

    const handleAddToList = (e) => {
        e.stopPropagation();
        if (!isInList) {
            addMovie(movie);
        } else {
            removeMovie(movie.id);
        }
    };

    return <div className="movie-card">
        <div className="movie-image-container">
            <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="movie-poster"
            />
            <div className="movie-overlay">
                <div className="movie-buttons">
                    <button
                        className="movie-btn btn-details"
                        onClick={handleViewDetails}
                    >
                        Voir détails
                    </button>

                    <button
                        className={`movie-btn ${isInList ? 'btn-remove' : 'btn-add'}`}
                        onClick={handleAddToList}
                    >
                        {isInList ? 'Retirer' : 'Ajouter'}
                    </button>
                </div>
            </div>
        </div>
    </div>
}

export default Movie;