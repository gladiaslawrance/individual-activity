const express = require('express');
const router = express.Router();
const { getFsmStates, getFsmTransitions, getFsmHistory } = require('../controllers/fsmController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/states', getFsmStates);
router.get('/transitions', getFsmTransitions);
router.get('/history', getFsmHistory);

module.exports = router;
