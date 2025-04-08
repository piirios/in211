import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import './MoviePage.css';

function MoviePage() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);

    useEffect(() => {
        const fetchMovie = async () => {
            try {
                const response = await axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
                    params: {
                        language: 'fr-FR',
                    },
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                        'accept': 'application/json'
                    }
                });
                setMovie(response.data);
            } catch (error) {
                console.error('Erreur lors de la récupération du film:', error);
            }
        };

        fetchMovie();
    }, [id]);

    if (!movie) return <div className="loading">Chargement...</div>;

    return (
        <div className="movie-page">
            <div className="movie-hero" style={{
                backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
            }}>
                <div className="movie-hero-content">
                    <div className="movie-poster">
                        <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
                    </div>
                    <div className="movie-info">
                        <h1>{movie.title}</h1>
                        <div className="movie-meta">
                            <span className="release-date">{new Date(movie.release_date).getFullYear()}</span>
                            <span className="runtime">{movie.runtime} min</span>
                            <span className="rating">★ {movie.vote_average.toFixed(1)}</span>
                        </div>
                        <p className="tagline">{movie.tagline}</p>
                        <h2>Synopsis</h2>
                        <p className="overview">{movie.overview}</p>
                        <div className="genres">
                            {movie.genres.map(genre => (
                                <span key={genre.id} className="genre-tag">{genre.name}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MoviePage;