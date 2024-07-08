import React, { useEffect, useState } from 'react';
import SubPageTitle from '../components/SubPageTitle';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import jaLocale from '@fullcalendar/core/locales/ja';
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';
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
    </div>
  );
};

export default Calender;
