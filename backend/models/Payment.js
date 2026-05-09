const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({

	bookingId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Booking',
		required: [true, 'Booking ID is Required']
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'User ID is Required']
	},
	amount: {
		type: Number,
		required: [true, 'Amount is Required']
	},
	paymentMethod: {
		type: String,
		enum: ['Credit Card', 'Debit Card', 'GCash', 'Maya', 'Bank Transfer'],
		required: [true, 'Payment Method is Required']
	},
	status: {
		type: String,
		enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
		default: 'Pending'
	},
	transactionId: {
		type: String,
		unique: true
	},
	paidAt: {
		type: Date
	}
},
{
	timestamps: {
		createdAt: 'created_at',
		updatedAt: 'updated_at'
	}
});

module.exports = mongoose.model('Payment', paymentSchema);
