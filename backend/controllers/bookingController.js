const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const mongoose = require('mongoose');


// ─── Helpers ────────────────────────────────────────────────────────────────

const VALID_SEAT_CLASSES = ['Economy', 'Business', 'First'];

function validateBookingInput({ flightId, seatClass, totalPassengers }) {
  if (!flightId || !mongoose.Types.ObjectId.isValid(flightId)) {
    return 'Invalid or missing flightId';
  }
  if (!seatClass || !VALID_SEAT_CLASSES.includes(seatClass)) {
    return `seatClass must be one of: ${VALID_SEAT_CLASSES.join(', ')}`;
  }
  if (!totalPassengers || !Number.isInteger(totalPassengers) || totalPassengers < 1) {
    return 'totalPassengers must be a positive integer';
  }
  return null;
}


// ─── Create Booking ──────────────────────────────────────────────────────────

module.exports.createBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { flightId, seatClass, totalPassengers, promoCode, remarks } = req.body;

    const validationError = validateBookingInput({ flightId, seatClass, totalPassengers });
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const classKey = seatClass.toLowerCase();
    const flightObjectId = new mongoose.Types.ObjectId(flightId);

    const flight = await Flight.findById(flightObjectId).session(session);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    if (flight.availableSeats[classKey] < totalPassengers) {
      return res.status(400).json({ message: 'Not enough seats available in this class' });
    }

    // Calculate price server-side — never trust the client
    let totalPrice = flight.price[classKey] * totalPassengers;

    if (promoCode) {
      // TODO: validate promo code against a PromoCode model and apply discount
      // const promo = await PromoCode.findOne({ code: promoCode, isActive: true }).session(session);
      // if (promo) totalPrice -= totalPrice * (promo.discountPercent / 100);
    }

    flight.availableSeats[classKey] -= totalPassengers;
    await flight.save({ session });

    const newBooking = new Booking({
      userId: req.user.id,
      flightId: flightObjectId,
      seatClass: seatClass,
      totalPassengers,
      totalPrice,
      promoCode,
      remarks,
      status: 'Confirmed',
    });

    const savedBooking = await newBooking.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: 'Booking successful', booking: savedBooking });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};


// ─── Get Current User's Bookings ─────────────────────────────────────────────

module.exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate('flightId');
    res.status(200).json({ message: 'User bookings fetched successfully', bookings });
  } catch (err) {
    next(err);
  }
};


// ─── Cancel Booking ───────────────────────────────────────────────────────────

module.exports.cancelBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only the booking owner can cancel
    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Restore seats
    const flight = await Flight.findById(booking.flightId).session(session);
    if (flight) {
      const classKey = booking.seatClass.toLowerCase();
      flight.availableSeats[classKey] += booking.totalPassengers;
      await flight.save({ session });
    }

    booking.status = 'Cancelled';
    await booking.save({ session });

    await session.commitTransaction();
    res.status(200).json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};


// ─── Get All Bookings (Admin) ─────────────────────────────────────────────────

module.exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'firstName lastName email')
      .populate('flightId');

    res.status(200).json({ message: 'All bookings fetched successfully', bookings });
  } catch (err) {
    next(err);
  }
};


// ─── Delete Booking (Admin) ───────────────────────────────────────────────────

module.exports.deleteBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Restore seats if the booking was still active
    if (booking.status !== 'Cancelled') {
      const flight = await Flight.findById(booking.flightId).session(session);
      if (flight) {
        const classKey = booking.seatClass.toLowerCase();
        flight.availableSeats[classKey] += booking.totalPassengers;
        await flight.save({ session });
      }
    }

    await booking.deleteOne({ session });

    await session.commitTransaction();
    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};