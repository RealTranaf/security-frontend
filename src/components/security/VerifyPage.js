import React, { useState } from 'react'
import { resendCode, verify } from '../../services/auth-service'
import { useLocation, Link } from 'react-router-dom'
import backgroundImg from '../../resource/bkhn-c1.jpg'

function VerifyPage() {
    const [verificationCode, setVerificationCode] = useState('')
    const [message, setMessage] = useState('')
    const [successful, setSuccessful] = useState(false)
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)

    const location = useLocation()
    const currentUsername = location.state?.username

    const validateForm = () => {
        const errors = {}
        if (!verificationCode.trim() || verificationCode.length !== 6) {
            errors.verificationCode = 'Please enter a 6 digit code!'
        }
        setErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleVerification = async (e) => {
        e.preventDefault()
        setMessage('')
        setSuccessful(false)
        if (validateForm()) {
            try {
                const response = await verify(currentUsername, verificationCode)
                setMessage(response.data.message)
                setSuccessful(true)
            } catch (error) {
                const resMessage = (error.response?.data?.message) || error.message || 'An error occurred during verification!'
                setMessage(resMessage)
                setSuccessful(false)
            }
        } else {
        }


    }

    const handleResendCode = async (e) => {
        setMessage('')
        setLoading(true)
        try {
            const response = await resendCode(currentUsername)
            setMessage(response.data.message)
            setSuccessful(true)
        } catch (error) {
            const resMessage = (error.response?.data?.message) || error.message || 'An error occurred during resending!'
            setMessage(resMessage)
            setSuccessful(false)
            setLoading(false)
        }
        setLoading(false)
    }

    const onChangeVerificationCode = (e) => {
        setVerificationCode(e.target.value)
    }
    return (
        <div className='container-fluid d-flex justify-content-center align-items-start min-vh-100 position-relative security-bg'>
            <div
                className='bg-overlay'
                style={{ backgroundImage: `url(${backgroundImg})` }}
            >
            </div>
            <div className='card shadow-lg p-4 security-card' style={{ zIndex: 1}}>
                <h3 className='fw-bold mb-0' style={{ color: 'var(--main-red)' }}>Verify Your Account</h3>
                <p className='mb-2'>
                    Enter the 6-digit verification code sent to your e-mail address here!
                </p>
                <form onSubmit={handleVerification} autoComplete='off'>
                    <div className='mb-3'>
                        <label htmlFor='verificationCode' className='form-label fw-semibold'>Verification Code</label>
                        <input
                            type='text'
                            className={`form-control ${errors.verificationCode ? 'is-invalid' : ''}`}
                            name='verificationCode'
                            value={verificationCode}
                            onChange={onChangeVerificationCode}
                            maxLength={6}
                            autoFocus
                        >
                        </input>
                        {errors.verificationCode && (
                            <div className='invalid-feedback'>
                                {errors.verificationCode}
                            </div>
                        )}
                    </div>
                    <div className='d-grid mb-3'>
                        <button className='btn btn-primary btn-lg' disabled={loading}>
                            {loading && (
                                <span className='spinner-border spinner-border-sm me-2'></span>
                            )}
                            Verify
                        </button>
                    </div>
                    {message && (
                        <div className='mb-3'>
                            <div className={successful ? 'alert alert-success text-center' : 'alert alert-danger text-center'} role='alert'>
                                {message}
                            </div>
                        </div>
                    )}
                </form>
                <div className='d-grid mb-3'>
                    <button
                        className='btn btn-primary btn-lg'
                        onClick={handleResendCode}
                        disabled={loading}>
                        {loading && (
                            <span className='spinner-border spinner-border-sm me-2'></span>
                        )}
                        Resend code
                    </button>
                </div>
                <div className='text-center mt-3'>
                    <Link to='/login' className='small text-decoration-none'>
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default VerifyPage