const { getReservations, createReservation } = require('../models/reservationModel');

const getAllReservations = (req, res) => {
    getReservations((err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
};

const addReservation = (req, res) => {
    const reservation = req.body;
    createReservation(reservation, (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ message: 'Reservation created successfully!' });
        }
    });
};

module.exports = { getAllReservations, addReservation };
