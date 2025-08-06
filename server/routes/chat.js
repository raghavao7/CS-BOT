const express = require('express');
const router = express.Router();

const modelFile = process.env.MODEL_FILE || 'qwen';
const getBotResponse = require(`../services/${modelFile}.js`);

router.post('/', async (req, res) => {
const { message } = req.body;
try {
const reply = await getBotResponse(message);
res.json({ reply });
} catch (err) {
console.error('Bot error:', err);
res.status(500).json({ error: 'Failed to get bot reply' });
}
});

module.exports = router;