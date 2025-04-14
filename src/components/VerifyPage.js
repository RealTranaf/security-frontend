import React, { useState } from 'react'
import { verify, getCurrentUser} from '../services/auth-service'
import { useLocation } from 'react-router-dom'

function VerifyPage() {
    const [verificationCode, setVerificationCode] = useState()
    const [message, setMessage] = useState('')
    const [successful, setSuccessful] = useState(false)

    const location = useLocation()

    const currentUsername = location.state?.username

    const handleVerification = async (e) => {
        e.preventDefault()
        setMessage('')
        setSuccessful(false)

        if (verificationCode.length !== 6 || isNaN(verificationCode)){
            setMessage('Please enter a 6 digit code!')
            return
        }

        try {
            const response = await verify(currentUsername, verificationCode)
            setMessage(response.data.message)
            setSuccessful(true)
        } catch (error) {
            const resMessage = (error.response?.data?.message) || error.message || "An error occurred during verification!"
            setMessage(resMessage)
            setSuccessful(false)
        }
        
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
                            name = 'verificationCode'
                            value={verificationCode}
                            onChange={onChangeVerificationCode}
                            maxLength={6}
                        >
                        </input>
                    </div>
                    <div className="mb-3">
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
            </div>
        </div>
    )
}

export default VerifyPage