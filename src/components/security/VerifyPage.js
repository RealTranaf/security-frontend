import React, { useState } from 'react'
import { resendCode, verify } from '../../services/auth-service'
import { useLocation } from 'react-router-dom'

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
            errors.verificationCode = "Please enter a 6 digit code!"
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
                const resMessage = (error.response?.data?.message) || error.message || "An error occurred during verification!"
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
            const resMessage = (error.response?.data?.message) || error.message || "An error occurred during resending!"
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
        <div className='container d-flex justify-content-center align-items-center'>
            <div className='card card-container'>
                <h3 className='text-center'>Verify Your Account</h3>
                <p className="mb-2">
                    Enter the 6-digit verification code sent to your e-mail address here!
                </p>
                <form onSubmit={handleVerification}>
                    <div className='mb-3'>
                        <label htmlFor='verificationCode'>Verification Code</label>
                        <input
                            type='text'
                            className='form-control'
                            name='verificationCode'
                            value={verificationCode}
                            onChange={onChangeVerificationCode}
                            maxLength={6}
                        >
                        </input>
                        {errors.verificationCode && (
                            <div className='alert alert-danger' role='alert'>
                                {errors.verificationCode}
                            </div>
                        )}
                    </div>
                    <div className="d-grid mb-3">
                        <button className="btn btn-primary">Verify</button>
                    </div>
                    {message && (
                        <div className='mb-3'>
                            <div className={successful ? "alert alert-success text-center" : "alert alert-danger text-center"} role="alert">
                                {message}
                            </div>
                        </div>
                    )}
                </form>
                <div className='d-grid mb-3'>
                    <button 
                        className="btn btn-primary" 
                        style={{ margin: '20px' }} 
                        onClick={handleResendCode}
                        disabled={loading}>
                        {loading && (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                        )}
                        Resend code
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VerifyPage