import React, { useEffect, useState } from 'react';
import '../css/Attendance.css';
import SubPageTitle from '../components/SubPageTitle';
import { Link } from "react-router-dom";
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../Firebace';

const Attendance = () => {
  const pageTitle = {
    en: 'Attendance',
    ja: '出欠確認'
  };

  // ログインしたユーザーのUIDを取得
  const userId = auth.currentUser.uid;

  const [postList, setPostList] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false); // 管理者フラグ

  useEffect(() => {
    const checkAdminStatus = async () => {
      // ユーザーのカスタムクレームを確認して管理者かどうかを判断
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setIsAdmin(userData.isAdmin || false);
      }
    };

    checkAdminStatus();
  }, [userId]);

  useEffect(() => {
    const getUserData = async () => {
      // Firebaseの"user"ドキュメントからユーザーデータを取得
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role; // "role"フィールドの値を取得
        
        // 管理者の場合は全員の出席情報を表示
        let isAdmin = userRole === "admin";
        
        // コレクションpostsを取得
        const postDocs = await getDocs(collection(db, "posts"));
        const posts = postDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
        // 管理者の場合は全員の出席情報を表示
        let filteredPosts = posts;
        if (isAdmin) {
          // フィルタリングなし
        } else {
          // ログインしたユーザーのUIDを使用して出席情報をフィルタリングし、ログインしている人が送信した内容だけ表示
          filteredPosts = posts.filter(post => post.author.id === userId);
        }
  
        // 投稿日時の降順にソート
        const sortedPosts = filteredPosts.sort((a, b) => b.date.toMillis() - a.date.toMillis());
  
        setPostList(sortedPosts);
      } else {
        console.log("User data not found");
      }
    };
  
    getUserData();
  }, [userId,isAdmin]); // userIdが変更されるたびに再レンダリングする
  
  
  
  

  return (
    <div className='sub-page'>
      <SubPageTitle title={pageTitle} backgroundColor="#C0D87B" />
      <div className='wrapper'>
        <Link className='AttendanceReportBtn' to="/School-Navi/attendance-report">
          出欠連絡をする
        </Link>
        <section className='Report'>
          <h3>＊連絡一覧＊</h3>
          <ul className='ReportList'>
            {postList.map((post) => {
              return (
                <li key={post.id}>
                  <div className='list-inner'>
                    <span>
                      {Array.isArray(post.selectedChildren) ? post.selectedChildren.join('・') : ''}：
                      {post.selectedOption}
                    </span>
                    {post.date.toDate().toLocaleDateString()}
                    {' '}
                    {post.date.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {post.reasonText}
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default Attendance;
