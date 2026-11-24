const express = require('express');
const router = express.Router();
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientHistory,
  unblockClient,
  resetClientCounters,
} = require('../controllers/clientController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All client routes require admin JWT

router.get('/', getClients);
router.post('/', createClient);
router.get('/:id', getClientById);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);
router.get('/:id/history', getClientHistory);
router.post('/:id/unblock', unblockClient);
router.post('/:id/reset-counter', resetClientCounters);

module.exports = router;
