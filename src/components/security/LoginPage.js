import React, { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import { login } from '../../services/auth-service'
import logo from '../../resource/logo.jpg'

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

        // form.current.validateAll()

        if (validateForm()) {
            try {
                await login(username, password)
                navigate('/profile')
                window.location.reload()
            } catch (error) {
                const resMessage = (error.response?.data?.message) || error.message || 'An error occurred during login.'
                if (resMessage === 'User is disabled'){
                    setEnableVerify(true)
                }
                setMessage(resMessage)
                setLoading(false)
            }
        } else {
            setLoading(false)
        }
        // console.log(username)

    }
    const redirectToVerify = () => {
        navigate('/verify', { state: { username } })
    }

    return (
        <div className='container d-flex justify-content-center align-items-center'>
            <div className='card card-container'>
                <div className='text-center mb-3'>
                    <img
                        src={logo}
                        alt='profile-img'
                        className='profile-img-card'
                    />
                </div>
                <form onSubmit={handleLogin} ref={form}>
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
                    <div className='d-grid mb-3'>
                        <button className='btn btn-primary' disabled={loading}>
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
                {enableVerify && <div className='d-grid mb-3'>
                    <button className='btn btn-primary' onClick={redirectToVerify}>
                        Go to verification
                    </button>
                </div>}
                <div className='text-center mt-3'>
                    <Link to='/forgot-password'>Forgot your password?</Link>
                </div>
            </div>
        </div>
    )
}

export default LoginPage