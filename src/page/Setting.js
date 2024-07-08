import React, { useEffect, useState } from 'react';
import SubPageTitle from '../components/SubPageTitle';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebace';
import { Link } from 'react-router-dom';

const Setting = () => {
  const pageTitle = {
    en: 'Setting',
    ja: '設定'
  };

  // ユーザーの管理者権限をチェックして、管理者であれば、特定のリンクが表示されるように実装

  // isAdminの初期値が権限がないと定義
  const [isAdmin, setIsAdmin] = useState(false);

  // Firebase Authenticationの機能を利用するためにgetAuth();関数を使って、ユーザーの認証状態の監視や操作をおこなう。
  const auth = getAuth();


  useEffect(() => {
    const checkAdmin = async (user) => {
      if (user) {
        // ユーザーが認証されている場合の処理
        // usersコレクションの中でuser.uidに対応するドキュメントを参照
        const userDocRef = doc(db, 'users', user.uid);
        // ドキュメントを取得
        const userDoc = await getDoc(userDocRef);
        // exists()はドキュメントが存在するかどうかを確認。
        // 存在する場合はtrueを返し次のステップへ、存在しない場合はfalseを返しここで終了。
        if (userDoc.exists()) {
          // exists()でtrueがかえってきたら、ドキュメントデータを取得
          const userData = userDoc.data();
          // 取得したデータの中で、roleフィールドがadminかどうかを確認
          setIsAdmin(userData.role === 'admin');
          // adminであればsetIsAdmin(true)を実行し、そうでなければsetIsAdmin(false)を実行
          //厳密等価演算子
          //ユーザーの役割が管理者であるかどうかをチェックして、それに基づいて setIsAdmin関数を呼び出している
        }
      }
      // ユーザーが認証されていない場合は特に処理が必要ないのでelseは不要
    };

    // 関数は「何かを入れると何かをやって何かを返してくれる、処理のまとまり」
    // 引数は「プログラムや関数に渡す値」
    //コールバック関数は関数に引数としてわたされる。関数の中で引数でわたされたコールバック関数が実行されるということ


    // ユーザー認証状態の管理
    // onAuthStateChangedは使用してユーザーの認証状態を監視する関数。
    // アンサブスクライブ・・・リアルタイムで監視を停止するメゾット。停止させたいところで呼び出す。
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // コールバック関数の中でuserがいるかいないかを判断して、認証状態の変化をチェックし認証状態の変化に対応させる
      if (user) {
        // userが存在している(つまりユーザーがログインしている場合）checkAdminを呼び出して、ユーザーの役割を確認する
        checkAdmin(user);
      } else {
        // userが存在しない（つまりユーザーがログアウトしている場合）管理者権限を解除する
        setIsAdmin(false);
      }
    });

    // クリーンアップ関数を返して、コンポーネントがアンマウントされたときに監視を解除する
    return () => unsubscribe();

    // auth オブジェクトが変わった場合、useEffectが再実行される
  }, [auth]);

  return (
    <div className='sub-page'>
      <SubPageTitle title={pageTitle} backgroundColor="#61A2DF" />
      <div className='wrapper'>
        <ul className='SettingList'>
          {/* isAdminがtrueである場合にのみ権限管理設定ボタンが表示されて管理画面をいじれるようになる */}
          {isAdmin && (
            <li>
              <Link to="/School-Navi/userlist">
                権限管理設定
              </Link>
            </li>
          )}
          <li>
            <Link to="/School-Navi/accountadd">
              兄弟追加設定
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Setting

