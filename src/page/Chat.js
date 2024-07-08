import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../Firebace';
import { Link } from 'react-router-dom';
import SubPageTitle from '../components/SubPageTitle';
import '../css/ChatArea.css';

const Chat = () => {
    const pageTitle = {
        en: 'Chat', // 英語のタイトル
        ja: '連絡帳' // 日本語のタイトル
    };

    const [members, setMembers] = useState([]);
    const [newMemberId, setNewMemberId] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    // ログイン状態を監視し、ログインしているユーザーのmemberIDを取得するエフェクト
    useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDocSnapshot = await getDoc(userDocRef);
                    if (userDocSnapshot.exists()) {
                        const userData = userDocSnapshot.data();
                        const memberID = userData.memberID;
                        if (!memberID) {
                            console.error('ユーザーデータにmemberIDが存在しません');
                            return;
                        }
                        user.memberID = memberID;
                        setCurrentUser(user);
                    }
                } catch (error) {
                    console.error('ユーザーデータの取得エラー: ', error);
                }
            }
        });
    }, []);

    // メンバーリストと最新のチャットメッセージを取得するエフェクト
    useEffect(() => {
        if (!currentUser) return;

        const fetchMembers = async () => {
            try {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const membersCollectionRef = collection(userDocRef, 'MemberList');
                onSnapshot(membersCollectionRef, async (querySnapshot) => {
                    const membersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    const updatedMembers = await Promise.all(membersData.map(async (member) => {
                        if (!member.chatRoomId) {
                            console.error('メンバーのチャットルームIDが未定義です:', member);
                            return member;
                        }
                        const chatRoomId = member.chatRoomId;
                        const messagesRef = collection(db, 'chats', chatRoomId, 'messages');
                        const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
                        const messageSnapshot = await getDocs(q);
                        const latestMessage = messageSnapshot.docs[0]?.data() || { text: 'メッセージがありません', createdAt: 0 };
                        return { ...member, latestMessage: latestMessage.text, latestMessageCreatedAt: latestMessage.createdAt };
                    }));

                    updatedMembers.sort((a, b) => {
                        const createdAtA = new Date(a.latestMessageCreatedAt).getTime();
                        const createdAtB = new Date(b.latestMessageCreatedAt).getTime();
                        return createdAtB - createdAtA;
                    });

                    setMembers(updatedMembers);
                });
            } catch (error) {
                console.error('メンバーの取得エラー: ', error);
            }
        };

        fetchMembers();
    }, [currentUser]);

    // メンバー追加のところ
    const addMember = async (e) => {
        // デフォルトのフォーム送信の動作をさせない
        e.preventDefault();
        try {
            const q = query(collection(db, 'users'), where('memberID', '==', newMemberId));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                console.error('該当するメンバーが見つかりません');
                alert('該当するメンバーが見つかりません');
                return;
            }
            
            // メンバーIDがuserコレクションにあったら、新しい追加ユーザーの情報取得
            const memberData = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    memberID: data.memberID,
                    username: data.author?.username || '',
                    author: {
                        icon: auth.currentUser.photoURL
                    }
                };
            });

            // チャットルームIDを生成させるところ
            const userDocRef = doc(db, 'users', currentUser.uid);
            const membersCollectionRef = collection(userDocRef, 'MemberList');
            const chatRoomId = [currentUser.memberID, newMemberId].sort().join('_');
            const chatRoomQuery = await getDoc(doc(db, 'chats', chatRoomId));
            if (chatRoomQuery.exists()) {
                console.error('既に存在するチャットルームIDです');
                alert('既に存在するチャットルームIDです');
                return;
            }

            // 新しいメンバーのデータをusersコレクションから参照して格納
            await Promise.all(memberData.map(async (member) => {
                await addDoc(membersCollectionRef, {
                    memberID: newMemberId,
                    username: member.username || '',
                    chatRoomId,
                    author: {
                        icon: auth.currentUser.photoURL
                    },
                });
                // 相手のメンバーリストにこちら側の情報も追加
                const otherUserDocRef = doc(db, 'users', member.id);
                const otherMembersCollectionRef = collection(otherUserDocRef, 'MemberList');
                const { displayName } = currentUser;
                const newMemberData = {
                    memberID: currentUser.memberID,
                    username: displayName || '',
                    chatRoomId,
                    author: {
                        icon: auth.currentUser.photoURL
                    },
                };
                await addDoc(otherMembersCollectionRef, newMemberData);
            }));

            setNewMemberId('');
        } catch (error) {
            console.error('メンバーの追加エラー: ', error);
        }
    };

    if (!currentUser) {
        return <p>認証されていないユーザーです</p>;
    }

    return (
        <div className='sub-page'>
            <SubPageTitle title={pageTitle} backgroundColor="#EC8A8A" />
            <div className='wrapper'>
                <div className='member-list'>
                    <form onSubmit={addMember}>
                        <input type="text" value={newMemberId} onChange={(e) => setNewMemberId(e.target.value)} placeholder="相手のIDを入力" />
                        <button type="submit">Memberを追加 +</button>
                    </form>
                    <h2>MemberList</h2>
                    <ul>
                        {members.map(member => (
                            <li key={member.id}>
                                <Link className="message-wrapper" to={`/chat/${member.chatRoomId}`}>
                                    <div className="user-icon">
                                        <p className='sender'>{member.username}</p>
                                        <p className='latest-message'>{member.latestMessage}</p>
                                    </div>
                                    <p className='latest-message-time'>
                                        {member.latestMessageCreatedAt ? new Date(member.latestMessageCreatedAt).toLocaleString('ja-JP', {
                                            year: 'numeric',
                                            month: 'numeric',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric'
                                        }) : ''}
                                    </p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Chat;