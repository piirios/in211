import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ListDetail.css';
import { useMovieContext } from '../../context/MovieContext';
import axios from 'axios';
import MovieTable from '../../components/MovieTable/MovieTable';

function ListDetail() {
    const { listId } = useParams();
    const navigate = useNavigate();
    const { userLists, removeMovie, loading: contextLoading, error: contextError } = useMovieContext();

    const [list, setList] = useState(null);
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Récupérer les détails de la liste et les films
    useEffect(() => {
        const fetchListDetails = async () => {
            if (!listId) return;

            setLoading(true);
            try {
                // Configurer axios pour le backend
                const apiClient = axios.create({
                    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Récupérer les films de la liste
                const response = await apiClient.get(`/movies/list/${listId}`);

                if (response.data && response.data.list) {
                    setList(response.data.list);
                    setMovies(response.data.movies || []);
                    setError(null);
                } else {
                    throw new Error("Format de réponse incorrect");
                }
            } catch (err) {
                console.error("Erreur lors du chargement de la liste:", err);

                // Si l'API échoue, essayer de récupérer les données du contexte
                const listFromContext = userLists.find(l => l.id === parseInt(listId));
                if (listFromContext) {
                    setList(listFromContext);
                    setMovies(listFromContext.movies || []);
                    setError(null);
                } else {
                    setError("Impossible de charger les détails de la liste");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchListDetails();
    }, [listId, userLists]);

    // Après avoir récupéré les films, enrichir avec TMDB si besoin
    useEffect(() => {
        // Si les films existent et n'ont pas de titre, on enrichit
        if (movies.length > 0 && !movies[0].title) {
            const fetchDetails = async () => {
                try {
                    const enriched = await Promise.all(
                        movies.map(async (movie) => {
                            // Si déjà enrichi, on ne refait pas l'appel
                            if (movie.title && movie.poster_path) return movie;
                            try {
                                const response = await fetch(
                                    `https://api.themoviedb.org/3/movie/${movie.id}?language=fr-FR`,
                                    {
                                        headers: {
                                            'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                                            'accept': 'application/json'
                                        }
                                    }
                                );
                                if (!response.ok) throw new Error('Erreur TMDB');
                                const data = await response.json();
                                return { ...movie, ...data };
                            } catch (err) {
                                return movie; // fallback : on garde l'id
                            }
                        })
                    );
                    setMovies(enriched);
                } catch (err) {
                    // ignore
                }
            };
            fetchDetails();
        }
    }, [movies]);

    // Gérer le retrait d'un film de la liste
    const handleRemoveMovie = async (movieId) => {
        try {
            await removeMovie(movieId, parseInt(listId));
            setMovies(prevMovies => prevMovies.filter(movie => movie.id !== movieId));
        } catch (err) {
            console.error("Erreur lors de la suppression du film:", err);
            alert("Impossible de retirer le film de la liste");
        }
    };

    // Naviguer vers la page détaillée d'un film
    const handleViewMovie = (movieId) => {
        navigate(`/movie/${movieId}`);
    };

    // Retourner à la page d'accueil
    const goBack = () => {
        navigate('/');
    };

    // Afficher un état de chargement
    if (loading || contextLoading) {
        return (
            <div className="list-detail-container">
                <div className="loading">Chargement...</div>
            </div>
        );
    }

    // Afficher un message d'erreur
    if (error || contextError) {
        return (
            <div className="list-detail-container">
                <div className="error-message">{error || contextError}</div>
                <button onClick={goBack} className="back-button">Retour à l'accueil</button>
            </div>
        );
    }

    // Afficher un message si la liste n'existe pas
    if (!list) {
        return (
            <div className="list-detail-container">
                <div className="error-message">Liste non trouvée</div>
                <button onClick={goBack} className="back-button">Retour à l'accueil</button>
            </div>
        );
    }

    return (
        <div className="list-detail-container">
            <div className="list-header">
                <button onClick={goBack} className="back-button">
                    ← Retour
                </button>
                <h1>{list.name}</h1>
            </div>

            {movies.length === 0 ? (
                <div className="empty-list">
                    <p>Cette liste ne contient aucun film.</p>
                    <button onClick={goBack} className="back-to-home">
                        Retour à l'accueil pour ajouter des films
                    </button>
                </div>
            ) : (
                <MovieTable MovieList={movies} listId={parseInt(listId)} />
            )}
        </div>
    );
}

export default ListDetail; 