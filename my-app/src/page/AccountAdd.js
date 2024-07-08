import { useEffect, useState } from 'react';
import { db, auth } from '../Firebace'; // Firebaseのインポート修正
import { doc, updateDoc, getDoc } from 'firebase/firestore'; // Firestore関連のメソッドをインポート

const AccountAdd = () => {
  const [siblingName, setSiblingName] = useState([]);
  const [childNames, setChildNames] = useState([]);
  // fetchUserDataはchildNames情報を取得して表示させる関数
  const fetchUserData = async () => {
    try {
      // ログインしているユーザーの情報が欲しいので、currentUserにauthenticationからログインしているユーザーの情報を取得
      // auth.currentUserで現在のログインしているユーザー情報を取得
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.error('User not logged in');
        return;
      }
      // ログインしているユーザーのドキュメント参照先を取得
      const userDocRef = doc(db, 'users', currentUser.uid);
      // getDocドキュメントを取得
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        // exists()でドキュメントが存在するかどうかを確認
        // userコレクションにchildNameが格納されているので、usersコレクションのデータを取得
        const userData = userDoc.data();//data()関数でドキュメントのフィールドと値を含むデータをuserData変数に格納してchildNameを取得するときによびだす。

        setChildNames(userData.childName);

      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  // fetchUserData関数がログインしているユーザー情報を取得して、コンポーネントを更新しているので、
  // onAuthStateChangedでログインの認証状態を監視することで、最新のユーザー情報を取得することができる

  // useEffectを使って、fetchUserData()を実行するタイミングを設定。
  useEffect(() => {
    // onAuthStateChanged認証状態を監視する
    // ログイン状態が変化するたびにonAuthStateChangedが呼び出される
    // ユーザーがログインしている場合、fetchUserDataが実行されてユーザーのデータが取得され更新される
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {

        fetchUserData();
      }
    });
    // コンポーネントがアンマウントされるときにクリーンアップ関数としてunsubscribeを呼び出す
    return () => unsubscribe();

  }, []);



  //handleAddSiblingはデータベースに兄弟姉妹を追加する関数
  const handleAddSibling = async (e) => {
    e.preventDefault();//フォームが送信された際に、ページがリロードされることを防ぐために使用
    // ログインしているユーザー情報に追加したいのでカレントユーザー情報を取得
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('認証されたユーザーが存在しません');
      return;
    }
    // 余分な空白文字が含まれてしまうと、意図しないエラーや不具合が発生する可能性があるため、
    // trim()を使って余分な余白を取り除いた文字列にする
    const sibling = siblingName;
    // if (!sibling)で入力データが空であるかどうかを判断して、
    // ユーザーが何も入力せずにフォームを送信した場合にデータベースに追加する処理は終了
    // 名前が入っていればデータベースに追加する処理を続行
    if (!sibling) {
      console.error('名前の入力が必須です');
      alert('名前を入力してください。'); // 名前入力を促すメッセージを表示
      return;
    }

    try {
      // ログインしているユーザーのドキュメント参照先を取得
      const userDocRef = doc(db, 'users', currentUser.uid);
      // getDocドキュメントを取得
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
      
        let { childName } = userData;

        // すでに登録されている名前は追加させないようにするために、
        // includes関数でchildNameに入力した名前があるかどうかを判断し、無い場合にのみ実行させてます。
        if (!childName.includes(sibling)) {
          // 兄弟情報を追加する処理
          const updatedChildName = [...childName, sibling];//新しい兄弟の名前を追加した新しい配列
          // updateDocでusersコレクション内のドキュメントのchildNameフィールドをupdatedChildNameに更新
          await updateDoc(userDocRef, { childName: updatedChildName });
          // setChildNames(updatedChildName) は、新しい兄弟を追加した直後にset関数でstateを更新して画面上で即座に反映させる
          setChildNames(updatedChildName);
          // 兄弟データを追加後、inputフィールドに入力データが残らないように、入力欄を空の配列に変更
          setSiblingName([]);
        }
      }
    } catch (error) {
      console.error('アップデートエラー', error);
    }
  };


  return (
    <div className='AccountAdd'>
      <h2>兄弟姉妹の追加はこちらから</h2>
      {/* 送信した時にhandleAddSiblingを呼び出して、兄弟追加を実行 */}
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
