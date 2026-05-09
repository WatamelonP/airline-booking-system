const Aircraft = require('../models/Aircraft');
const auth = require('../middlewares/auth');

module.exports.createAircraft = async (req, res, next) => {
        const { model, airline, registrationNumber, totalSeats, seatClasses, isActive } = req.body;

        try {
                const existingAircraft = await Aircraft.findOne({ registrationNumber });

                if (existingAircraft) {
                        return res.status(400).send({ message: "Aircraft Already Exists" });
                }

                const newAircraft = new Aircraft({
                        model,
                        airline,
                        registrationNumber,
                        totalSeats,
                        seatClasses,
                        isActive
                });

                const result = await newAircraft.save();

                res.status(201).send({
                        message: "Aircraft created successfully",
                        aircraft: {
                                _id: result._id,
                                model: result.model,
                                airline: result.airline,
                                registrationNumber: result.registrationNumber,
                                totalSeats: result.totalSeats,
                                seatClasses: result.seatClasses,
                                isActive: result.isActive
                        }
                });

        } catch (err) {
                next(err);
        }
}

module.exports.getAllAircrafts = async (req, res, next) => {
        try {
                const aircrafts = await Aircraft.find();

                return res.status(200).send({
                        message: "Aircrafts Fetched Successfully",
                        aircrafts
                })
        } catch (err) {
                next(err);
        }
}

module.exports.getAircraft = async (req, res, next) => {
        try {
                const aircraft = await Aircraft.findById(req.params.id);

                if (!aircraft) {
                        return res.status(404).send({ message: "Aircraft not found" })
                }

                return res.status(200).send({
                        message: "Aircraft fetched successfully",
                        Aircraft: {
                                _id: aircraft._id,
                                model: aircraft.model,
                                airline: aircraft.airline,
                                registrationNumber: aircraft.registrationNumber,
                                totalSeats: aircraft.totalSeats,
                                seatClasses: aircraft.seatClasses,
                                isActive: aircraft.isActive
                        }
                })
        } catch (err) {
                next(err);
        }
}


// didnt use findByIdAndUpdate here because it's easier for validations this way. 
module.exports.updateAircraft = async (req, res, next) => {
        const { model, airline, registrationNumber, totalSeats, seatClasses, isActive } = req.body;
        try {
                const existingAircraft = await Aircraft.findById(req.params.id);
                if (!existingAircraft) {
                        return res.status(404).send({ message: "Aircraft not found" });
                }

                if (req.body.registrationNumber) {
                        const existingAircraft = await Aircraft.findOne({ registrationNumber });
                        if (existingAircraft) {
                                return res.status(400).send({ message: "Aircraft Already Exists" });
                        }
                }
                existingAircraft.model = model;
                existingAircraft.airline = airline;
                existingAircraft.registrationNumber = registrationNumber;
                existingAircraft.totalSeats = totalSeats;
                existingAircraft.seatClasses = seatClasses;
                existingAircraft.isActive = isActive;

                const updateResult = await existingAircraft.save();

                return res.status(200).send({
                        message: "Aircraft updated successfully",
                        Aircraft: {
                                _id: updateResult._id,
                                model: updateResult.model,
                                airline: updateResult.airline,
                                registrationNumber: updateResult.registrationNumber,
                                totalSeats: updateResult.totalSeats,
                                seatClasses: updateResult.seatClasses,
                                isActive: updateResult.isActive
                        }
                });
        } catch (err) {
                next(err);
        }
}

module.exports.deleteAircraft = async (req, res, next) => {
        try {
                const deletedAircraft = await Aircraft.findByIdAndDelete(req.params.id);
                if (!deletedAircraft) {
                        return res.status(404).send({ message: "Aircraft not found" });
                }
                return res.status(200).send({
                        message: "Aircraft deleted successfully",
                        Aircraft: {
                                _id: deletedAircraft._id,
                                model: deletedAircraft.model,
                                airline: deletedAircraft.airline,
                                registrationNumber: deletedAircraft.registrationNumber,
                                totalSeats: deletedAircraft.totalSeats,
                                seatClasses: deletedAircraft.seatClasses,
                                isActive: deletedAircraft.isActive
                        }
                });
        } catch (err) {
                next(err);
        }
}