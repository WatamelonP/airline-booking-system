const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const userController = require('../controllers/userController');

// RESTful endpoints (aligned with controller names)
router.post('/register', userController.register);                 // register user
router.post('/login', userController.login);               // login user
router.get('/getUsers', auth.verify, auth.verifyAdmin, userController.getAllUsers); // get all users
router.get('/profile', auth.verify, userController.getProfile);             // get profile of logged-in user


router.put('/:id', auth.verify, userController.updateUser);
router.delete('/:id', auth.verify, auth.verifyAdmin, userController.deleteUser);

module.exports = router;
