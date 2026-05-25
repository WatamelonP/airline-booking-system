	// DEPENDENCIES || IMPORTS
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const aircraftRoutes = require("./routes/aircraftRoutes")
const bookingRoutes = require('./routes/bookingRoutes');
const flightRoutes = require('./routes/flightRoutes');
const passengerRoutes = require('./routes/passengerRoutes');
const seatRoutes = require('./routes/seatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const { errorHandler } = require('./middlewares/auth');

// Configurations 

require('dotenv').config();

const app = express();

app.use(express.json());

const corsOptions = {

	origin: ['http://localhost:8000'], // if gagawa na ng frontend, make sure na naka set sa 8000
	credentials: true,
	optionsSuccessStatus: 200
}

mongoose.connect(process.env.MONGODB_STRING);

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'))



// ROUTES 

app.use("/users", userRoutes);
app.use("/aircraft", aircraftRoutes);
app.use('/bookings', bookingRoutes);
app.use('/flights', flightRoutes);	
app.use('/passengers', passengerRoutes);
app.use('/seats', seatRoutes);
app.use('/payments', paymentRoutes);
app.use(errorHandler);

if (require.main === module) {

	app.listen(process.env.PORT || 3000, () => {
		console.log(`API is now online on port ${process.env.PORT || 3000}`);
	})
}

module.exports = { app, mongoose };