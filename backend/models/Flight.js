const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({

	flightNumber: {
		type: String,
		required: [true, 'Flight Number is Required'],
		unique: true
	},
	airline: {
		type: String,
		required: [true, 'Airline is Required']
	},
	aircraftId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Aircraft',
		required: [true, 'Aircraft is Required']
	},
	origin: {
		type: String,
		required: [true, 'Origin is Required']
	},
	destination: {
		type: String,
		required: [true, 'Destination is Required']
	},
	departureDate: {
		type: Date,
		required: [true, 'Departure Date is Required']
	},
	arrivalDate: {
		type: Date,
		required: [true, 'Arrival Date is Required']
	},
	price: {
		economy: {
			type: Number,
			required: [true, 'Economy Price is Required']
		},
		business: {
			type: Number,
			required: [true, 'Business Price is Required']
		},
		first: {
			type: Number,
			required: [true, 'First Class Price is Required']
		}
	},
	availableSeats: {
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
	status: {
		type: String,
		enum: ['Scheduled', 'Boarding', 'Departed', 'Arrived', 'Cancelled', 'Delayed'],
		default: 'Scheduled'
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

module.exports = mongoose.model('Flight', flightSchema);