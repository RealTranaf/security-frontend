import './App.css'
import "bootstrap/dist/css/bootstrap.min.css"
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import "bootstrap-icons/font/bootstrap-icons.css"
import { Routes, Route } from "react-router-dom"

import NavBar from './components/NavBar'
import LoginPage from './components/security/LoginPage'
import Home from './components/Home'
import AdminBoard from './components/AdminBoard'
import TeacherBoard from './components/TeacherBoard'
import UserBoard from './components/UserBoard'
import Profile from './components/Profile'
import SignupPage from './components/security/SignupPage'
import VerifyPage from './components/security/VerifyPage'
import ForgotPasswordPage from './components/security/ForgotPasswordPage'
import ResetPasswordPage from './components/security/ResetPasswordPage'
import CreateRoomPage from './components/CreateRoomPage'
import RoomPage from './components/room/RoomPage'
import RoomUsersPage from './components/room/userlist/RoomUsersPage'
import WeeklyReportPage from './components/room/assignment/WeeklyReportPage'

function App() {
    return (
        <div>
            <NavBar></NavBar>
            <div className="container mt-3">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/user" element={<UserBoard />} />
                    <Route path="/teacher" element={<TeacherBoard />} />
                    <Route path="/admin" element={<AdminBoard />} />
                    <Route path="/verify" element={<VerifyPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/create-room" element={<CreateRoomPage />} />
                    <Route path="/rooms/:roomId" element={<RoomPage />} />
                    <Route path="/profile/:username" element={<Profile />} />
                    <Route path="/rooms/:roomId/users" element={<RoomUsersPage />} />
                    <Route path="/rooms/:roomId/weekly-report" element={<WeeklyReportPage />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
