import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { getReservations } from '../api';

const Calendar = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchReservations = async () => {
            const data = await getReservations();
            const formattedEvents = data.map((item) => ({
                title: `${item.name} (${item.email})`,
                date: item.date,
            }));
            setEvents(formattedEvents);
        };
        fetchReservations();
    }, []);

    return <FullCalendar plugins={[dayGridPlugin]} initialView="dayGridMonth" events={events} />;
};

export default Calendar;
