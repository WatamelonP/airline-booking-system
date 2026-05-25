const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Seat = require('../models/Seat');
const User = require('../models/User');
const Passenger = require('../models/Passenger');

const mongoose = require('mongoose');


module.exports.createBooking = async (req, res, next) => {
  try {
    const flightObjectId = new mongoose.Types.ObjectId(req.body.flightId);
    const seatClass = req.body.seatClass;

    const availableSeats = await Seat.find({
      flightId: flightObjectId,
      seatClass: seatClass,
      isAvailable: true
    });

    if (availableSeats.length < req.body.totalPassengers) {
      return res.status(400).json({ message: "Not enough seats available in this class" });
    }

    // assign seats to passengers here...
    // e.g. loop through passengers, update seat.isAvailable = false, seat.passengerId = passenger._id

    res.status(201).json({ message: "Booking successful", seats: availableSeats });
  } catch (err) {
    next(err);
  }
};


module.exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('flight')
      .populate('seat');

    res.status(200).send({
      message: "User bookings fetched successfully",
      bookings
    });
  } catch (err) {
    next(err);
  }
};

module.exports.updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).send({ message: "Booking not found" });

    // Free up seat
    const seat = await Seat.findById(booking.seat);
    if (seat) {
      seat.isAvailable = true;
      await seat.save();
    }

    booking.status = "CANCELLED";
    await booking.save();

    res.status(200).send({
      message: "Booking cancelled successfully",
      booking
    });
  } catch (err) {
    next(err);
  }
};

module.exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'firstName lastName email')
      .populate('flight')
      .populate('seat');

    res.status(200).send({
      message: "All bookings fetched successfully",
      bookings
    });
  } catch (err) {
    next(err);
  }
};

// Delete booking
module.exports.deleteBooking = async (req, res, next) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Booking not found" });

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (err) {
    next(err);
  }
};