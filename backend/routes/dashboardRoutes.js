const express = require('express');
const router = express.Router();
const { getDashboardStats, getDashboardActivity } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/activity', getDashboardActivity);

module.exports = router;
