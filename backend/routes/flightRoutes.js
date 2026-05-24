const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const flightController = require('../controllers/flightController');

router.post('/', auth.verify, auth.verifyAdmin, flightController.createFlight);
router.get('/', auth.verify, flightController.getAllFlights);
router.get('/:id', auth.verify, flightController.getFlight);
router.put('/:id', auth.verify, auth.verifyAdmin, flightController.updateFlight);
router.delete('/:id', auth.verify, auth.verifyAdmin, flightController.deleteFlight);

module.exports = router;
