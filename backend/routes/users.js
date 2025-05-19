import express from 'express';
import { appDataSource } from '../datasource.js';
import User from '../entities/user.js';

const router = express.Router();

router.get('/', function (req, res) {
  appDataSource
    .getRepository(User)
    .find({})
    .then(function (users) {
      res.json({ users: users });
    });
});

router.post('/new', function (req, res) {
  const userRepository = appDataSource.getRepository(User);
  const newUser = userRepository.create({
    email: req.body.email,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
  });

  userRepository
    .insert(newUser)
    .then(function (newDocument) {
      res.status(201).json(newDocument.identifiers[0]);
    })
    .catch(function (error) {
      console.error(error);
      if (error.code === '23505') {
        res.status(400).json({
          message: `User with email "${newUser.email}" already exists`,
        });
      } else {
        res.status(500).json({ message: 'Error while creating the user' });
      }
    });
});

router.delete('/:userId', function (req, res) {
  appDataSource
    .getRepository(User)
    .delete({ id: req.params.userId })
    .then(function () {
      res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while deleting the user' });
    });
});

// Enregistrement d'un utilisateur avec uuid, prénom et nom
router.post('/register', async function (req, res) {
  const userRepository = appDataSource.getRepository(User);
  const { uuid, firstname, lastname } = req.body;

  if (!uuid || !firstname || !lastname) {
    return res.status(400).json({ success: false, error: 'uuid, firstname et lastname sont requis' });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    const existing = await userRepository.findOneBy({ id: uuid });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Utilisateur déjà existant pour cet uuid' });
    }
    // Créer et enregistrer l'utilisateur
    const newUser = userRepository.create({ id: uuid, firstname, lastname, email: `${uuid}@noemail.local` });
    await userRepository.insert(newUser);
    return res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'Erreur lors de la création de l\'utilisateur' });
  }
});

// Vérifier si un utilisateur existe par uuid
router.get('/exists/:uuid', async function (req, res) {
  const userRepository = appDataSource.getRepository(User);
  const { uuid } = req.params;
  if (!uuid) {
    return res.status(400).json({ exists: false, error: 'uuid requis' });
  }
  try {
    const user = await userRepository.findOneBy({ id: uuid });
    return res.json({ exists: !!user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ exists: false, error: 'Erreur lors de la vérification' });
  }
});

export default router;
