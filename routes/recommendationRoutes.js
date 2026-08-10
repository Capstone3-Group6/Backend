const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendationController');

router.get('/', (req, res) => {
  res.status(200).json({ message: 'Recommendations API endpoint is active.' });
});

router.post('/', getRecommendations);

module.exports = router;