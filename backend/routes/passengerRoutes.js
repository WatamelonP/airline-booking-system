const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const passengerController = require('../controllers/passengerController');

// RESTful endpoints
router.post('/', auth.verify, passengerController.createPassenger);
router.post('/assign-seat', auth.verify, passengerController.assignSeat); 
router.get('/', auth.verify, passengerController.getAllPassengers);
router.get('/:id', auth.verify, passengerController.getPassenger);
router.put('/:id', auth.verify, passengerController.updatePassenger);
router.delete('/:id', auth.verify, passengerController.deletePassenger);

module.exports = router;
