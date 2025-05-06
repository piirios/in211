import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useMovieContext } from '../../context/MovieContext';
import './MoviePage.css';

function MoviePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { myMovieList, addMovie, removeMovie } = useMovieContext();
    const [userLists, setUserLists] = useState([]);
    const [showListsMenu, setShowListsMenu] = useState(false);
    const [listsLoading, setListsLoading] = useState(false);

    // État pour les commentaires
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [userComment, setUserComment] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(5);
    const [commentError, setCommentError] = useState(null);

    // Données mock pour le développement
    const mockLists = [
        { id: 1, name: "Films à voir" },
        { id: 2, name: "Films favoris" },
        { id: 3, name: "Films d'action" }
    ];

    const mockComments = [
        { id: 1, content: "Un chef-d'œuvre du cinéma !", score: 9, user: { firstname: "Thomas", lastname: "Dupont" } },
        { id: 2, content: "Très bon film, scénario captivant.", score: 8, user: { firstname: "Julie", lastname: "Martin" } },
        { id: 3, content: "Je recommande vivement.", score: 7, user: { firstname: "Pierre", lastname: "Durand" } }
    ];

    // Récupérer les détails du film depuis l'API TMDB
    useEffect(() => {
        const fetchMovieDetails = async () => {
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
                setError(null);
            } catch (error) {
                console.error('Erreur:', error);
                setError('Impossible de charger les détails du film');
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

    // Simuler le chargement des commentaires
    useEffect(() => {
        if (id) {
            setCommentsLoading(true);
            setTimeout(() => {
                setComments(mockComments);
                setCommentsLoading(false);
            }, 800);
        }
    }, [id]);

    // Simuler le chargement des listes
    useEffect(() => {
        if (showListsMenu) {
            setListsLoading(true);
            setTimeout(() => {
                setUserLists(mockLists);
                setListsLoading(false);
            }, 500);
        }
    }, [showListsMenu]);

    const handleAddToList = () => {
        if (!movie) return;
        setShowListsMenu(!showListsMenu);
    };

    const handleAddToSpecificList = async (listId) => {
        // Simuler l'ajout à une liste
        addMovie(movie);
        setShowListsMenu(false);
    };

    const handleCreateNewList = async () => {
        const listName = prompt('Nom de la nouvelle liste:');

        if (listName && listName.trim()) {
            // Simuler la création d'une liste
            const newListId = mockLists.length + 1;
            setUserLists([...userLists, { id: newListId, name: listName.trim() }]);
            addMovie(movie);
            setShowListsMenu(false);
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (!newComment.trim()) {
            setCommentError('Le commentaire ne peut pas être vide');
            return;
        }

        if (userComment) {
            // Simuler la mise à jour d'un commentaire existant
            setComments(comments.map(comment =>
                comment.id === userComment.id
                    ? { ...comment, content: newComment, score: rating }
                    : comment
            ));

            setUserComment({
                ...userComment,
                content: newComment,
                score: rating
            });
        } else {
            // Simuler l'ajout d'un nouveau commentaire
            const newCommentId = comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1;
            const newUserComment = {
                id: newCommentId,
                content: newComment,
                score: rating,
                user: { firstname: 'Vous', lastname: '' }
            };

            setComments([newUserComment, ...comments]);
            setUserComment(newUserComment);
        }

        setCommentError(null);
    };

    const handleDeleteComment = async () => {
        if (!userComment) return;

        if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre commentaire ?')) return;

        // Simuler la suppression d'un commentaire
        setComments(comments.filter(comment => comment.id !== userComment.id));
        setUserComment(null);
        setNewComment('');
        setRating(5);
        setCommentError(null);
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    if (loading) {
        return <div className="loading">Chargement...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    const isInList = movie ? Array.isArray(myMovieList) && myMovieList.some(m => m && m.id === movie.id) : false;

    return (
        <div className="movie-details-container">
            <button className="back-to-home" onClick={handleBackToHome}>
                <span className="back-arrow">&#8592;</span> Retour
            </button>

            {movie && (
                <div className="movie-details-content">
                    <div className="movie-poster-section">
                        {movie?.poster_path ? (
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                className="movie-details-poster"
                            />
                        ) : (
                            <div className="no-poster">Pas d'affiche disponible</div>
                        )}
                    </div>

                    <div className="movie-info-section">
                        <h1 className="movie-title">{movie?.title || "Titre inconnu"}</h1>

                        <div className="movie-meta">
                            {movie?.release_date && (
                                <div className="meta-item">
                                    <span className="meta-label">Année:</span>
                                    <span className="meta-value">{movie.release_date.substring(0, 4)}</span>
                                </div>
                            )}

                            {(movie?.runtime && movie.runtime > 0) && (
                                <div className="meta-item">
                                    <span className="meta-label">Durée:</span>
                                    <span className="meta-value">{movie.runtime} min</span>
                                </div>
                            )}

                            {(movie?.vote_average !== undefined) && (
                                <div className="meta-item">
                                    <span className="meta-label">Note:</span>
                                    <span className="meta-value">{parseFloat(movie.vote_average).toFixed(1)}/10</span>
                                </div>
                            )}
                        </div>

                        <div className="add-to-list-section">
                            <button
                                className="btn-add-to-list"
                                onClick={handleAddToList}
                            >
                                Ajouter à une liste
                            </button>

                            {showListsMenu && (
                                <div className="lists-dropdown movie-detail-dropdown">
                                    {listsLoading ? (
                                        <div className="dropdown-loading">Chargement...</div>
                                    ) : (
                                        <>
                                            <div className="dropdown-title">Choisir une liste:</div>
                                            {Array.isArray(userLists) && userLists.length > 0 ? (
                                                userLists.map(list => (
                                                    <button
                                                        key={list.id}
                                                        className="list-option"
                                                        onClick={() => handleAddToSpecificList(list.id)}
                                                    >
                                                        {list.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="no-lists">Aucune liste disponible</div>
                                            )}
                                            <button
                                                className="create-list-option"
                                                onClick={handleCreateNewList}
                                            >
                                                + Créer une nouvelle liste
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {movie?.genres && movie.genres.length > 0 && (
                            <div className="movie-genres">
                                <h3>Genres</h3>
                                <div className="genres-list">
                                    {movie.genres.map(genre => (
                                        <span key={genre.id} className="genre-tag">{genre.name}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="movie-synopsis">
                            <h2>Synopsis</h2>
                            <p>{movie?.overview || 'Aucun synopsis disponible.'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Section des commentaires */}
            <div className="comments-section">
                <h2>Commentaires</h2>

                {commentError && <div className="comment-error">{commentError}</div>}

                {/* Formulaire de commentaire */}
                <div className="comment-form-container">
                    <h3>{userComment ? 'Modifier votre avis' : 'Donnez votre avis'}</h3>
                    <form className="comment-form" onSubmit={handleSubmitComment}>
                        <div className="rating-container">
                            <label>Votre note:</label>
                            <div className="rating-input">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                                    <button
                                        key={val}
                                        type="button"
                                        className={`rating-btn ${val <= rating ? 'active' : ''}`}
                                        onClick={() => setRating(val)}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Partagez votre avis sur ce film..."
                            required
                        ></textarea>

                        <div className="comment-actions">
                            <button type="submit" className="btn-submit">
                                {userComment ? 'Mettre à jour' : 'Publier'}
                            </button>

                            {userComment && (
                                <button
                                    type="button"
                                    className="btn-delete"
                                    onClick={handleDeleteComment}
                                >
                                    Supprimer
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Liste des commentaires */}
                <div className="comments-list">
                    {commentsLoading ? (
                        <div className="comments-loading">Chargement des commentaires...</div>
                    ) : Array.isArray(comments) && comments.length === 0 ? (
                        <div className="no-comments">Aucun commentaire pour ce film</div>
                    ) : (
                        Array.isArray(comments) && comments.map(comment => (
                            <div key={comment.id} className="comment-card">
                                <div className="comment-header">
                                    <span className="comment-author">
                                        {comment.user ? `${comment.user.firstname || ''} ${comment.user.lastname || ''}` : 'Utilisateur inconnu'}
                                    </span>
                                    <span className="comment-score">
                                        Note: <strong>{comment.score}/10</strong>
                                    </span>
                                </div>
                                <div className="comment-content">
                                    {comment.content}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default MoviePage;