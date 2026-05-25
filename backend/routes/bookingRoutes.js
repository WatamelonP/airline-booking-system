const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const bookingController = require('../controllers/bookingController');

// RESTful endpoints
router.post('/', auth.verify, bookingController.createBooking);
router.get('/', auth.verify, bookingController.getAllBookings); // admin only
router.get('/:id', auth.verify, bookingController.getUserBookings);
router.put('/:id', auth.verify, bookingController.updateBooking); // cancel/update
router.delete('/:id', auth.verify, bookingController.deleteBooking);

module.exports = router;
