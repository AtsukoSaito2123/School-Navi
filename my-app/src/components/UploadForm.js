import { useEffect, useRef, useState } from 'react';
import { collection, addDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { db, storage } from '../Firebace';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// 親コンポーネントからfolder と collectionPath という props を受け取っている
// 親コンポーネントの例
// <UploadForm folder="school" collectionPath="school" />
// UploadFormコンポーネントにpropsとしてfolderとcollectionPathを渡す
//  親コンポーネントから渡された folder と collectionPath を使ってファイルを特定のフォルダにアップロードし、指定されたコレクションにドキュメントを追加

const UploadForm = ({ folder, collectionPath }) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const auth = getAuth();
    const fileInputRef = useRef(null);
    const types = 'application/pdf';

    // ログインしているユーザーが管理者なのか、一般ユーザーなのかの区別する必要あり
    // 一番最初にアプリにログインした人を管理者に設定⇒UserLogin.js参照
    // 管理者を変更したり、追加したりできる機能も追加、settingページのUserListページ参照

    // 管理者にのみ表示するといった実装をする必要がある
    useEffect(() => {
        // checkAdminは関数で非同期処理、引数でuserのを受け取ってる
        const checkAdmin = async (user) => {
            if (user) {
                // ユーザーがログインしている場合
                // ログインしているユーザーがadminかどうかを確認するためにuser.uidに対応するドキュメントを参照
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
                    // === はJavaScriptにおける厳密な等価演算子
                    // 左辺と右辺の値がデータ型も含めて完全に一致する場合に true を返す
                    //  adminの場合true,そうでない場合falseをsetIsAdminでisAdminの値を更新
                }
            }
        };
        // ユーザー認証状態の管理
        // onAuthStateChangedは使用してユーザーの認証状態を監視する関数。
        // アンサブスクライブ・・・リアルタイムで監視を停止するメゾット。停止させたいところで呼び出す。
        const unsubscribe = onAuthStateChanged(auth, (user) => {
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


    const handleChange = (e) => {
        // eはonChange イベントを指す
        // onChangeとは、フォーム内のエレメント（要素）の内容が変更された時に起こるイベント処理
        // targetは入力フィールド、つまりここだとinputフィールドを指す
        let selected = e.target.files[0];// 選択された最初のファイルを取得
        // ＆＆ファイルを選択しているときにのみ実行
        // includes 関数は、JavaScript の配列や文字列において、指定した値が含まれているかどうかを確認するためのメソッド
        if (selected && types.includes(selected.type)) {
            setFile(selected); // 選択されたファイルがPDFファイルだったときのみにset関数でファイルをセット
            setError('');// エラーメッセージをクリア
        } else {
            setFile(null);// 無効なファイルが選択された場合、state をクリア
            setError('PDFファイルのみアップロードできます');// エラーメッセージを設定
        }
    };


    const handleUpload = async (e) => {
        // eはonSubmitを指す
        // 非同期処理でフォームのデータを格納するために通常のフォーム送信の動作を制御
        e.preventDefault();
        if (!file) return;
        // 論理否定演算子:もし file が false ならnull
        // ファイルが選択されていない場合は、以降の処理を行わずに関数が終了
        try {
            const fileName = file.name; //setFile(selected);で更新されたfileのname
            //ファイルの格納場所にfirebaseのstrageを使用。
            // storageは画像・動画・ドキュメントなどのファイルを保存するのに適している
            // `${folder}/${fileName}`はファイルパス
            // ref関数は特定のコレクションやドキュメントを取得するときに使う
            const storageRef = ref(storage, `${folder}/${fileName}`);
            // uploadBytesは、Firebase Storage を使用してバイトデータをアップロードするための関数
            await uploadBytes(storageRef, file);
            // getDownloadURL(storageRef) は、Firebase Storage で指定したファイルのダウンロード用のURLを取得するためのメソッド
            const url = await getDownloadURL(storageRef);

            const fileDoc = {
                name: file.name,
                url: url,
                createdAt: Timestamp.now()
            };

            await addDoc(collection(db, collectionPath), fileDoc);
            // UploadFormコンポーネントを呼び出すときに、folder名とcollectionPathを指定してあげると、指定のフォルダへ格納される
            // たとえば<UploadForm folder="school" collectionPath="school" /> 
            setFile(null);
            fileInputRef.current.value = '';  // inputフィールドをリセット
        } catch (err) {
            console.error('Upload failed:', err);
            setError('アップロードに失敗しました。再度お試しください。');
        }
    };

    // 管理者じゃない場合は、値なしになり表示されない
    // 論理否定演算子:もし isAdmin が false ならnull
    if (!isAdmin) {
        return null;
    }

    return (
        <form className='UploadForm' onSubmit={handleUpload}>
            <label className='FileUpload'>
                <input type="file" onChange={handleChange} ref={fileInputRef} />
            </label>
            <div className="output">
                {error && <div className="error">{error}</div>}
                {/* ファイルがあるときのみ実行 */}
                {file && <button type="submit">アップロードする</button>}
            </div>
        </form>
    );
};


export default UploadForm;

