const jwt = require("jsonwebtoken");

//[SECTION] Environment Setup
//import our .env for environment variables
require('dotenv').config();

// [Section] JSON Web Tokens
/*
- JSON Web Token or JWT is a way of securely passing information from the server to the client or to other parts of a server
- Information is kept secure through the use of the secret code
- Only the system that knows the secret code that can decode the encrypted information
- Imagine JWT as a gift wrapping service that secures the gift with a lock
- Only the person who knows the secret code can open the lock
- And if the wrapper has been tampered with, JWT also recognizes this and disregards the gift
- This ensures that the data is secure from the sender to the receiver
*/

//[Section] Token Creation
/*
Analogy
    Pack the gift and provide a lock with the secret code as the key
*/

module.exports.createAccessToken = (user) => {


	const data = {

		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin

	};
	//sample expiry time {expiresIn: '1h', '10m', '7d'}
	return jwt.sign(data, process.env.JWT_SECRET_KEY, {});

}


//[SECTION] Token Verification
/*
Analogy
    Receive the gift and open the lock to verify if the the sender is legitimate and the gift was not tampered with
- Verify will be used as a middleware in ExpressJS. Functions added as argument in an expressJS route are considered as middleware and is able to receive the request and response objects as well as the next() function. Middlewares will be further elaborated on later sessions.
*/
module.exports.verify = (req, res, next) => {
	let token = req.headers.authorization;

	if (typeof token === "undefined") {
		return res.send({ auth: "Failed. No Token" });
	} else {

		//Bearer asdgasd123.ajsdgasd12.asdasdasd
		token = token.slice(7, token.length);
		//asdgasd123.ajsdgasd12.asdasdasd


		jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decodedToken) {

			if (err) {
				return res.status(403).send({
					auth: "Failed",
					message: err.message
				});

			} else {
				req.user = decodedToken;

				next();
			}
		})
	}
}


//[SECTION] Verify Admin

module.exports.verifyAdmin = (req, res, next) => {

	console.log("result from verifyAdmin: " + req.user);

	if (req.user.isAdmin) {

		next();
	} else {
		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}
}


//[SECTION] Error Handler
module.exports.errorHandler = (err, req, res, next) => {


	console.error(err);

	const statusCode = err.status || 500;
	const errorMessage = err.message || 'Internal Server Error';

	res.status(statusCode).json({
		error: {
			message: errorMessage,
			errorCode: err.code || 'SERVER_ERROR',
			details: err.details || null
		}
	})
}

module.exports.emailValidation = (req, res, next) => {

	const { email } = req.body;

	if (!email) {
		return res.status(400).send({ message: "Email is required" })
	}

	const validateEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!validateEmail.test(email)) {
		return res.status(400).send({ message: "Invalid Email Format" })
	}

	next();
}

module.exports.passwordValidation = (req, res, next) => {
	const { password } = req.body;
	const validatePassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

	if (!password) {
		return res.status(404).send({ message: "Password is required" })
	}

	if (!validatePassword.test(password)) {
		return res.status(400).send({ message: "Invalid Password Format" })
	}

	next();
}


module.exports.checkDuplicateEmail = async (req, res, next) => {

	let { email } = req.body;

	const emailExists = await User.findOne({ email });

	if (emailExists) {
		return res.status(400).send({ message: "Email Already Exists" })
	}

	next();

}