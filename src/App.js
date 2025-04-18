import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import NavBar from './components/NavBar';

import LoginPage from './components/LoginPage';
import Home from './components/Home';
import AdminBoard from './components/AdminBoard';
import TeacherBoard from './components/TeacherBoard';
import UserBoard from './components/UserBoard';
import Profile from './components/Profile'
import SignupPage from './components/SignupPage';
import VerifyPage from './components/VerifyPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';

import { Routes, Route} from "react-router-dom";

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
        </Routes>
      </div>
    </div>
  );
}

export default App;
