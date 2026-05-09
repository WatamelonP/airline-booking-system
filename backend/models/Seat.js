const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({

	flightId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Flight',
		required: [true, 'Flight ID is Required']
	},
	seatNumber: {
		type: String,
		required: [true, 'Seat Number is Required']
	},
	seatClass: {
		type: String,
		enum: ['Economy', 'Business', 'First'],
		required: [true, 'Seat Class is Required']
	},
	isAvailable: {
		type: Boolean,
		default: true
	},
	passengerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Passenger'
	}
},
{
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	}
});

module.exports = mongoose.model('Seat', seatSchema);
