const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({

	bookingId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Booking',
		required: [true, 'Booking ID is Required']
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	firstName: {
		type: String,
		required: [true, 'First Name is Required']
	},
	lastName: {
		type: String,
		required: [true, 'Last Name is Required']
	},
	middleName: {
		type: String
	},
	dateOfBirth: {
		type: Date,
		required: [true, 'Date of Birth is Required']
	},
	gender: {
		type: String,
		enum: ['Male', 'Female', 'Other'],
		required: [true, 'Gender is Required']
	},
	nationality: {
		type: String,
		required: [true, 'Nationality is Required']
	},
	passportNumber: {
		type: String
	},
	passportExpiry: {
		type: Date
	},
	seatId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Seat'
	},
	specialRequests: {
		type: String
	}
},
{
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	}
});

module.exports = mongoose.model('Passenger', passengerSchema);
