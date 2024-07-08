import { useEffect, useState } from 'react';
import { db, auth } from '../Firebace'; // Firebaseのインポート修正
import { doc, updateDoc, getDoc } from 'firebase/firestore'; // Firestore関連のメソッドをインポート

const AccountAdd = () => {
  const [siblingName, setSiblingName] = useState(''); // 修正: 文字列として初期化
  const [childNames, setChildNames] = useState([]);
  
  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('User not logged in');
        return;
      }
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setChildNames(userData.childName || []); // データがない場合は空配列
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAddSibling = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('認証されたユーザーが存在しません');
      return;
    }

    const sibling = siblingName.trim();
    if (!sibling) {
      console.error('名前の入力が必須です');
      alert('名前を入力してください。');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        let { childName } = userData;
        if (!childName.includes(sibling)) {
          const updatedChildName = [...childName, sibling];
          await updateDoc(userDocRef, { childName: updatedChildName });
          setChildNames(updatedChildName);
          setSiblingName(''); // 修正: 空文字列にリセット
        } else {
          alert('この名前は既に登録されています。');
        }
      }
    } catch (error) {
      console.error('アップデートエラー', error);
    }
  };

  return (
    <div className='AccountAdd'>
      <h2>兄弟姉妹の追加はこちらから</h2>
      <form onSubmit={handleAddSibling}>
        <input
          type='text'
          value={siblingName}
          onChange={e => setSiblingName(e.target.value)}
          placeholder="兄弟の名前を入力してください"
        />
        <button type="submit">追加する +</button>
      </form>
      <h2>お子様一覧</h2>
      <ul>
        {childNames.map((name, index) => (
          <li key={index}>{name}</li>
        ))}
      </ul>
    </div>
  );
};

export default AccountAdd;
