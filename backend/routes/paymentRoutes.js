const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const paymentController = require('../controllers/paymentController');

// RESTful endpoints
router.post('/', auth.verify, paymentController.createPayment);
router.get('/booking/:bookingId', auth.verify, paymentController.getPaymentByBooking);
router.put('/:id/status', auth.verify, auth.verifyAdmin, paymentController.updatePaymentStatus);

module.exports = router;
