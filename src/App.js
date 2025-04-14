import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import NavBar from './components/NavBar';

import LoginPage from './components/LoginPage';
import Home from './components/Home';
import AdminBoard from './components/AdminBoard';
import ManagerBoard from './components/ManagerBoard';
import UserBoard from './components/UserBoard';
import Profile from './components/Profile'
import SignupPage from './components/SignupPage';
import VerifyPage from './components/VerifyPage';

import { Routes, Route, Link } from "react-router-dom";

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
          <Route path="/manager" element={<ManagerBoard />} />
          <Route path="/admin" element={<AdminBoard />} />
          <Route path="/verify" element={<VerifyPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
