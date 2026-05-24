const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

module.exports.createPayment = async (req, res, next) => {
  const { bookingId, userId, amount, paymentMethod } = req.body;

  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).send({ message: "Booking not found" });

    const newPayment = new Payment({
      bookingId,       // tama na field name
      userId,          // required sa schema
      amount,
      paymentMethod,   // tama na field name
      status: "Pending"
    });

    const result = await newPayment.save();
    res.status(201).send({ message: "Payment created successfully", payment: result });
  } catch (err) {
    next(err);
  }
};

module.exports.getPaymentByBooking = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ bookingId: req.params.bookingId });
    if (!payment) return res.status(404).send({ message: "Payment not found" });

    res.status(200).send({ message: "Payment fetched successfully", payment });
  } catch (err) {
    next(err);
  }
};


module.exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).send({ message: "Payment not found" });

    payment.status = req.body.status || payment.status;
    if (req.body.status === "Completed") {
      payment.paidAt = new Date();
    }

    const updated = await payment.save();
    res.status(200).send({ message: "Payment status updated successfully", payment: updated });
  } catch (err) {
    next(err);
  }
};

