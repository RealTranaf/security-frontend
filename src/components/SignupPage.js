import React, { useState, useRef } from 'react'
import { signup } from '../services/auth-service';
import logo from '../resource/logo.jpg'
import { useNavigate } from 'react-router-dom';

function SignupPage() {

    const form = useRef()
    const navigate = useNavigate()

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("")
    const [successful, setSuccessful] = useState(false)
    const [message, setMessage] = useState("")
    const [errors, setErrors] = useState({})

    const validateForm = () => {
        const newErrors = {}
        if (!username) {
            newErrors.username = "Username is required"
        } else if (username.length < 3 || username.length > 20) {
            newErrors.username = "Username must be between 3 and 20 characters!"
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email) {
            newErrors.email = "Email is required!"
        } else if (!emailRegex.test(email)) {
            newErrors.email = "This is not a valid email!"
        }

        if (!password) {
            newErrors.password = "Password is required!"
        } else if (password.length < 6 || password.length > 40) {
            newErrors.password = "Password must be between 6 and 40 characters!"
        }

        if (!role) {
            newErrors.role = "Role is required!"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0;
    }
    const onChangeUsername = (e) => {
        const username = e.target.value
        setUsername(username)
    }

    const onChangeEmail = (e) => {
        const email = e.target.value
        setEmail(email)
    }

    const onChangePassword = (e) => {
        const password = e.target.value
        setPassword(password)
    }

    const onChangeRole = (e) => {
        const role = e.target.value
        setRole(role)
    }

    const handleSignup = async (e) => {
        e.preventDefault()

        setMessage("")
        setSuccessful(false)

        if (validateForm()) {
            try {
                const response = await signup(username, email, password, role)
                setMessage(response.data.message)
                setSuccessful(true)
            } catch (error) {
                const resMessage = (error.response?.data?.message) || error.message || "An error occurred during signup."
                setMessage(resMessage)
                setSuccessful(false)
            }
        }
    }

    const redirectToVerify = () => {
        navigate('/verify', { state: { username } });
    };

    return (
        <div className='container d-flex justify-content-center align-items-center'>
            <div className='card card-container'>
                <div className='text-center mb-3'>
                    <img
                        src={logo}
                        alt="profile-img"
                        className="profile-img-card"
                    />
                </div>
                <form onSubmit={handleSignup} ref={form}>
                    {!successful && (
                        <div className='container'>
                            <div className='mb-3'>
                                <label htmlFor='username'>Username</label>
                                <input
                                    type='text'
                                    className='form-control'
                                    name='username'
                                    value={username}
                                    onChange={onChangeUsername}
                                >
                                </input>
                                {errors.username && (
                                    <div className='alert alert-danger' role='alert'>
                                        {errors.username}
                                    </div>
                                )}
                            </div>
                            <div className='mb-3'>
                                <label htmlFor='email'>Email</label>
                                <input
                                    type='text'
                                    className='form-control'
                                    name='email'
                                    value={email}
                                    onChange={onChangeEmail}
                                >
                                </input>
                                {errors.email && (
                                    <div className='alert alert-danger' role='alert'>
                                        {errors.email}
                                    </div>
                                )}
                            </div>
                            <div className='mb-3'>
                                <label htmlFor='password'>Password</label>
                                <input
                                    type='password'
                                    className='form-control'
                                    name='password'
                                    value={password}
                                    onChange={onChangePassword}
                                >
                                </input>
                                {errors.password && (
                                    <div className='alert alert-danger' role='alert'>
                                        {errors.password}
                                    </div>
                                )}
                            </div>
                            <div className='mb-3'>
                                <label htmlFor='role'>Role</label>
                                <select
                                    className='form-control'
                                    name='role'
                                    value={role}
                                    onChange={onChangeRole}
                                >
                                    <option value="">Select a role</option>
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="MANAGER">Manager</option>
                                </select>
                                {errors.role && (
                                    <div className='alert alert-danger' role='alert'>
                                        {errors.role}
                                    </div>
                                )}
                            </div>
                            <div className="mb-3">
                                <button className="btn btn-primary">Sign Up</button>
                            </div>
                        </div>
                    )}
                    {message && (
                        <div className='mb-3'>
                            <div className={successful ? "alert alert-success text-center" : "alert alert-danger text-center"} role="alert">
                                {message}
                            </div>
                        </div>
                    )}
                    {successful && (
                        <div className="text-center">
                            To complete the signup process, you will need to verify your account!
                            <button
                                className="btn btn-secondary"
                                onClick={redirectToVerify}
                            >
                                Go to Verification
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}

export default SignupPage