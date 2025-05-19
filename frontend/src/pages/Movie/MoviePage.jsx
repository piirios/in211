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
    const { myMovieList, userLists, userId, addMovie, removeMovie, createList } = useMovieContext();
    const [showListsMenu, setShowListsMenu] = useState(false);
    const [listsLoading, setListsLoading] = useState(false);

    // État pour les commentaires
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [userComment, setUserComment] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(5);
    const [commentError, setCommentError] = useState(null);

    // Configuration d'axios pour le backend
    const apiClient = axios.create({
        baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
        headers: {
            'Content-Type': 'application/json'
        }
    });

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

                // Sauvegarder les informations du film dans notre base de données
                try {
                    await apiClient.post('/movies/save', {
                        id: response.data.id,
                        title: response.data.title,
                        poster_path: response.data.poster_path
                    });
                } catch (err) {
                    console.error("Erreur lors de la sauvegarde du film:", err);
                }

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

    // Charger les commentaires depuis le backend
    useEffect(() => {
        if (id) {
            setCommentsLoading(true);

            const fetchComments = async () => {
                try {
                    const response = await apiClient.get(`/comment/movie/${id}`);
                    setComments(response.data.comments || []);

                    // Vérifier si l'utilisateur actuel a déjà un commentaire
                    if (userId && response.data.comments) {
                        const userExistingComment = response.data.comments.find(
                            comment => comment.user && comment.user.id === userId
                        );

                        if (userExistingComment) {
                            setUserComment(userExistingComment);
                            setNewComment(userExistingComment.content);
                            setRating(userExistingComment.score);
                        }
                    }

                    setCommentError(null);
                } catch (err) {
                    console.error("Erreur lors du chargement des commentaires:", err);
                    setCommentError("Impossible de charger les commentaires");
                } finally {
                    setCommentsLoading(false);
                }
            };

            fetchComments();
        }
    }, [id, userId]);

    const handleAddToList = () => {
        if (!movie) return;
        setShowListsMenu(!showListsMenu);
    };

    const handleAddToSpecificList = async (listId) => {
        try {
            await addMovie(movie, listId);
            setShowListsMenu(false);
            alert(`Film ajouté à la liste avec succès`);
        } catch (err) {
            console.error("Erreur lors de l'ajout du film à la liste:", err);
        }
    };

    const handleCreateNewList = async () => {
        const listName = prompt('Nom de la nouvelle liste:');

        if (listName && listName.trim()) {
            try {
                const newListId = await createList(listName.trim());
                if (newListId) {
                    await addMovie(movie, newListId);
                    alert(`Film ajouté à la nouvelle liste "${listName.trim()}"`);
                }
                setShowListsMenu(false);
            } catch (err) {
                console.error("Erreur lors de la création de la liste:", err);
            }
        }
    };

    const handleSubmitComment = async (e) => {
        e.preventDefault();

        if (!newComment.trim()) {
            setCommentError('Le commentaire ne peut pas être vide');
            return;
        }

        try {
            if (userComment) {
                // Mise à jour d'un commentaire existant
                const response = await apiClient.put(`/comment/${userComment.id}`, {
                    content: newComment,
                    score: rating
                });

                // Mettre à jour l'état local avec les données mises à jour
                const updatedComment = response.data;
                setComments(comments.map(comment =>
                    comment.id === userComment.id ? updatedComment : comment
                ));
                setUserComment(updatedComment);

            } else {
                // Création d'un nouveau commentaire
                const response = await apiClient.post('/comment', {
                    content: newComment,
                    score: rating,
                    userId: userId,
                    movieId: parseInt(id)
                });

                // Mettre à jour l'état local avec le nouveau commentaire
                const newUserComment = response.data;
                setComments([newUserComment, ...comments]);
                setUserComment(newUserComment);
            }

            setCommentError(null);
        } catch (err) {
            console.error("Erreur lors de l'enregistrement du commentaire:", err);
            setCommentError("Impossible d'enregistrer le commentaire");
        }
    };

    const handleDeleteComment = async () => {
        if (!userComment) return;

        if (!window.confirm('Êtes-vous sûr de vouloir supprimer votre commentaire ?')) return;

        try {
            await apiClient.delete(`/comment/${userComment.id}`);

            // Mettre à jour l'état local
            setComments(comments.filter(comment => comment.id !== userComment.id));
            setUserComment(null);
            setNewComment('');
            setRating(5);
            setCommentError(null);
        } catch (err) {
            console.error("Erreur lors de la suppression du commentaire:", err);
            setCommentError("Impossible de supprimer le commentaire");
        }
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

                        {movie?.overview && (
                            <div className="movie-description">
                                <h2>Synopsis</h2>
                                <p>{movie.overview}</p>
                            </div>
                        )}

                        <div className="movie-comments-section">
                            <h2>Commentaires</h2>

                            <form className="comment-form" onSubmit={handleSubmitComment}>
                                <div className="rating-selector">
                                    <label>Votre note:</label>
                                    <select
                                        value={rating}
                                        onChange={(e) => setRating(Number(e.target.value))}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>

                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Votre commentaire..."
                                    rows={4}
                                    required
                                ></textarea>

                                {commentError && <div className="comment-error">{commentError}</div>}

                                <div className="comment-actions">
                                    <button type="submit" className="submit-comment">
                                        {userComment ? 'Mettre à jour' : 'Commenter'}
                                    </button>
                                    {userComment && (
                                        <button
                                            type="button"
                                            className="delete-comment"
                                            onClick={handleDeleteComment}
                                        >
                                            Supprimer
                                        </button>
                                    )}
                                </div>
                            </form>

                            <div className="comments-list">
                                {commentsLoading ? (
                                    <div className="comments-loading">Chargement des commentaires...</div>
                                ) : comments.length === 0 ? (
                                    <div className="no-comments">Soyez le premier à commenter ce film</div>
                                ) : (
                                    comments.map(comment => (
                                        <div key={comment.id} className="comment-item">
                                            <div className="comment-header">
                                                <span className="comment-author">
                                                    {comment.user ? `${comment.user.firstname} ${comment.user.lastname}` : 'Utilisateur anonyme'}
                                                </span>
                                                <span className="comment-score">
                                                    Note: {comment.score}/10
                                                </span>
                                            </div>
                                            <div className="comment-content">{comment.content}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MoviePage;