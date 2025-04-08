import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

import { login } from '../services/auth-service';

function LoginPage() {

    const required = (value) => {
        if (!value) {
            return (
                <div className='alert alert-danger' role='alert'>
                    This field is required!
                </div>
            )
        }
    }
    
    let navigate = useNavigate()

    const form = useRef()
    const checkBtn = useRef()

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")

    const onChangeUsername = (e) => {
        const username = e.target.value
        setUsername(username)
    }

    const onChangePassword = (e) => {
        const password = e.target.value
        setPassword(password)
    }

    const handleLogin = async (e) => {
        e.preventDefault()

        setMessage("")
        setLoading(true)

        form.current.validateAll();

        if (checkBtn.current.context._errors.length === 0) {
            try {
                await login(username, password)
                navigate("/profile")
                window.location.reload()
            } catch (error) {
                const resMessage = (error.response?.data?.message) || error.message || "An error occurred during login."
                setMessage(resMessage)
                setLoading(false)
            }
        } else {
            setLoading(false)
        }

    }

    return (
        <div className='container d-flex justify-content-center align-items-center'>
            <div className='card p-4 shadow-sm' style={{ maxWidth: "400px", width: "100%" }}>
                <div className='text-center mb-3'>
                    <img
                        src='src/resource/logo.jpg'
                        alt="profile-img"
                        className="rounded-circle"
                        width="100"
                        height="100"
                    />
                </div>
                <Form onSubmit={handleLogin} ref={form}>
                    <div className='mb-3'>
                        <label htmlFor='username'>Username</label>
                        <input
                            type='text'
                            className='form-control'
                            name='username'
                            value={username}
                            onChange={onChangeUsername}
                            validations={[required]}
                        >
                        </input>
                    </div>
                    <div className='mb-3'>
                        <label htmlFor='password'>Username</label>
                        <input
                            type='password'
                            className='form-control'
                            name='password'
                            value={password}
                            onChange={onChangePassword}
                            validations={[required]}
                        >
                        </input>
                    </div>
                    <div className='d-grid mb-3'>
                        <button className="btn btn-primary" disabled={loading}>
                            {loading && (
                                <span className="spinner-border spinner-border-sm me-2"></span>
                            )}
                            Login
                        </button>
                    </div>
                    {message && (
                        <div className="alert alert-danger text-center" role="alert">
                            {message}
                        </div>
                    )}
                    <CheckButton style={{ display: "none" }} ref={checkBtn} />
                </Form>
            </div>
        </div>
    )
}

export default LoginPage