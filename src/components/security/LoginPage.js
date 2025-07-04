import React, { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import { login } from '../../services/auth-service'
import logo from '../../resource/logo.png'
import backgroundImg from '../../resource/bkhn-c1.jpg'

function LoginPage() {
    const navigate = useNavigate()
    const form = useRef()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [errors, setErrors] = useState({})
    const [enableVerify, setEnableVerify] = useState()

    const validateForm = () => {
        const errors = {}
        if (!username.trim()) {
            errors.username = 'Username is required.'
        }
        if (!password.trim()) {
            errors.password = 'Password is required.'
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters long.'
        }
        setErrors(errors)
        return Object.keys(errors).length === 0
    }

    const onChangeUsername = (e) => {
        const username = e.target.value
        setUsername(username)
        setEnableVerify(false)
    }

    const onChangePassword = (e) => {
        const password = e.target.value
        setPassword(password)
        setEnableVerify(false)
    }

    const handleLogin = async (e) => {
        e.preventDefault()

        setMessage('')
        setLoading(true)

        if (validateForm()) {
            try {
                await login(username, password)
                navigate('/profile')
                window.location.reload()
            } catch (error) {
                const resMessage = (error.response?.data?.message) || error.message || 'An error occurred during login.'
                if (resMessage === 'User is disabled') {
                    setEnableVerify(true)
                }
                setMessage(resMessage)
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
                <div className='text-center mb-4'>
                    <img
                        src={logo}
                        alt='profile-img'
                        className='rounded-circle mb-2 security-logo'
                    />
                    <h3 className='fw-bold mb-0' style={{ color: 'var(--main-red)' }}>Sign In</h3>
                </div>
                <form onSubmit={handleLogin} ref={form} autoComplete='off'>
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
                    <div className='d-grid mb-3'>
                        <button className='btn btn-primary btn-lg' disabled={loading}>
                            {loading && (
                                <span className='spinner-border spinner-border-sm me-2'></span>
                            )}
                            Login
                        </button>
                    </div>
                    {message && (
                        <div className='alert alert-danger text-center' role='alert'>
                            {message}
                        </div>
                    )}
                </form>
                {enableVerify && (
                    <div className='d-grid mb-3'>
                        <button className='btn btn-primary' onClick={redirectToVerify}>
                            Go to verification
                        </button>
                    </div>
                )}
                <div className='text-center mt-3'>
                    <Link to='/forgot-password' className='small text-decoration-none'>
                        Forgot your password?
                    </Link>
                </div>
                <div className='text-center mt-2'>
                    <span className='text-muted small'>Don't have an account? </span>
                    <Link to='/signup' className='small text-decoration-none'>
                        Register
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default LoginPage