import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ movies: [] })
})

router.post('/new', (req, res) => {
    console.log(req.body)
    res.json({ status: 'ok' })
})

export default router;