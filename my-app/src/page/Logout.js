import { signOut } from 'firebase/auth';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../Firebace';

const Logout = ({ setIsAuth }) => {
  const navigate = useNavigate();
  
  const logout = () => {
    // ログアウト処理
    signOut(auth)
      .then(() => {
        // ローカルストレージをクリア
        localStorage.clear();

        // Firebaseセッション情報をクリア
        auth.signOut();

        // setIsAuthをfalseに設定
        setIsAuth(false);

        // /loginページにリダイレクト
        navigate('/School-Navi/login');
      })
      .catch(error => {
        console.error("Logout Error: ", error);
      });
  };

  return (
    <div className='Logout'>
      <p>ログアウトする</p>
      <button onClick={logout}>ログアウト</button>
    </div>
  );
}

export default Logout;
