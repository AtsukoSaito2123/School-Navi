// MessageInput.js
import React, { useState } from 'react';

const MessageInput = ({ onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const sendMessage = () => {
        if (!newMessage.trim()) return;

        onSendMessage(newMessage);
        setNewMessage('');
    };

    const [message, setMessage] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
        }
    };

    return (
        <div className='SubmitMessageArea'>
            <form onSubmit={handleSubmit}>
                <textarea
                    type='text'
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder='メッセージを入力してください'
                />
                <button className='submit' onClick={sendMessage}>送信</button>
            </form>
        </div>
    );
};

export default MessageInput;
