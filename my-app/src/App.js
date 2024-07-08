import './App.css';
import Home from './page/Home';
import Attendance from './page/Attendance';
import School from './page/School';
import Chat from './page/Chat';
import Calender from './page/Calender';
import Class from './page/Class';
import Logout from './page/Logout';
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import HomeHeader from './components/HomeHeader';
import AttendanceReport from './page/AttendanceReport';
import Account from './components/Account';
import UserLogin from './page/UserLogin';
import UserList from './page/UserList';
import Setting from './page/Setting';
import AccountAdd from './page/AccountAdd';
import ChatArea from './page/ChatArea';


function App() {
  // ログインしているときとしていない時で、表示部分を変えたいので、ログインしている状態を初期値に設定し、使いたいところで呼び出す。
  const [isAuth, setIsAuth] = useState(localStorage.getItem("isAuth") === 'true');

  return (
    <div className="App">

        <HomeHeader isAuth={isAuth} />
        <Routes>
          {/* isAuthログインしているときのみ表示部分 */}
          {isAuth ? (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/attendance-report" element={<AttendanceReport />} />
              <Route path="/school" element={<School />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:memberId" element={<ChatArea />} />
              <Route path="/setting" element={<Setting />} />
              <Route path="/calender" element={<Calender />} />
              <Route path="/class" element={<Class />} />
              <Route path="/account" element={<Account />} />
              <Route path="/userlist" element={<UserList />} />
              <Route path="/accountadd" element={<AccountAdd />} />
              <Route path="/logout" element={<Logout setIsAuth={setIsAuth} />} />
            </>
          ) : (
            <Route path="/userlogin" element={<UserLogin setIsAuth={setIsAuth} />} />
          )}
        </Routes>
    </div>
  );
}

export default App;
