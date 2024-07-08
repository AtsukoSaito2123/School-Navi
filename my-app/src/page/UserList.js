import React, { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../Firebace';  // Firebaseの初期化設定が記述されているところ

const UserList = () => {
    // 空の配列を定義
    const [users, setUsers] = useState([]);

    // ユーザー一覧を取得する関数
    const fetchUsers = () => {
        getDocs(collection(db, 'users'))
            // データ取得更新でthenメゾット実行
            .then((userCollection) => {
                const userList = userCollection.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsers(userList);
                // set関数でusers変数をuserListの値で更新
            })
            // データ取得失敗でcatchメゾット実行
            .catch((error) => {
                console.error("Error fetching users: ", error);
                // データが取得できていない時にエラー表示
            });
    };

    // fetchUsers()をhandleRoleChange内でもつかうので、useuseEffectの外でfetchUsers関数を定義する必要がある
    useEffect(() => {
        fetchUsers(); // コンポーネントがマウントされた時にユーザーリストを取得
        // 第二引数が空の配列なので、初回マウントされたときにのみ実行
    }, []);


    const handleRoleChange = (userId, newRole) => {
        updateDoc(doc(db, 'users', userId), {
            // ルール(adminかuserか)を更新
            role: newRole
        })
            .then(() => {
                // 更新が成功したら、ユーザーリストを再取得して表示を更新する
                fetchUsers();
            })
            .catch(error => {
                console.error("Error updating user role: ", error);
            });
    };

    // ボタンクリックでhandleRoleChange()関数がよびだされて、ユーザーのステータスが更新されると、
    // fetchUsers関数が呼び出されて、ユーザーリストが再取得されて更新される仕組みで、adminとuserのステータスを変えられるようにした。

    return (
        <div className='UsersList'>
            <h2>- Userリスト- </h2>
            <table>
                <tbody>
                    <tr>
                        <th>お子様名前</th>
                        <th> 保護者</th>
                        <th>ID</th>
                        <th>ステータス</th>
                        <th>ステータス変更</th>
                    </tr>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>
                                {Array.isArray(user.childName) ? user.childName.map((name, index) => (
                                    // 子供の名前が複数になったときに余分な<div>などのグルーピングをさせないためのReact.Fragment
                                    <React.Fragment key={index}>
                                        {name}
                                        <br />
                                    </React.Fragment>
                                )) : user.childName}
                            </td>
                            <td>{user.author.username}</td>
                            <td>{user.memberID}</td>
                            <td>{user.role}</td>
                            <td>
                                {/* 役割を更新するボタン */}
                                <button onClick={() => handleRoleChange(user.id, 'admin')}>管理者に設定</button>
                                <button onClick={() => handleRoleChange(user.id, 'user')}>一般ユーザーに設定</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserList;
