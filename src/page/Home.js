import React from 'react'
import '../css/Home.css';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

const Home = () => {
    const navigate = useNavigate(); 
    // const roomId = 'example-room-id'; // 動的に生成または取得したルームIDを使用
    const buttonsData = [
        { color: '#C0D87B', text: 'Attendance', text2: '出席確認', image: require('../img/attendance.png'), path: '/School-Navi/attendance' },
        { color: '#B696C6', text: 'School', text2: '全校共通', image: require('../img/school.png'), path: '/School-Navi/school' },
        { color: '#EC8A8A', text: 'Chat', text2: '連絡帳', image: require('../img/chat.png'), path: `/School-Navi/chat` },
        { color: '#DFC361', text: 'Class', text2: 'クラスだより', image: require('../img/class.png'), path: '/School-Navi/class' },
        { color: '#61DFA2', text: 'Calender', text2: 'イベント', image: require('../img/calender.png'), path: '/School-Navi/calender' },
        { color: '#61A2DF', text: 'Setting', text2: '設定', image: require('../img/grade.png'), path: '/School-Navi/setting' },
        // 他のボタンデータもここに追加
    ];

    const handleButtonClick = (path) => {
        navigate(path); // 指定されたリンクに遷移
    };

    
    return (
        <div className='Home'>
            <main>
            <ul className='btn-container'>
            {buttonsData.map((button, index) => (
                <Button
                    key={index}
                    color={button.color}
                    text={button.text}
                    text2={button.text2}
                    image={button.image}
                    onClick={() => handleButtonClick(button.path)} // ボタンがクリックされたときに handleButtonClick を呼び出す
                />
            ))}
        </ul>
            </main>
        </div>
    )
}

export default Home