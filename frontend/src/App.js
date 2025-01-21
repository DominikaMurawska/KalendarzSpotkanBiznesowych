import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import "./App.css";

function App() {
    const [reservations, setReservations] = useState([]);
    const [formData, setFormData] = useState({ name: '', email: '', date: '', time: '' });
    const [filter, setFilter] = useState({ date: '', name: '', sort: '' });
    const [isAdminView, setIsAdminView] = useState(false);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/reservations');
            setReservations(response.data);
        } catch (error) {
            console.error('Error fetching reservations:', error);
        }
    };

    const fetchFilteredReservations = async () => {
        try {
            const params = new URLSearchParams(filter).toString();
            const response = await axios.get(`http://localhost:5000/api/reservations/filter?${params}`);
            setReservations(response.data);
        } catch (error) {
            console.error('Error filtering reservations:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter({ ...filter, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/api/reservations', formData);
            setReservations([...reservations, response.data]);
            alert('Reservation confirmed!');
        } catch (error) {
            console.error('Error creating reservation:', error);
            alert(error.response?.data?.message || 'An error occurred');
        }
    };

    const events = [
        ...reservations.map(res => ({
            id: res.id,
            title: `${res.name} (${res.time})`,
            start: `${res.date}T${res.time}`,
            backgroundColor: '#f39c12',
        })),
        ...generateAvailableSlots()
    ];

    function generateAvailableSlots() {
        const availableSlots = [];
        const today = new Date();
        for (let hour = 10; hour <= 19; hour++) {
            const time = hour.toString().padStart(2, '0') + ':00';
            availableSlots.push({
                id: `available-${hour}`,
                title: 'Available',
                start: `${today.toISOString().split('T')[0]}T${time}`,
                backgroundColor: '#2ecc71',
                display: 'background',
            });
        }
        return availableSlots;
    }

    return (
        <div className="App">
            <h1>Business Meeting Scheduler</h1>

            <button onClick={() => setIsAdminView(!isAdminView)}>
                {isAdminView ? 'Switch to User View' : 'Switch to Admin View'}
            </button>

            {isAdminView ? (
                <div>
                    <h2>Admin Panel</h2>
                    <div>
                        <input
                            type="date"
                            name="date"
                            value={filter.date}
                            onChange={handleFilterChange}
                            placeholder="Filter by date"
                        />
                        <input
                            type="text"
                            name="name"
                            value={filter.name}
                            onChange={handleFilterChange}
                            placeholder="Filter by name"
                        />
                        <select name="sort" value={filter.sort} onChange={handleFilterChange}>
                            <option value="">Sort By</option>
                            <option value="time">Time</option>
                            <option value="date">Date</option>
                        </select>
                        <button onClick={fetchFilteredReservations}>Apply Filters</button>
                    </div>

                    <ul>
                        {reservations.map(res => (
                            <li key={res.id}>{`${res.name} - ${res.date} ${res.time}`}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div>
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay',
                        }}
                        events={events}
                    />

                    <form onSubmit={handleSubmit}>
                        <h2>Make a Reservation</h2>
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleInputChange}
                            required
                        />
                        <button type="submit">Reserve</button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default App;
