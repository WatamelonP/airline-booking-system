const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../middlewares/auth');

// NOTES: ASYNC functions must always have await keyword when accessing async code.
// ASYNC FUNCTIONS
// When we define a function as async, it means that the function will return a Promise.
// This allows us to use the await keyword inside the function to wait for the Promise to resolve before continuing. 

//  async functions are for functions with processes that can take time so it doesnt return null after a long time even though the process isnt finished yet

// await guarantees the value is ready for use before using it. 
// Basically it acts like a gate, it doesnt let the next line go through unless the previous line is ready


//examples of race conditions issues: 
// Seat Booking — two users booking the same seat at the same time. Without a lock or atomic operation, both could pass the "is seat available?" check simultaneously and double-book.
// Flight Capacity — same idea, if you're tracking passenger count, two simultaneous bookings could both read 49/50 and both push it to 50, resulting in 51 passengers.
// Payment Processing — a user double-clicking the confirm button could fire two requests, charging them twice.

// important to note:
// express has this function where if you call next(err), it will skip all the other middlewares and go straight to the error handler(didnt know this until earlier).

module.exports.register = async (req, res, next) => {


        let { firstName, lastName, middleName, email, password, mobileNo } = req.body;


        try {
                const existingUser = await User.findOne({ email });
                if (existingUser) {
                        return res.status(400).send({ message: "User Already Exists" })
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                const newUser = new User({
                        firstName,
                        lastName,
                        middleName,
                        email,
                        password: hashedPassword,
                        mobileNo
                });

                const result = await newUser.save();

                res.status(201).send({
                        message: "User registered successfully",
                        user: {
                                _id: result._id,
                                firstName: result.firstName,
                                lastName: result.lastName,
                                middleName: result.middleName,
                                email: result.email,
                                mobileNo: result.mobileNo
                        }
                });

        } catch (err) {
                next(err);
        }
};


module.exports.login = async (req, res, next) => {

        let { email, password } = req.body;

        try {

                const user = await User.findOne({ email });

                if (!user) {
                        return res.status(401).send({ message: "Invalid Credentials" });
                }

                const isPasswordValid = await bcrypt.compare(password, user.password);

                if (!isPasswordValid) {
                        return res.status(401).send({ message: "Invalid Credentials" })
                }

                const token = auth.createAccessToken(user);

                return res.status(200).send({ message: "Login Success", auth: token })


        } catch (err) {
                next(err);
        }

}


module.exports.getProfile = async (req, res, next) => {

        try {
                const user = await User.findById(req.user.id);

                if (!user) {
                        return res.status(404).send({ message: "User Not Found" })
                }

                return res.status(200).send({
                        message: "User Profile Fetched Successfully",
                        user: {
                                _id: user._id,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                middleName: user.middleName,
                                email: user.email,
                                mobileNo: user.mobileNo
                        }
                })
        }
        catch (err) {
                next(err);
        }
}

module.exports.getAllUsers = async (req, res, next) => {

        try {
                const users = await User.find();

                return res.status(200).send({
                        message: "Users Fetched Successfully",
                        users
                })
        }
        catch (err) {
                next(err);
        }
}