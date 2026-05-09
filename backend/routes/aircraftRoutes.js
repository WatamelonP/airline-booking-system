const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const aircraftController = require('../controllers/Aircraft');

router.post('/create', auth.verify, auth.verifyAdmin, aircraftController.createAircraft);
router.get('/all', auth.verify, aircraftController.getAllAircrafts);
router.get('/one/:id', auth.verify, aircraftController.getAircraft);
router.put('/update/:id', auth.verify, auth.verifyAdmin, aircraftController.updateAircraft);
router.delete('/delete/:id', auth.verify, auth.verifyAdmin, aircraftController.deleteAircraft);

module.exports = router;