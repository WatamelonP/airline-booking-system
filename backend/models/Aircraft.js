const mongoose = require('mongoose');

const aircraftSchema = new mongoose.Schema({

	model: {
		type: String,
		required: [true, 'Aircraft Model is Required']
	},
	airline: {
		type: String,
		required: [true, 'Airline is Required']
	},
	registrationNumber: {
		type: String,
		required: [true, 'Registration Number is Required'],
		unique: true
	},
	totalSeats: {
		type: Number,
		required: [true, 'Total Seats is Required']
	},
	seatClasses: {
		economy: {
			type: Number,
			default: 0
		},
		business: {
			type: Number,
			default: 0
		},
		first: {
			type: Number,
			default: 0
		}
	},
	isActive: {
		type: Boolean,
		default: true
	}
},
{
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	}
});

module.exports = mongoose.model('Aircraft', aircraftSchema);
