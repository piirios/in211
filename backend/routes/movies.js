import express from 'express';
import { appDataSource } from '../datasource.js';
import Movie from '../entities/movie.js';
import List from '../entities/list.js';

const router = express.Router();

// Récupérer tous les films d'une liste
router.get('/list/:listId', async function (req, res) {
    try {
        const { listId } = req.params;
        const offset = parseInt(req.query.offset) || 0;
        const amount = parseInt(req.query.amount) || 10;

        // Vérifier si la liste existe
        const listRepository = appDataSource.getRepository(List);
        const list = await listRepository.findOne({
            where: { id: listId },
            relations: ['movies']
        });

        if (!list) {
            return res.status(404).json({ message: 'Liste non trouvée' });
        }

        // Récupérer les films de la liste avec pagination
        const movies = list.movies || [];
        const total = movies.length;
        const paginatedMovies = movies.slice(offset, offset + amount);

        res.status(200).json({
            list: {
                id: list.id,
                name: list.name
            },
            movies: paginatedMovies,
            pagination: {
                total,
                offset,
                amount,
                count: paginatedMovies.length
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des films de la liste' });
    }
});

// Ajouter un film à une liste
router.post('/list/:listId/movie/:movieId', async function (req, res) {
    try {
        const { listId, movieId } = req.params;

        // Vérifier si la liste existe
        const listRepository = appDataSource.getRepository(List);
        const list = await listRepository.findOne({
            where: { id: listId },
            relations: ['movies']
        });

        if (!list) {
            return res.status(404).json({ message: 'Liste non trouvée' });
        }

        // Vérifier si le film existe, sinon le créer
        const movieRepository = appDataSource.getRepository(Movie);
        let movie = await movieRepository.findOne({ where: { id: movieId } });

        if (!movie) {
            movie = await movieRepository.save({ id: movieId });
        }

        // Vérifier si le film est déjà dans la liste
        const movieExists = list.movies && list.movies.some(m => m.id === parseInt(movieId));

        if (movieExists) {
            return res.status(400).json({ message: 'Ce film est déjà dans la liste' });
        }

        // Ajouter le film à la liste
        if (!list.movies) {
            list.movies = [];
        }
        list.movies.push(movie);
        await listRepository.save(list);

        res.status(201).json({ message: 'Film ajouté à la liste avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de l\'ajout du film à la liste' });
    }
});

// Supprimer un film d'une liste
router.delete('/list/:listId/movie/:movieId', async function (req, res) {
    try {
        const { listId, movieId } = req.params;

        // Vérifier si la liste existe
        const listRepository = appDataSource.getRepository(List);
        const list = await listRepository.findOne({
            where: { id: listId },
            relations: ['movies']
        });

        if (!list) {
            return res.status(404).json({ message: 'Liste non trouvée' });
        }

        // Vérifier si le film est dans la liste
        if (!list.movies || !list.movies.some(m => m.id === parseInt(movieId))) {
            return res.status(400).json({ message: 'Ce film n\'est pas dans la liste' });
        }

        // Retirer le film de la liste
        list.movies = list.movies.filter(m => m.id !== parseInt(movieId));
        await listRepository.save(list);

        res.status(200).json({ message: 'Film retiré de la liste avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression du film de la liste' });
    }
});

export default router;