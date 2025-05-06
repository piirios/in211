import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Lists.css';

function Lists() {
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newListName, setNewListName] = useState('');
    const [editingList, setEditingList] = useState(null);
    const navigate = useNavigate();

    // Utilisation de données mock pour le développement
    const mockLists = [
        { id: 1, name: "Films à voir", movies: [{ id: 123, title: "Inception" }, { id: 456, title: "Interstellar" }] },
        { id: 2, name: "Films favoris", movies: [{ id: 789, title: "The Dark Knight" }] },
        { id: 3, name: "Films d'action", movies: [] }
    ];

    // Simuler la récupération des listes
    useEffect(() => {
        // Simulation d'un délai réseau
        setTimeout(() => {
            setLists(mockLists);
            setLoading(false);
        }, 800);
    }, []);

    // Créer une nouvelle liste
    const handleCreateList = async (e) => {
        e.preventDefault();
        if (!newListName.trim()) return;

        // Simuler la création d'une liste
        const newListId = lists.length > 0 ? Math.max(...lists.map(list => list.id)) + 1 : 1;
        const newList = {
            id: newListId,
            name: newListName,
            movies: []
        };

        setLists([...lists, newList]);
        setNewListName('');
    };

    // Modifier le nom d'une liste
    const handleUpdateList = async (listId, newName) => {
        // Simuler la mise à jour d'une liste
        setLists(lists.map(list =>
            list.id === listId ? { ...list, name: newName } : list
        ));
        setEditingList(null);
    };

    // Supprimer une liste
    const handleDeleteList = async (listId) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) return;

        // Simuler la suppression d'une liste
        setLists(lists.filter(list => list.id !== listId));
    };

    // Voir les films d'une liste
    const handleViewList = (listId) => {
        navigate(`/list/${listId}`);
    };

    if (loading) return <div className="loading">Chargement des listes...</div>;

    return (
        <div className="lists-container">
            <h1>Mes listes de films</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="create-list-form">
                <form onSubmit={handleCreateList}>
                    <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="Nom de la nouvelle liste"
                        required
                    />
                    <button type="submit">Créer une liste</button>
                </form>
            </div>

            <div className="lists-grid">
                {/* S'assurer que lists est un tableau avant d'accéder à length */}
                {Array.isArray(lists) && lists.length === 0 ? (
                    <p className="no-lists">Vous n'avez pas encore créé de liste</p>
                ) : (
                    Array.isArray(lists) && lists.map(list => (
                        <div key={list.id} className="list-card">
                            {editingList === list.id ? (
                                <div className="list-edit-form">
                                    <input
                                        type="text"
                                        defaultValue={list.name}
                                        autoFocus
                                        onBlur={(e) => handleUpdateList(list.id, e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') handleUpdateList(list.id, e.target.value);
                                        }}
                                    />
                                </div>
                            ) : (
                                <>
                                    <h3 className="list-name">{list.name}</h3>
                                    <p className="list-info">
                                        {list.movies ? list.movies.length : 0} films
                                    </p>
                                    <div className="list-actions">
                                        <button
                                            onClick={() => handleViewList(list.id)}
                                            className="btn-view"
                                        >
                                            Voir
                                        </button>
                                        <button
                                            onClick={() => setEditingList(list.id)}
                                            className="btn-edit"
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            onClick={() => handleDeleteList(list.id)}
                                            className="btn-delete"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Lists; 