const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 5000;

// Fake database
let reservations = [];

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "your-email@gmail.com",
        pass: "your-email-password",
    },
});

// Helper function to check for time conflicts
const hasConflict = (date, time) => {
    const targetTime = new Date(`${date}T${time}`);
    return reservations.some((res) => {
        const resTime = new Date(`${res.date}T${res.time}`);
        const diff = Math.abs(targetTime - resTime) / (1000 * 60); // Difference in minutes
        return res.date === date && diff < 60; // Conflict if within the same hour
    });
};

// API Routes

// Get all reservations
app.get("/api/reservations", (req, res) => {
    const { date, sort } = req.query;

    let filteredReservations = reservations;

    if (date) {
        filteredReservations = filteredReservations.filter(
            (res) => res.date === date
        );
    }

    if (sort) {
        filteredReservations.sort((a, b) => {
            if (sort === "asc") return a.time.localeCompare(b.time);
            if (sort === "desc") return b.time.localeCompare(a.time);
            return 0;
        });
    }

    res.json(filteredReservations);
});

// Create a new reservation
app.post("/api/reservations", (req, res) => {
    const { name, email, date, time } = req.body;

    // Validation
    if (!name || !email || !date || !time) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Check for time conflicts
    const isConflict = reservations.some(
        (res) => res.date === date && res.time === time
    );

    if (isConflict) {
        return res.status(400).json({
            message: "This time slot is already taken. Please choose another.",
        });
    }

    const newReservation = {
        id: uuidv4(),
        name,
        email,
        date,
        time,
        note,
    };

    reservations.push(newReservation);

    // Send confirmation email
    const mailOptions = {
        from: "lolloollol@wp.pl",
        to: email,
        subject: "Reservation Confirmation",
        text: `Hi ${name},\n\nYour reservation on ${date} at ${time} has been confirmed.\n\nThank you!`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });

    res.status(201).json(newReservation);
});

// Delete a reservation
app.delete("/api/reservations/:id", (req, res) => {
    const { id } = req.params;

    reservations = reservations.filter((res) => res.id !== id);
    res.json({ message: "Reservation deleted successfully." });
});

// Edit a reservation
app.put("/api/reservations/:id", (req, res) => {
    const { id } = req.params;
    const { name, email, date, time, note } = req.body;

    const reservationIndex = reservations.findIndex((res) => res.id === id);

    if (reservationIndex === -1) {
        return res.status(404).json({ message: "Reservation not found." });
    }

    // Check for conflicts
    const isConflict = reservations.some(
        (res, idx) =>
            res.date === date && res.time === time && idx !== reservationIndex
    );

    if (isConflict) {
        return res.status(400).json({
            message: "This time slot is already taken. Please choose another.",
        });
    }

    const updatedReservation = {
        ...reservations[reservationIndex],
        name,
        email,
        date,
        time,
        note,
    };

    reservations[reservationIndex] = updatedReservation;

    res.json(updatedReservation);
});

// Route to delete a reservation (Admin functionality)
app.delete("/api/admin/reservations/:id", (req, res) => {
    const { id } = req.params;

    const reservationIndex = reservations.findIndex((res) => res.id === id);
    if (reservationIndex === -1) {
        return res.status(404).json({ message: "Nie znaleziono rezerwacji" });
    }

    reservations.splice(reservationIndex, 1);
    res.json({ message: "Rezerwacja została anulowana" });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
