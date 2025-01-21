const db = require('../db/database');

const getReservations = (callback) => {
    db.all('SELECT * FROM reservations', [], callback);
};

const createReservation = (reservation, callback) => {
    const { name, email, date, note } = reservation;
    db.run(
        `INSERT INTO reservations (name, email, date, note) VALUES (?, ?, ?, ?)`,
        [name, email, date, note],
        callback
    );
};

module.exports = { getReservations, createReservation };
