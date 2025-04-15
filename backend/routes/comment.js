import express from 'express';
import { appDataSource } from '../datasource.js';
import Comment from '../entities/comment.js';
import User from '../entities/user.js';
import Movie from '../entities/movie.js';

const router = express.Router();

// Ajouter un commentaire à un film
router.post('/', async function (req, res) {
    try {
        const { content, score, userId, movieId } = req.body;

        if (!content || score === undefined || !userId || !movieId) {
            return res.status(400).json({
                message: 'Contenu, score, ID utilisateur et ID film sont requis'
            });
        }

        // Vérifier si l'utilisateur existe
        const userRepository = appDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifier si le film existe
        const movieRepository = appDataSource.getRepository(Movie);
        const movie = await movieRepository.findOne({ where: { id: movieId } });

        if (!movie) {
            // Si le film n'existe pas, on le crée
            await movieRepository.save({ id: movieId });
        }

        // Vérifier si l'utilisateur a déjà commenté ce film
        const commentRepository = appDataSource.getRepository(Comment);
        const existingComment = await commentRepository.findOne({
            where: { userId, movieId }
        });

        if (existingComment) {
            return res.status(400).json({
                message: 'Vous avez déjà commenté ce film'
            });
        }

        // Créer le commentaire
        const newComment = commentRepository.create({
            content,
            score,
            userId,
            movieId
        });

        const result = await commentRepository.save(newComment);
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création du commentaire' });
    }
});

// Modifier un commentaire
router.put('/:commentId', async function (req, res) {
    try {
        const { commentId } = req.params;
        const { content, score } = req.body;

        if (!content && score === undefined) {
            return res.status(400).json({
                message: 'Contenu ou score est requis pour la modification'
            });
        }

        const commentRepository = appDataSource.getRepository(Comment);
        const comment = await commentRepository.findOne({ where: { id: commentId } });

        if (!comment) {
            return res.status(404).json({ message: 'Commentaire non trouvé' });
        }

        // Mettre à jour les champs modifiés
        if (content) comment.content = content;
        if (score !== undefined) comment.score = score;

        const result = await commentRepository.save(comment);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la modification du commentaire' });
    }
});

// Supprimer un commentaire
router.delete('/:commentId', async function (req, res) {
    try {
        const { commentId } = req.params;

        const commentRepository = appDataSource.getRepository(Comment);
        const comment = await commentRepository.findOne({ where: { id: commentId } });

        if (!comment) {
            return res.status(404).json({ message: 'Commentaire non trouvé' });
        }

        await commentRepository.remove(comment);

        res.status(200).json({ message: 'Commentaire supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression du commentaire' });
    }
});

// Récupérer le commentaire d'un utilisateur pour un film spécifique
router.get('/user/:userId/movie/:movieId', async function (req, res) {
    try {
        const { userId, movieId } = req.params;

        // Vérifier si l'utilisateur existe
        const userRepository = appDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Vérifier si le film existe
        const movieRepository = appDataSource.getRepository(Movie);
        const movie = await movieRepository.findOne({ where: { id: movieId } });

        if (!movie) {
            return res.status(404).json({ message: 'Film non trouvé' });
        }

        // Récupérer le commentaire
        const commentRepository = appDataSource.getRepository(Comment);
        const comment = await commentRepository.findOne({
            where: { userId, movieId },
            relations: ['user'] // Pour inclure les informations de l'utilisateur
        });

        if (!comment) {
            return res.status(404).json({ message: 'Aucun commentaire trouvé pour cet utilisateur et ce film' });
        }

        // Formater la réponse
        res.status(200).json({
            id: comment.id,
            content: comment.content,
            score: comment.score,
            user: {
                id: comment.user.id,
                firstname: comment.user.firstname,
                lastname: comment.user.lastname
            },
            movieId: parseInt(movieId)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération du commentaire' });
    }
});

// Récupérer tous les commentaires d'un film avec pagination et score moyen
router.get('/movie/:movieId', async function (req, res) {
    try {
        const { movieId } = req.params;
        const offset = parseInt(req.query.offset) || 0;
        const amount = parseInt(req.query.amount) || 10;

        // Vérifier si le film existe
        const movieRepository = appDataSource.getRepository(Movie);
        const movie = await movieRepository.findOne({ where: { id: movieId } });

        if (!movie) {
            return res.status(404).json({ message: 'Film non trouvé' });
        }

        // Récupérer tous les commentaires pour calculer le score moyen
        const commentRepository = appDataSource.getRepository(Comment);
        const allComments = await commentRepository.find({
            where: { movieId }
        });

        // Calcul du score moyen
        const totalScore = allComments.reduce((sum, comment) => sum + comment.score, 0);
        const averageScore = allComments.length > 0 ? totalScore / allComments.length : 0;
        const roundedAverageScore = Math.round(averageScore * 10) / 10; // Arrondi à 1 décimale

        // Récupérer les commentaires avec pagination et les infos utilisateur
        const [comments, total] = await commentRepository.findAndCount({
            where: { movieId },
            relations: ['user'],
            skip: offset,
            take: amount,
            order: {
                id: 'DESC' // Commentaires les plus récents d'abord
            }
        });

        // Formater les commentaires pour la réponse
        const formattedComments = comments.map(comment => ({
            id: comment.id,
            content: comment.content,
            score: comment.score,
            user: {
                id: comment.user.id,
                firstname: comment.user.firstname,
                lastname: comment.user.lastname
            }
        }));

        res.status(200).json({
            movieId: parseInt(movieId),
            averageScore: roundedAverageScore,
            totalComments: total,
            comments: formattedComments,
            pagination: {
                offset,
                amount,
                total,
                count: formattedComments.length
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des commentaires' });
    }
});

export default router;
