import React, { useState } from 'react';
import { createReservation } from '../api';

const ReservationForm = () => {
    const [form, setForm] = useState({ name: '', email: '', date: '', note: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createReservation(form);
        alert('Reservation added!');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Name" onChange={handleChange} />
            <input name="email" placeholder="Email" onChange={handleChange} />
            <input name="date" type="date" onChange={handleChange} />
            <textarea name="note" placeholder="Note" onChange={handleChange} />
            <button type="submit">Reserve</button>
        </form>
    );
};

export default ReservationForm;
