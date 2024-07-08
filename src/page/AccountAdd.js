import { useEffect, useState } from 'react';
import { db, auth } from '../Firebace'; 
import { doc, updateDoc, getDoc } from 'firebase/firestore'; 
const AccountAdd = () => {
  const [siblingName, setSiblingName] = useState(''); // 初期値を空文字列に修正
  const [childNames, setChildNames] = useState([]); // 初期値を空配列に修正

  // fetchUserDataはchildNames情報を取得して表示させる関数
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
        setChildNames(userData.childName || []); // childNameがない場合の対処
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
        let { childName = [] } = userData;

        if (!childName.includes(sibling)) {
          const updatedChildName = [...childName, sibling];
          await updateDoc(userDocRef, { childName: updatedChildName });
          setChildNames(updatedChildName);
          setSiblingName(''); // 兄弟データを追加後、入力欄を空の文字列に変更
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
