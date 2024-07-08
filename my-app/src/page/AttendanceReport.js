import React, { useState, useEffect } from 'react';
import SubPageTitle from '../components/SubPageTitle';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import ja from 'date-fns/locale/ja';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../Firebace';

// 日本語化
registerLocale('ja', ja);
setDefaultLocale('ja');

const AttendanceReport = () => {
    const pageTitle = {
        en: 'Attendance',
        ja: '出欠確認'
    };

    const today = new Date();
    const [date, setDate] = useState(today);
    const [selectedOption, setSelectedOption] = useState(null);
    const [reasonText, setReasonText] = useState('');
    const [childNames, setChildNames] = useState([]);
    const [selectedChildren, setSelectedChildren] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            const userDoc = doc(db, "users", auth.currentUser.uid);
            const userSnapshot = await getDoc(userDoc);
            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                // Ensure userData.childName is always an array
                const names = userData.childName;
                const childNamesArray = Array.isArray(names) ? names : [names];
                setChildNames(childNamesArray);
            }
        };


        fetchUserData();
    }, []);

    const handleDateChange = (selectedDate) => {
        setDate(selectedDate);
    };

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleChildChange = (childName) => {
        setSelectedChildren(prevSelected => {
            if (prevSelected.includes(childName)) {
                return prevSelected.filter(name => name !== childName);
            } else {
                return [...prevSelected, childName];
            }
        });
    };

    const createPost = async () => {
        await addDoc(collection(db, "posts"), {
            date: date,
            selectedOption: selectedOption,
            reasonText: reasonText,
            selectedChildren: selectedChildren,
            author: {
                username: auth.currentUser.displayName,
                id: auth.currentUser.uid
            }
        });
        // 送信後にリセット
        setSelectedOption(null);
        setReasonText('');
        setSelectedChildren([]);

        // You can use window.history to navigate back
        window.history.back();
    };



    return (
        <div className='sub-page'>
            <SubPageTitle title={pageTitle} backgroundColor="#C0D87B" />
            <div className='wrapper'>
                <section className='AttendanceReport'>
                    <h2>子供の名前</h2>
                    <ul className='RadioBtn-list'>
                        {Array.isArray(childNames) ? (
                            childNames.map((name, index) => (
                                <li key={index}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={name}
                                            checked={selectedChildren.includes(name)}
                                            onChange={() => handleChildChange(name)}
                                        />
                                        {name}
                                    </label>
                                </li>
                            ))
                        ) : (
                            <li>No child names available</li>
                        )}
                    </ul>
                </section>
                <section className='DaySelect'>
                    <h2 className='sec-title'>日付</h2>
                    <DatePicker
                        dateFormat="yyyy/MM/dd"
                        selected={date}
                        minDate={today}
                        onChange={handleDateChange}
                        locale="ja" // 日本語ロケールを設定
                    />
                </section>
                <section className='RadioBtn'>
                    <h2 className='sec-title'>出欠</h2>
                    <ul className='RadioBtn-list'>
                        <li>
                            <label>
                                <input
                                    type="radio"
                                    value="遅刻"
                                    checked={selectedOption === "遅刻"}
                                    onChange={handleOptionChange}
                                />
                                遅刻
                            </label>
                        </li>
                        <li>
                            <label>
                                <input
                                    type="radio"
                                    value="欠席"
                                    checked={selectedOption === "欠席"}
                                    onChange={handleOptionChange}
                                />
                                欠席
                            </label>
                        </li>
                        <li>
                            <label>
                                <input
                                    type="radio"
                                    value="早退"
                                    checked={selectedOption === "早退"}
                                    onChange={handleOptionChange}
                                />
                                早退
                            </label>
                        </li>
                        <li>
                            <label>
                                <input
                                    type="radio"
                                    value="その他"
                                    checked={selectedOption === "その他"}
                                    onChange={handleOptionChange}
                                />
                                その他
                            </label>
                        </li>
                    </ul>
                </section>
                <section className='ReasonTextarea'>
                    <h2 className='sec-title'>理由</h2>
                    <textarea
                        placeholder='投稿内容を記入'
                        value={reasonText}
                        onChange={(e) => setReasonText(e.target.value)}
                    ></textarea>
                </section>
                <button className='submit' onClick={createPost}>送信</button>
            </div>
        </div>
    );
}

export default AttendanceReport;
