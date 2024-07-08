import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, db, provider } from '../Firebace';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

const UserLogin = ({ setIsAuth }) => {
  const navigate = useNavigate();

  // 初期値を空の配列に変更
  const [childName, setChildName] = useState([]);
  const [memberID, setMemberID] = useState('');
  const [showChildNameInput, setShowChildNameInput] = useState(false);
  const [showMemberIDInput, setShowMemberIDInput] = useState(false);

  const handleChildNameChange = (e) => {
    // 入力された名前を配列に追加
    setChildName([e.target.value]);
  };

  const handleMemberIDChange = (e) => {
    setMemberID(e.target.value);
  };

  const loginInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        if (childName.length === 0 || !memberID) {
          setShowChildNameInput(true);
          setShowMemberIDInput(true);
          return;
        }

        const usersCollectionRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollectionRef);

        let status = 'user';
        if (usersSnapshot.empty) {
          status = 'admin';
        }

        const userData = {
          role: status,
          childName: childName, // ここで配列として保存
          memberID: memberID,
          author: {
            username: auth.currentUser.displayName,
            id: auth.currentUser.uid,
            icon: auth.currentUser.photoURL
          },
        };
        await setDoc(userDocRef, userData);
      }

      setIsAuth(true);
      localStorage.setItem('isAuth', true);
      navigate('/School-Navi/');
    } catch (error) {
      console.error('Error logging in with Google', error);
    }
  };

  return (
    <div className='Login'>
      <p>ログインして始める</p>
      {showChildNameInput && (
        <>
          <input
            type='text'
            placeholder='子供の名前を入力してください'
            onChange={handleChildNameChange}
          />
          <br />
        </>
      )}
      {showMemberIDInput && (
        <>
          <input
            type='text'
            placeholder='メンバーIDを入力してください'
            value={memberID}
            onChange={handleMemberIDChange}
          />
          <br />
        </>
      )}
      <button onClick={loginInWithGoogle}>Googleでログイン</button>
    </div>
  );
};

export default UserLogin;
