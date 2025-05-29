import React, { useState } from 'react'
import { forgotPassword } from '../../services/auth-service'
import backgroundImg from '../../resource/bkhn-c1.jpg'

function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [errors, setErrors] = useState({})
    const [successful, setSuccessful] = useState(false)
    const [loading, setLoading] = useState(false)

    const validateForm = () => {
        const errors = {}
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!email) {
            errors.email = 'Email is required!'
        } else if (!emailRegex.test(email)) {
            errors.email = 'This is not a valid email!'
        }
        setErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        setMessage('')
        setSuccessful(false)
        setLoading(true)

        if (validateForm()) {
            try {
                const response = await forgotPassword(email)
                setMessage(response.data.message)
                setSuccessful(true)
            } catch (error) {
                const resMessage = (error.response?.data?.message) || error.message || 'An error has occured'
                setMessage(resMessage)
                setSuccessful(false)
                setLoading(false)
            }
        } else {
            setLoading(false)
        }
    }

    const onChangeEmail = (e) => {
        setEmail(e.target.value)
    }

    return (
        <div className='container-fluid d-flex justify-content-center align-items-start min-vh-100 position-relative security-bg'>
            <div
                className='bg-overlay'
                style={{ backgroundImage: `url(${backgroundImg})` }}
            >
            </div>
            <div className='card shadow-lg p-4 security-card' style={{ zIndex: 1}}>
                <h3 className='fw-bold text-center mb-3' style={{ color: 'var(--main-red)' }}>
                    Forgot Password
                </h3>
                <form onSubmit={handleForgotPassword}>
                    {!successful && (
                        <div>
                            <div className='mb-3 text-muted small'>
                                Enter the email that you registered your account to here and we will send an e-mail containing a link to change your password!
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
                            <div className='d-grid mb-3'>
                                <button className='btn btn-primary btn-lg' disabled={loading}>
                                    {loading && (
                                        <span className='spinner-border spinner-border-sm me-2'></span>
                                    )}
                                    Send Reset Link
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
                </form>
            </div>
        </div>
    )
}

export default ForgotPasswordPage