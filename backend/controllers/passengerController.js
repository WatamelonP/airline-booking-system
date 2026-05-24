const Passenger = require('../models/Passenger');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');

module.exports.assignSeat = async (req, res, next) => {
  try {
    const { passengerId, flightId, seatNumber } = req.body;

    // Hanapin passenger
    const passenger = await Passenger.findById(passengerId);
    if (!passenger) return res.status(404).send({ message: "Passenger not found" });

    // Hanapin seat
    const seat = await Seat.findOne({ flightId, seatNumber, isBooked: false });
    if (!seat) return res.status(404).send({ message: "Seat not available" });

    // Update passenger.seatId
    passenger.seatId = seat._id;
    await passenger.save();

    // Update seat
    seat.isBooked = true;
    seat.passengerId = passenger._id;
    await seat.save();

    res.status(200).send({
      message: "Seat assigned successfully",
      passenger,
      seat
    });
  } catch (err) {
    next(err);
  }
};

// Create passenger (same as addPassenger)
module.exports.createPassenger = async (req, res, next) => {
  const { bookingId, userId, firstName, lastName, middleName, dateOfBirth, gender, nationality, passportNumber, passportExpiry, specialRequests } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).send({ message: "Booking not found" });

  const newPassenger = new Passenger({
    bookingId,
    userId,
    firstName,
    lastName,
    middleName,
    dateOfBirth,
    gender,
    nationality,
    passportNumber,
    passportExpiry,
    specialRequests
  });

  const result = await newPassenger.save();
  res.status(201).send({ message: "Passenger created successfully", passenger: result });

};

// Get all passengers
module.exports.getAllPassengers = async (req, res, next) => {
  try {
    const passengers = await Passenger.find().populate('booking');
    res.status(200).send({ message: "All passengers fetched successfully", passengers });
  } catch (err) {
    next(err);
  }
};

// Get one passenger
module.exports.getPassenger = async (req, res, next) => {
  try {
    const passenger = await Passenger.findById(req.params.id).populate('booking');
    if (!passenger) return res.status(404).send({ message: "Passenger not found" });
    res.status(200).send({ message: "Passenger fetched successfully", passenger });
  } catch (err) {
    next(err);
  }
};

// Update passenger details
module.exports.updatePassenger = async (req, res, next) => {
  try {
    const passenger = await Passenger.findById(req.params.id);
    if (!passenger) return res.status(404).send({ message: "Passenger not found" });

    Object.assign(passenger, req.body);
    const updated = await passenger.save();

    res.status(200).send({ message: "Passenger updated successfully", passenger: updated });
  } catch (err) {
    next(err);
  }
};

// Delete passenger
module.exports.deletePassenger = async (req, res, next) => {
  try {
    const deleted = await Passenger.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).send({ message: "Passenger not found" });
    res.status(200).send({ message: "Passenger deleted successfully" });
  } catch (err) {
    next(err);
  }
};