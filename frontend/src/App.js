import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import './App.css';
import pl from '@fullcalendar/core/locales/pl';
import logo from './logo.png';

function App() {
  const [reservations, setReservations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', date: '', time: '', note: '' });
  const [filterDate, setFilterDate] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', date: '', time: '', note: '', id: '' });
  const [errorMessage, setErrorMessage] = useState('');

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

  const handleDateClick = (info) => {
    setFormData({ ...formData, date: info.dateStr });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isConflict = hasConflict(formData.date, formData.time);
    if (isConflict) {
      setErrorMessage('Wybrany termin jest już zajęty. Proszę wybrać inną godzinę.');
      return;
    }

    setErrorMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/reservations', formData);
      setReservations([...reservations, response.data]);
      alert('Wykonano rezerwację !');
      setFormData({ name: '', email: '', date: '', time: '', note: '' }); // Reset formularza
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert(error.response?.data?.message || 'Wystąpił błąd');
    }
  };

  const hasConflict = (date, time) => {
    const targetTime = new Date(`${date}T${time}`);
    return reservations.some((res) => {
      const resTime = new Date(`${res.date}T${res.time}`);
      const diff = Math.abs(targetTime - resTime) / (1000 * 60); // Różnica w minutach
      return res.date === date && diff < 60; // Konflikt, jeśli różnica mniejsza niż 60 minut
    });
  };

  const handleEventClick = (info) => {
    const clickedEvent = reservations.find((res) => res.id === info.event.id);
    setSelectedEvent(clickedEvent);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/reservations/${id}`);
      setReservations(reservations.filter((res) => res.id !== id));
      if (selectedEvent?.id === id) {
        setSelectedEvent(null);
      }
      alert('Rezerwacja usunięta.');
    } catch (error) {
      console.error('Błąd usuwania rezerwacji:', error);
    }
  };

  const handleEdit = (res) => {
    setEditFormData({
      id: res.id,
      name: res.name,
      email: res.email,
      date: res.date,
      time: res.time,
      note: res.note || '',
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `http://localhost:5000/api/reservations/${editFormData.id}`,
        editFormData
      );
      setReservations(reservations.map((res) => (res.id === editFormData.id ? response.data : res)));
      setEditFormData({ name: '', email: '', date: '', time: '', note: '', id: '' });
      alert('Rezerwacja została pomyślnie zaktualizowana');
    } catch (error) {
      console.error('Rezerwacja nie została zaktualizowana:', error);
      alert('Błąd aktualizacji rezerwacji');
    }
  };

  const filteredReservations = filterDate
    ? reservations.filter((res) => res.date === filterDate)
    : reservations;

  const events = reservations.map((res) => ({
    id: res.id,
    title: `${res.name} (${res.time})`,
    start: `${res.date}T${res.time}`,
    backgroundColor: '#f39c12',
  }));

  return (
    <div className="App">
      <div className="header">
        <h1>Rezerwacja Spotkań Biznesowych</h1>
        <img src={logo} alt="Logo" className="logo" />
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        locale={pl}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
      />

      <form onSubmit={handleSubmit}>
        <h2>Wykonaj rezerwację</h2>
        <input
          type="text"
          name="name"
          placeholder="Imię i Nazwisko"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Twój Email"
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
        <textarea
          name="note"
          placeholder="Dodaj notatkę (opcjonalne)"
          value={formData.note}
          onChange={handleInputChange}
        />
        <button type="submit">Rezerwacja</button>
      </form>

      {errorMessage && <div className="error-message">{errorMessage}</div>}
        <p></p>
      <button
        className="admin-button"
        onClick={() => setShowAdminPanel(!showAdminPanel)}
      >
        {showAdminPanel ? 'Zamknij panel administratora' : 'Otwórz panel administratora'}
      </button>

      {showAdminPanel && (
        <div className="admin-panel">
          <h2>Panel Administratora</h2>

          <label>
            <g>Filtruj po dacie:</g>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </label>

          <table>
            <thead>
              <tr>
                <th>Imię i Nazwisko</th>
                <th>Email</th>
                <th>Data</th>
                <th>Godzina</th>
                <th>Notatka</th> {/* Dodaj nagłówek dla notatek */}
                <th>Akcja</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((res) => (
                <tr key={res.id}>
                  <td>{res.name}</td>
                  <td>{res.email}</td>
                  <td>{res.date}</td>
                  <td>{res.time}</td>
                  <td>{res.note || 'Brak notatki'}</td>
                  <td>
                    <button onClick={() => handleDelete(res.id)}>Anuluj</button>
                    <button onClick={() => handleEdit(res)}>Edytuj</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {editFormData.id && (
            <form onSubmit={handleEditSubmit}>
              <h3>Edytuj Rezerwację</h3>
              <input
                type="text"
                name="name"
                placeholder="Imię i Nazwisko"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={editFormData.email}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
                required
              />
              <input
                type="date"
                name="date"
                value={editFormData.date}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, date: e.target.value })
                }
                required
              />
              <input
                type="time"
                name="time"
                value={editFormData.time}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, time: e.target.value })
                }
                required
              />
              <textarea
                name="note"
                placeholder="Edytuj notatkę"
                value={editFormData.note}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, note: e.target.value })
                }
              />
              <button type="submit">Zaktualizuj Rezerwację</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
