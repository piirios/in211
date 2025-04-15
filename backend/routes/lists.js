import express from 'express';
import { appDataSource } from '../datasource.js';
import List from '../entities/list.js';
import User from '../entities/user.js';

const router = express.Router();

// Créer une liste pour un utilisateur
router.post('/:userId', async function (req, res) {
    try {
        const { userId } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Le nom de la liste est requis' });
        }

        // Vérifier si l'utilisateur existe
        const userRepository = appDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Créer la liste
        const listRepository = appDataSource.getRepository(List);
        const newList = listRepository.create({
            name,
            userId
        });

        const result = await listRepository.save(newList);
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la création de la liste' });
    }
});

// Obtenir toutes les listes d'un utilisateur (avec pagination)
router.get('/:userId', async function (req, res) {
    try {
        const { userId } = req.params;
        const offset = parseInt(req.query.offset) || 0;
        const amount = parseInt(req.query.amount) || 10;

        // Vérifier si l'utilisateur existe
        const userRepository = appDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Récupérer les listes
        const listRepository = appDataSource.getRepository(List);
        const [lists, total] = await listRepository.findAndCount({
            where: { userId },
            skip: offset,
            take: amount,
            relations: ['movies'] // Inclure les films associés
        });

        res.json({
            lists,
            total,
            offset,
            amount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des listes' });
    }
});

// Modifier le nom d'une liste
router.put('/:listId', async function (req, res) {
    try {
        const { listId } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Le nouveau nom de la liste est requis' });
        }

        const listRepository = appDataSource.getRepository(List);
        const list = await listRepository.findOne({ where: { id: listId } });

        if (!list) {
            return res.status(404).json({ message: 'Liste non trouvée' });
        }

        list.name = name;
        await listRepository.save(list);

        res.json(list);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la modification de la liste' });
    }
});

// Supprimer une liste
router.delete('/:listId', async function (req, res) {
    try {
        const { listId } = req.params;

        const listRepository = appDataSource.getRepository(List);
        const list = await listRepository.findOne({ where: { id: listId } });

        if (!list) {
            return res.status(404).json({ message: 'Liste non trouvée' });
        }

        await listRepository.remove(list);

        res.status(200).json({ message: 'Liste supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la liste' });
    }
});

export default router;
