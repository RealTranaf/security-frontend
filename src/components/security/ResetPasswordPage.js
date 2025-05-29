import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { resetPassword, validateResetToken } from '../../services/auth-service'
import backgroundImg from '../../resource/bkhn-c1.jpg'

function ResetPasswordPage() {
    const location = useLocation()
    const token = new URLSearchParams(location.search).get('token')
    const [newPassword, setNewPassword] = useState('')
    const [isValidToken, setIsValidToken] = useState(false)
    const [errors, setErrors] = useState({})
    const [successful, setSuccessful] = useState(false)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        const checkToken = async () => {
            try {
                await validateResetToken(token)
                setIsValidToken(true)
            } catch (error) {
                const resMessage = (error.response?.data?.message) || error.message || 'An error has occured'
                setMessage(resMessage)
                if (error.response && error.response.status === 403) {
                    window.location.href = '/login'
                } else {
                    console.error('Failed to fetch user:', error)
                }
            }
        }
        checkToken()
    }, [token])

    const validateForm = () => {
        const errors = {}
        if (!newPassword) {
            errors.newPassword = 'Password is required!'
        } else if (newPassword.length < 6 || newPassword.length > 40) {
            errors.newPassword = 'Password must be between 6 and 40 characters!'
        }
        setErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        setMessage('')
        setSuccessful(false)
        setLoading(true)

        if (validateForm()) {
            try {
                const response = await resetPassword(token, newPassword)
                setMessage(response.data.message)
                setSuccessful(true)
            } catch (error) {
                const resMessage = (error.response?.data?.message) || error.message || 'An error has occured'
                setMessage(resMessage)
                setSuccessful(false)
                setLoading(false)
            }
        }

        else {
            setLoading(false)
        }

    }

    const onChangeNewPassword = (e) => {
        setNewPassword(e.target.value)
    }

    if (!isValidToken) {
        return (
            <div
                className='container-fluid d-flex justify-content-center align-items-start min-vh-100 security-bg'
                style={{
                    backgroundImage: `url(${backgroundImg})`
                }}
            >
                <div className='card shadow-lg p-4 security-card'>
                    <div className='alert alert-danger text-center mb-0'>
                        {message || 'Validating token...'}
                    </div>
                </div>
            </div>
        )
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
                    Reset Your Password
                </h3>
                <form onSubmit={handleResetPassword}>
                    {!successful && (
                        <div>
                            <div className='mb-3'>
                                <label htmlFor='password' className='form-label fw-semibold'>New password</label>
                                <input
                                    type='password'
                                    className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                                    name='password'
                                    value={newPassword}
                                    onChange={onChangeNewPassword}
                                >
                                </input>
                                {errors.newPassword && (
                                    <div className='invalid-feedback'>
                                        {errors.newPassword}
                                    </div>
                                )}
                            </div>
                            <div className='d-grid mb-3'>
                                <button className='btn btn-primary btn-lg' disabled={loading}>
                                    {loading && (
                                        <span className='spinner-border spinner-border-sm me-2'></span>
                                    )}
                                    Change Password
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

export default ResetPasswordPage