import React from 'react';
import Button from './Button'; // Buttonコンポーネントのインポート

const PageWithButtons = () => {
    const buttonsData = [
        { color: '#C0D87B', text: 'Attendance', text2: '出席確認', image:require('../img/attendance.png') , link: '/page1' },
        { color: '#B696C6', text: 'School', text2: '全校共通', image:require('../img/school.png'), link: '/page2' },
        { color: '#EC8A8A', text: 'Chat', text2: '連絡帳', image:require('../img/chat.png'), link: '/page3' },
        { color: '#61A2DF', text: 'Grade', text2: '学年だより', image:require('../img/grede.png'), link: '/page4' },
        { color: '#61DFA2', text: 'Calender', text2: 'イベント', image:require('../img/calender.png'), link: '/page5' },
        { color: '#DFC361', text: 'Class', text2: 'クラスだより', image:require('../img/class.png'), link: '/page6' },
        // 他のボタンデータもここに追加
    ];

    const handleButtonClick = (link) => {
        // ボタンがクリックされたときの処理（例えば、ページ遷移など）
        console.log('Navigating to:', link);
    };

    return (
        <ul className='btn-container'>
            {buttonsData.map((button, index) => (
                <Button
                    key={index}
                    color={button.color}
                    text={button.text}
                    text2={button.text2}
                    image={button.image}
                    onClick={() => handleButtonClick(button.link)}
                />
            ))}
        </ul>
    );
};

export default PageWithButtons;
