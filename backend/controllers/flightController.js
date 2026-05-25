const Flight = require('../models/Flight');
const Aircraft = require('../models/Aircraft');


module.exports.createFlight = async (req, res, next) => {
  const {
    flightNumber,
    airline,
    aircraftId,
    origin,
    destination,
    departureDate,
    arrivalDate,
    price,
    availableSeats,
    status,
    isActive
  } = req.body;

  try {
    // Check aircraft exists
    const aircraft = await Aircraft.findById(aircraftId);
    if (!aircraft) return res.status(404).send({ message: "Aircraft not found" });

    // Check duplicate flight number
    const existingFlight = await Flight.findOne({ flightNumber });
    if (existingFlight) return res.status(400).send({ message: "Flight already exists" });

    const newFlight = new Flight({
      flightNumber,
      airline,
      aircraftId,
      origin,
      destination,
      departureDate,
      arrivalDate,
      price: {
        economy: price.economy,
        business: price.business,
        first: price.first
      },
      availableSeats: {
        economy: availableSeats?.economy || 0,
        business: availableSeats?.business || 0,
        first: availableSeats?.first || 0
      },
      status: status || 'Scheduled',
      isActive: isActive !== undefined ? isActive : true
    });

    const result = await newFlight.save();

    res.status(201).send({
      message: "Flight created successfully",
      flight: result
    });
  } catch (err) {
    next(err);
  }
};


module.exports.getAllFlights = async (req, res, next) => {
  try {
    const flights = await Flight.find().populate('aircraft');
    res.status(200).send({ message: "Flights fetched successfully", flights });
  } catch (err) {
    next(err);
  }
};

module.exports.getFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id).populate('aircraft');
    if (!flight) return res.status(404).send({ message: "Flight not found" });
    res.status(200).send({ message: "Flight fetched successfully", flight });
  } catch (err) {
    next(err);
  }
};

module.exports.updateFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).send({ message: "Flight not found" });

    Object.assign(flight, req.body);
    const updated = await flight.save();

    res.status(200).send({ message: "Flight updated successfully", flight: updated });
  } catch (err) {
    next(err);
  }
};

module.exports.deleteFlight = async (req, res, next) => {
  try {
    const deleted = await Flight.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).send({ message: "Flight not found" });
    res.status(200).send({ message: "Flight deleted successfully", flight: deleted });
  } catch (err) {
    next(err);
  }
};
