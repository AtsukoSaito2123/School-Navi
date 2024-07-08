import React, { useEffect, useState } from 'react';
import SubPageTitle from '../components/SubPageTitle';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../Firebace';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Calender = () => {
  const pageTitle = {
    en: 'Calendar',
    ja: 'イベント'
  };

  const [isAdmin, setIsAdmin] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const checkAdmin = async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsAdmin(userData.role === 'admin');
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkAdmin(user);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '' });
  const [activeInput, setActiveInput] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editEventData, setEditEventData] = useState({ title: '', start: '', end: '' });

  useEffect(() => {
    const fetchEvents = async () => {
      const querySnapshot = await getDocs(collection(db, 'events'));
      const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsData);
    };

    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleAddEvent = async () => {
    if (newEvent.title && newEvent.start && newEvent.end) {
      const docRef = await addDoc(collection(db, 'events'), newEvent);
      setEvents([...events, { id: docRef.id, ...newEvent }]);
      setNewEvent({ title: '', start: '', end: '' }); // フォームをリセット
    }
  };

  const handleDateClick = (arg) => {
    if (isAdmin) {
      if (activeInput === 'start') {
        setNewEvent({ ...newEvent, start: arg.dateStr, end: arg.dateStr });
      } else if (activeInput === 'end') {
        setNewEvent({ ...newEvent, end: arg.dateStr });
      }
    }
  };

  // Firestore からイベントを削除する関数
  const deleteEvent = async (id) => {
    const eventDocRef = doc(db, 'events', id);
    await deleteDoc(eventDocRef);
    // イベントが削除された後、ローカルの state からも削除する
    setEvents(events.filter(event => event.id !== id));
  };

  // Firestore からイベントを更新する関数
  const updateEvent = async (id, updatedEvent) => {
    const eventDocRef = doc(db, 'events', id);
    await updateDoc(eventDocRef, updatedEvent);
    // イベントが更新された後、ローカルの state も更新する
    setEvents(events.map(event => (event.id === id ? { id, ...updatedEvent } : event)));
    setEditingEvent(null);
    setEditEventData({ title: '', start: '', end: '' });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditEventData({ ...editEventData, [name]: value });
  };

  const handleEditButtonClick = (event) => {
    setEditingEvent(event.id);
    setEditEventData({ title: event.title, start: event.start, end: event.end });
  };

  const handleSaveEdit = () => {
    if (editEventData.title && editEventData.start && editEventData.end) {
      updateEvent(editingEvent, editEventData);
    }
  };

  return (
    <div className='sub-page'>
      <SubPageTitle title={pageTitle} backgroundColor="#61DFA2" />
      <div className='wrapper'>
        {isAdmin && (
          <div className='event-form'>
            <input
              type="text"
              name="title"
              value={newEvent.title}
              onChange={handleInputChange}
              placeholder="イベントのタイトル"
            />
            <input
              type="date"
              name="start"
              value={newEvent.start}
              onChange={handleInputChange}
              onFocus={() => setActiveInput('start')}
            />
            <input
              type="date"
              name="end"
              value={newEvent.end}
              onChange={handleInputChange}
              onFocus={() => setActiveInput('end')}
            />
            <button onClick={handleAddEvent}>イベントを追加</button>
          </div>
        )}
        <div className='calendar-container'>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locales={[jaLocale]}
            locale="ja"
            weekends={true}
            events={events}
            dateClick={handleDateClick}
          />
        </div>
        {isAdmin && (
          <div className='event-list'>
            <h3>イベントリスト</h3>
            <ul>
              {events.map(event => (
                <li key={event.id}>
                  {event.title} ({event.start} - {event.end})
                  <button onClick={() => handleEditButtonClick(event)}>編集</button>
                  <button onClick={() => deleteEvent(event.id)}>削除</button>
                </li>
              ))}
            </ul>
            {editingEvent && (
              <div className='edit-form'>
                <h3>イベントを編集</h3>
                <input
                  type="text"
                  name="title"
                  value={editEventData.title}
                  onChange={handleEditInputChange}
                  placeholder="イベントのタイトル"
                />
                <input
                  type="date"
                  name="start"
                  value={editEventData.start}
                  onChange={handleEditInputChange}
                />
                <input
                  type="date"
                  name="end"
                  value={editEventData.end}
                  onChange={handleEditInputChange}
                />
                <button onClick={handleSaveEdit}>保存</button>
                <button onClick={() => setEditingEvent(null)}>キャンセル</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calender;
