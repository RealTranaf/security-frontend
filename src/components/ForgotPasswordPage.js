import React, { useState } from 'react'
import { forgotPassword } from '../services/auth-service'

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
            errors.email = "Email is required!"
        } else if (!emailRegex.test(email)) {
            errors.email = "This is not a valid email!"
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
                const resMessage = (error.response?.data?.message) || error.message || "An error has occured"
                setMessage(resMessage)
                setSuccessful(false)
                setLoading(false)
            }
        } else {
            setLoading(false)
        }
    }

    const onChangeEmail = (e) => {
        const email = e.target.value
        setEmail(email)
    }

    return (
        <div className='container d-flex justify-content-center align-items-center'>
            <div className='card card-container'>
                <h3 className='text-center'>
                    Forgot Password
                </h3>
                <form onSubmit={handleForgotPassword}>
                    {!successful && (
                        <div className='container'>
                            <div className='mb-3'>
                                Enter the email that you registered your account to here and we will send an e-mail containing a link to change your password!
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
                            <div className="d-grid mb-3">
                                <button className="btn btn-primary" disabled={loading}>
                                    {loading && (
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                    )}
                                    Send Reset Link
                                </button>
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
                </form>
            </div>
        </div>
    )
}

export default ForgotPasswordPage