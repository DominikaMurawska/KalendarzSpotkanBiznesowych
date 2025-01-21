const express = require('express');
const { getAllReservations, addReservation } = require('../controllers/reservationsController');
const router = express.Router();

router.get('/', getAllReservations);
router.post('/', addReservation);

module.exports = router;
