import React, { useEffect, useState } from 'react'
import SubPageTitle from '../components/SubPageTitle';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../Firebace';
import UploadForm from '../components/UploadForm';

const Class = () => {
  const pageTitle = {
    en: 'Class',
    ja: 'クラスだより'
  };

  const [files, setFiles] = useState([]);

  useEffect(() => {


    const fetchFiles = async () => {
      const filesCollection = collection(db, 'class');
      const unsubscribe = onSnapshot(filesCollection, (snapshot) => {
        const filesData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt ? data.createdAt.toDate() : new Date() // タイムスタンプをDateオブジェクトに変換
          };
        });

        filesData.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        setFiles(filesData);
      });

      return unsubscribe;
    };

    fetchFiles();
  }, []);

  // 別タブでPDFファイルが開くように
  const openFileInNewTab = (url) => {
    window.open(url, '_blank', 'noopener noreferrer');
  };


  return (
    <div className='sub-page'>
      <SubPageTitle title={pageTitle} backgroundColor="#DFC361" />
      <div className='wrapper'>
      </div>
      <h3 className='FileTitle'>title</h3>
      <ul>
        {files.map(file => (
          <li className='FileList' key={file.id} onClick={() => openFileInNewTab(file.url)}>
            <span>{file.name}</span>
            {file.createdAt.toLocaleDateString('ja-JP')} {file.createdAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </li>
        ))}
      </ul>
      <UploadForm folder="class" collectionPath="class" />
    </div>
  )
}


export default Class

