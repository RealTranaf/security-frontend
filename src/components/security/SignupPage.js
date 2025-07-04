import React, { useState, useRef } from 'react'
import { signup } from '../../services/auth-service'
import logo from '../../resource/logo.png'
import { useNavigate, Link } from 'react-router-dom'
import backgroundImg from '../../resource/bkhn-c1.jpg'

function SignupPage() {
    const form = useRef()
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('')
    const [successful, setSuccessful] = useState(false)
    const [message, setMessage] = useState('')
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const validateForm = () => {
        const newErrors = {}
        if (!username) {
            newErrors.username = 'Username is required'
        } else if (username.length < 3 || username.length > 20) {
            newErrors.username = 'Username must be between 3 and 20 characters!'
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email) {
            newErrors.email = 'Email is required!'
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'This is not a valid email!'
        }

        if (!password) {
            newErrors.password = 'Password is required!'
        } else if (password.length < 6 || password.length > 40) {
            newErrors.password = 'Password must be between 6 and 40 characters!'
        }

        if (!role) {
            newErrors.role = 'Role is required!'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }
    const onChangeUsername = (e) => {
        setUsername(e.target.value)
    }

    const onChangeEmail = (e) => {
        setEmail(e.target.value)
    }

    const onChangePassword = (e) => {
        setPassword(e.target.value)
    }

    const onChangeRole = (e) => {
        setRole(e.target.value)
    }

    const handleSignup = async (e) => {
        e.preventDefault()
        setMessage('')
        setSuccessful(false)
        setLoading(true)

        if (validateForm()) {
            try {
                const response = await signup(username, email, password, role)
                setMessage(response.data.message)
                setSuccessful(true)
            } catch (error) {
                const resMessage = (error.response?.data?.message) || error.message || 'An error occurred during signup.'
                setMessage(resMessage)
                setSuccessful(false)
                setLoading(false)
            }
        } else {
            setLoading(false)
        }
    }

    const redirectToVerify = () => {
        navigate('/verify', { state: { username } })
    }

    return (
        <div className='container-fluid d-flex justify-content-center align-items-start min-vh-100 position-relative security-bg'>
            <div
                className='bg-overlay'
                style={{ backgroundImage: `url(${backgroundImg})` }}
            >
            </div>
            <div className='card shadow-lg p-4 security-card' style={{ zIndex: 1}}>
                <div className='text-center mb-3'>
                    <img
                        src={logo}
                        alt='profile-img'
                        className='rounded-circle mb-2 security-logo'
                    />
                    <h3 className='fw-bold mb-0' style={{ color: 'var(--main-red)' }}>Sign Up</h3>
                </div>
                <form onSubmit={handleSignup} ref={form} autoComplete='off'>
                    {!successful && (
                        <div>
                            <div className='mb-3'>
                                <label htmlFor='username' className='form-label fw-semibold'>Username</label>
                                <input
                                    type='text'
                                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                    name='username'
                                    value={username}
                                    onChange={onChangeUsername}
                                    autoFocus
                                >
                                </input>
                                {errors.username && (
                                    <div className='invalid-feedback'>
                                        {errors.username}
                                    </div>
                                )}
                            </div>
                            <div className='mb-3'>
                                <label htmlFor='email' className='form-label fw-semibold'>Email</label>
                                <input
                                    type='text'
                                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                    name='email'
                                    value={email}
                                    onChange={onChangeEmail}
                                >
                                </input>
                                {errors.email && (
                                    <div className='invalid-feedback'>
                                        {errors.email}
                                    </div>
                                )}
                            </div>
                            <div className='mb-3'>
                                <label htmlFor='password' className='form-label fw-semibold'>Password</label>
                                <input
                                    type='password'
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    name='password'
                                    value={password}
                                    onChange={onChangePassword}
                                >
                                </input>
                                {errors.password && (
                                    <div className='invalid-feedback'>
                                        {errors.password}
                                    </div>
                                )}
                            </div>
                            <div className='mb-3'>
                                <label htmlFor='role' className='form-label fw-semibold'>Role</label>
                                <select
                                    className={`form-control ${errors.role ? 'is-invalid' : ''}`}
                                    name='role'
                                    value={role}
                                    onChange={onChangeRole}
                                >
                                    <option value=''>Select a role</option>
                                    <option value='STUDENT'>Student</option>
                                    <option value='TEACHER'>Teacher</option>
                                </select>
                                {errors.role && (
                                    <div className='invalid-feedback'>
                                        {errors.role}
                                    </div>
                                )}
                            </div>
                            <div className='d-grid mb-3'>
                                <button className='btn btn-primary btn-lg' disabled={loading}>
                                    {loading && (
                                        <span className='spinner-border spinner-border-sm me-2'></span>
                                    )}
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    )}
                    {message && (
                        <div className='mb-3'>
                            <div className={successful ? 'alert alert-success text-center' : 'alert alert-danger text-center'} role='alert'>
                                {message}
                            </div>
                        </div>
                    )}
                    {successful && (
                        <div className='d-grid mb-3'>
                            <div className='mb-2'>
                                To complete the signup process, you will need to verify your account!
                            </div>
                            <button
                                className='btn btn-primary'
                                onClick={redirectToVerify}
                                type='button'
                            >
                                Go to Verification
                            </button>
                        </div>
                    )}
                </form>
                <div className='text-center mt-2'>
                    <span className='text-muted small'>Already have an account? </span>
                    <Link to='/login' className='small text-decoration-none'>
                        Login
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default SignupPage