const express = require('express');
const router = express.Router();
const {
  simulateRequest,
  bulkSimulateRequests,
  getRequests,
  getRequestStats,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/simulate', simulateRequest);
router.post('/bulk', bulkSimulateRequests);
router.get('/', getRequests);
router.get('/stats', getRequestStats);

module.exports = router;
