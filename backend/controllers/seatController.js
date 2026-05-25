const Seat = require('../models/Seat');
const Flight = require('../models/Flight');

// Create seat
module.exports.createSeat = async (req, res, next) => {
  try {
    const seat = new Seat(req.body);
    const saved = await seat.save();
    res.status(201).json({ message: "Seat created successfully", seat: saved });
  } catch (err) {
    next(err);
  }
};

// Get all seats
module.exports.getAllSeats = async (req, res, next) => {
  try {
    const seats = await Seat.find().populate('flightId passengerId');
    res.status(200).json(seats);
  } catch (err) {
    next(err);
  }
};

// Get one seat
module.exports.getSeat = async (req, res, next) => {
  try {
    const seat = await Seat.findById(req.params.id).populate('flightId passengerId');
    if (!seat) return res.status(404).json({ message: "Seat not found" });
    res.status(200).json(seat);
  } catch (err) {
    next(err);
  }
};

// Update seat
module.exports.updateSeat = async (req, res, next) => {
  try {
    const updated = await Seat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Seat not found" });
    res.status(200).json({ message: "Seat updated successfully", seat: updated });
  } catch (err) {
    next(err);
  }
};

// Delete seat
module.exports.deleteSeat = async (req, res, next) => {
  try {
    const deleted = await Seat.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Seat not found" });
    res.status(200).json({ message: "Seat deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Check seat availability
module.exports.checkSeatAvailability = async (req, res, next) => {
  try {
    const { flightId, seatNumber } = req.body;

    const flight = await Flight.findById(flightId);
    if (!flight) return res.status(404).json({ message: "Flight not found" });

    const seat = await Seat.findOne({ flightId, seatNumber });
    if (!seat) return res.status(404).json({ message: "Seat not found" });
    if (!seat.isAvailable) return res.status(400).json({ message: "Seat already booked" });

    res.status(200).json({ message: "Seat is available", seat });
  } catch (err) {
    next(err);
  }
};

// Assign seat to passenger
module.exports.assignSeat = async (req, res, next) => {
  try {
    const { flightId, seatNumber, passengerId } = req.body;

    const flight = await Flight.findById(flightId);
    if (!flight) return res.status(404).json({ message: "Flight not found" });

    const seat = await Seat.findOne({ flightId, seatNumber });
    if (!seat) return res.status(404).json({ message: "Seat not found" });
    if (!seat.isAvailable) return res.status(400).json({ message: "Seat already booked" });

    seat.isAvailable = false;
    seat.passengerId = passengerId;
    const updated = await seat.save();

    res.status(200).json({ message: "Seat assigned successfully", seat: updated });
  } catch (err) {
    next(err);
  }
};

// Release seat
module.exports.releaseSeat = async (req, res, next) => {
  try {
    const seat = await Seat.findById(req.params.id);
    if (!seat) return res.status(404).json({ message: "Seat not found" });

    seat.isAvailable = true;
    seat.passengerId = null;
    const updated = await seat.save();

    res.status(200).json({ message: "Seat released successfully", seat: updated });
  } catch (err) {
    next(err);
  }
};