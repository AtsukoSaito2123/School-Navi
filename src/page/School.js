import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../Firebace'; // Firestoreを初期化したファイルからdbをインポート
import SubPageTitle from '../components/SubPageTitle';
import UploadForm from '../components/UploadForm';

const School = () => {
  const pageTitle = {
    en: 'School',
    ja: '学校だより'
  };

  // file変数の初期値が空の配列と定義
  const [files, setFiles] = useState([]);

  

  useEffect(() => {
    // shoolコレクション参照
    const filesCollection = collection(db, 'school');
    
    // snapshotはドキュメント全体のデータを示す
    // snapshot.docsは各ドキュメントのこと
    const unsubscribe = onSnapshot(filesCollection, (snapshot) => {
      const filesData = snapshot.docs.map(doc => {
        // map関数で新しい配列に展開
        const data = doc.data();// Firestore ドキュメントのデータを取得
        return {
          id: doc.id, // Firestore ドキュメントの ID
          ...data,// Firestore ドキュメントのデータを展開して新しいオブジェクト展開(スプレッド演算子)
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date() // タイムスタンプをDateオブジェクトに変換
          // 参考演算子⇒条件式 ? 真の場合の値 : 偽の場合の値
          // createdAtのデータがある場合、toDate()関数でDateオブジェクトに変換
          // createdAtのデータがない場合new Date()関数で日時を取得
        };
      });
      // ソート関数を使って古い順に並べ替え
      filesData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setFiles(filesData);
    });

    // クリーンアップ関数を返して、コンポーネントがアンマウントされたときに監視を解除する
    return () => {
      unsubscribe();
    };

    // 第二引数が空の配列なので、初回マウントされたときにのみ実行
  }, []);

  // 別タブでPDFファイルが開くように
  const openFileInNewTab = (url) => {
    window.open(url, '_blank', 'noopener noreferrer');
  };

  
  return (
    <div className='sub-page'>
      <SubPageTitle title={pageTitle} backgroundColor="#B696C6" />
      <div className='wrapper'>
      </div>
      <h3 className='FileTitle'>Files</h3>
      <ul>
        {files.map(file => (
          <li className='FileList' key={file.id} onClick={() => openFileInNewTab(file.url)}>
            <span>{file.name}</span>
            {file.createdAt.toLocaleDateString('ja-JP')} {file.createdAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </li>
        ))}
      </ul>
      <UploadForm folder="school" collectionPath="school" />
    </div>
  );
};

export default School;
