const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({

	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'User ID is Required']
	},
	flightId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Flight',
		required: [true, 'Flight ID is Required']
	},
	passengers: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Passenger'
	}],
	seatClass: {
		type: String,
		enum: ['Economy', 'Business', 'First'],
		required: [true, 'Seat Class is Required']
	},
	totalPassengers: {
		type: Number,
		required: [true, 'Total Passengers is Required']
	},
	totalPrice: {
		type: Number,
		required: [true, 'Total Price is Required']
	},
	status: {
		type: String,
		enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
		default: 'Pending'
	},
	promoCode: {
		type: String
	},
	remarks: {
		type: String
	}
},
{
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	}
});

module.exports = mongoose.model('Booking', bookingSchema);
