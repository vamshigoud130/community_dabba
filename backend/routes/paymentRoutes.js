const express = require('express');
const router = express.Router();
const { verifySession } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/verify', protect, verifySession);

module.exports = router;
