import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { db } from '../Firebace'; // Firebase のインポートパスに注意
import { addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import SubPageTitle from '../components/SubPageTitle';
import MessageInput from '../components/MessageInput';

const ChatArea = () => {
    const pageTitle = {
        en: 'Chat',
        ja: '連絡帳'
    };
    const { memberId: chatRoomId } = useParams(); // memberIdをchatRoomIdとして使用
    const [messages, setMessages] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const messagesEndRef = useRef(null);

    //ログインしているユーザーの情報を取得できるように、ログイン状況を監視
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setCurrentUser(user);
            }
        });
        return unsubscribe;
    }, []);

    // メッセージデータ取得
    useEffect(() => {
        const fetchMessages = async () => {
            if (currentUser && chatRoomId) {
                const messagesRef = collection(db, 'chats', chatRoomId, 'messages');
                const q = query(messagesRef, orderBy('createdAt'));
                const unsubscribe = onSnapshot(q, (querySnapshot) => {
                    const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setMessages(messages);
                });
                return unsubscribe;
            }
        };

        fetchMessages();

        return () => {
            // クリーンアップ関数
        };
    }, [currentUser, chatRoomId]);

    // スムーススクロール 最新メッセージみれるように
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // メッセージ送信でメッセージコレクションに保存
    const handleSendMessage = async (message) => {
        if (!message.trim()) return;
        const messagesRef = collection(db, 'chats', chatRoomId, 'messages');
        await addDoc(messagesRef, {
            text: message,
            createdAt: new Date().toISOString(),
            readStatus: 'unread', // 初期状態を未読に設定
            author: {
                username: currentUser.displayName,
                id: currentUser.uid,
                icon: currentUser.photoURL
            }
        });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('ja-JP');
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    };

    const getInitials = (name) => {
        return name.substring(0, 2).toUpperCase();
    };

    if (!currentUser) {
        return <p>認証されていないユーザーです</p>;
    }

    return (
        <div className='sub-page'>
            <SubPageTitle title={pageTitle} backgroundColor="#EC8A8A" />
            <div className='ChatAreaContainer'>
                <ul className='ChatArea'>
                    {messages.map((message) => (
                        <li key={message.id} className={`contents ${message.author.id === currentUser.uid ? 'right' : 'left'}`}>
                            <div className={`account ${message.author.id === currentUser.uid ? 'account-right' : 'account-left'}`}>
                                <div className="user-icon">
                                    {message.author.icon ? (
                                        <img src={message.author.icon} alt="User Icon" />
                                    ) : (
                                        <span>{getInitials(message.author.username)}</span>
                                    )}
                                    <p className='sender'>{message.author ? message.author.username : 'Unknown'}</p>
                                </div>
                                <p className='message'>{message.text}</p>
                            </div>
                            <div className='timestamp'>
                                <p className='date'>{formatDate(message.createdAt)}</p>
                                <p className='time'>{formatTime(message.createdAt)}</p>
                            </div>
                        </li>
                    ))}
                    <div ref={messagesEndRef} />
                </ul>
                <MessageInput onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
};

export default ChatArea;
