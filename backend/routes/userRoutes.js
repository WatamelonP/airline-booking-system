const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');


// cheap checks first pls. 
// naging order nito is: validate the email(cheap) -> validate the password(cheap) -> if passed the two -> check duplicate(expensive check)


router.post('/register', auth.emailValidation, auth.passwordValidation, auth.checkDuplicateEmail, userController.register);
router.post('/login', userController.login);
router.get('/profile', auth.verify, userController.getProfile);

router.get('/get-all-users', auth.verify, auth.verifyAdmin, userController.getAllUsers)


module.exports = router;