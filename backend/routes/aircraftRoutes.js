const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const aircraftController = require('../controllers/aircraftController');

// RESTful endpoints
router.post('/', auth.verify, auth.verifyAdmin, aircraftController.createAircraft);
router.get('/', auth.verify, aircraftController.getAllAircrafts);
router.get('/:id', auth.verify, aircraftController.getAircraft);
router.put('/:id', auth.verify, auth.verifyAdmin, aircraftController.updateAircraft);
router.delete('/:id', auth.verify, auth.verifyAdmin, aircraftController.deleteAircraft);

module.exports = router;
