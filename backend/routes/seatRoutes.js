const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const seatController = require('../controllers/seatController');

// Full CRUD
router.post('/', auth.verify, auth.verifyAdmin, seatController.createSeat);
router.get('/', auth.verify, auth.verifyAdmin, seatController.getAllSeats);
router.get('/:id', auth.verify, seatController.getSeat);
router.put('/:id', auth.verify, auth.verifyAdmin, seatController.updateSeat);
router.delete('/:id', auth.verify, auth.verifyAdmin, seatController.deleteSeat);

// Extra functionalities
router.get('/availability', auth.verify, seatController.checkSeatAvailability);
router.post('/assign', auth.verify, seatController.assignSeat);
router.put('/:id/release', auth.verify, auth.verifyAdmin, seatController.releaseSeat);

module.exports = router;
