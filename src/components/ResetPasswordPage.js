import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { resetPassword, validateResetToken } from '../services/auth-service'

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
                const resMessage = (error.response?.data?.message) || error.message || "An error has occured"
                setMessage(resMessage)
                if (error.response && error.response.status === 403) {
                    window.location.href = "/login"
                } else {
                    console.error("Failed to fetch user:", error)
                }
            }
        }
        checkToken()
    }, [token])

    const validateForm = () => {
        const errors = {}
        if (!newPassword) {
            errors.newPassword = "Password is required!"
        } else if (newPassword.length < 6 || newPassword.length > 40) {
            errors.newPassword = "Password must be between 6 and 40 characters!"
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
                const resMessage = (error.response?.data?.message) || error.message || "An error has occured"
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
        const password = e.target.value
        setNewPassword(password)
    }

    if (!isValidToken) {
        return (
            <div className="container d-flex justify-content-center align-items-center">
                <div className="alert alert-danger text-center">
                    {/* {message || 'Validating token...'} */}
                    NO
                </div>
            </div>
        )
    }

    return (
        <div className='container d-flex justify-content-center align-items-center'>
            <div className='card card-container'>
                <h3 className='text-center'>
                    Reset Your Password
                </h3>
                <form onSubmit={handleResetPassword}>
                    {!successful && (
                        <div className='container'>
                            <div className='mb-3'>
                                <label htmlFor='password'>New password</label>
                                <input
                                    type='password'
                                    className='form-control'
                                    name='password'
                                    value={newPassword}
                                    onChange={onChangeNewPassword}
                                >
                                </input>
                                {errors.newPassword && (
                                    <div className='alert alert-danger' role='alert'>
                                        {errors.newPassword}
                                    </div>
                                )}
                            </div>
                            <div className="d-grid mb-3">
                                <button className="btn btn-primary" disabled={loading}>
                                    {loading && (
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                    )}
                                    Change Password
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

export default ResetPasswordPage