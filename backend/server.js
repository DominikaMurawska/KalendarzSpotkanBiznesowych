const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let reservations = []; // In-memory data storage

// API Endpoints

// Get all reservations
app.get('/api/reservations', (req, res) => {
    res.json(reservations);
});

// Create a new reservation
app.post('/api/reservations', (req, res) => {
    const { name, email, date, time } = req.body;

    // Validate input
    if (!name || !email || !date || !time) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check availability
    const isOccupied = reservations.some(reservation =>
        reservation.date === date && reservation.time === time
    );

    if (isOccupied) {
        return res.status(400).json({ message: 'The selected time slot is already booked.' });
    }

    // Create and store the reservation
    const newReservation = { id: uuidv4(), name, email, date, time };
    reservations.push(newReservation);

    // Send confirmation email
    sendConfirmationEmail(email, newReservation);

    res.status(201).json(newReservation);
});

// Edit a reservation
app.put('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, date, time } = req.body;

    const reservationIndex = reservations.findIndex(res => res.id === id);
    if (reservationIndex === -1) {
        return res.status(404).json({ message: 'Reservation not found.' });
    }

    const updatedReservation = { ...reservations[reservationIndex], name, email, date, time };
    reservations[reservationIndex] = updatedReservation;

    res.json(updatedReservation);
});

// Delete a reservation
app.delete('/api/reservations/:id', (req, res) => {
    const { id } = req.params;

    reservations = reservations.filter(reservation => reservation.id !== id);

    res.status(204).send();
});

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',
        pass: 'your-email-password',
    },
});

function sendConfirmationEmail(email, reservation) {
    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Reservation Confirmation',
        text: `Your reservation on ${reservation.date} at ${reservation.time} has been confirmed.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
