import React, { useState, useRef } from 'react'
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";

import { signup } from '../services/auth-service';
import { isEmail } from 'validator';

function SignupPage() {

    const required = (value) => {
        if (!value) {
            return (
                <div className='alert alert-danger' role='alert'>
                    This field is required!
                </div>
            )
        }
    }

    const validEmail = (value) => {
        if (!isEmail(value)) {
            return (
                <div className='alert alert-danger' role='alert'>
                    This is not a valid email!
                </div>
            )
        }
    }

    const validUsername = (value) => {
        if (value.length < 3 || value.length > 20) {
            return (
                <div className='alert alert-danger' role='alert'>
                    This is not a valid email!
                </div>
            )
        }
    }

    const validPassword = (value) => {
        if (value.length < 6 || value.length > 40) {
            return (
                <div className='alert alert-danger' role='alert'>
                    The password must be between 6 and 40 characters!
                </div>
            )
        }
    }

    const form = useRef()
    const checkBtn = useRef()

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState("")
    const [successful, setSuccessful] = useState(false)
    const [message, setMessage] = useState("")

    const onChangeUsername = (e) => {
        const username = e.target.value
        setUsername(username)
    }

    const onChangeEmail = (e) => {
        const email = e.target.value
        setUsername(email)
    }

    const onChangePassword = (e) => {
        const password = e.target.value
        setPassword(password)
    }

    const onChangeRole = (e) => {
        const role = e.target.value
        setPassword(role)
    }

    const handleSignup = async (e) => {
        e.preventDefault()

        setMessage("")
        setSuccessful(false)

        form.current.validateAll();

        if (checkBtn.current.context._errors.length === 0) {
            try {
                await signup(username, email, password, role)
                setMessage(response.data.message)
                setSuccessful(true)
            } catch (error) {
                const resMessage = (error.response?.data?.message) || error.message || "An error occurred during login."
                setMessage(resMessage)
                setSuccessful(false)
            }
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
                <Form onSubmit={handleSignup} ref={form}>
                    {!successful && (
                        <div className='container'>
                            <div className='mb-3'>
                                <label htmlFor='username'>Username</label>
                                <input
                                    type='text'
                                    className='form-control'
                                    name='username'
                                    value={username}
                                    onChange={onChangeUsername}
                                    validations={[required, validUsername]}
                                >
                                </input>
                            </div>
                            <div className='mb-3'>
                                <label htmlFor='email'>Email</label>
                                <input
                                    type='text'
                                    className='form-control'
                                    name='username'
                                    value={email}
                                    onChange={onChangeEmail}
                                    validations={[required, validEmail]}
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
                                    validations={[required, validPassword]}
                                >
                                </input>
                            </div>
                            <div className='mb-3'>
                                <label htmlFor='role'>Role</label>
                                <div className='dropdown'>
                                    <button
                                        className="btn btn-primary dropdown-toggle"
                                        type="button"
                                        id="dropdownMenuButton"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        {role}
                                    </button>
                                    <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                        <li>
                                            <button className="dropdown-item" data-value="User" onClick={onChangeRole}>
                                                User
                                            </button>
                                        </li>
                                        <li>
                                            <button className="dropdown-item" data-value="Admin" onClick={onChangeRole}>
                                                Admin
                                            </button>
                                        </li>
                                        <li>
                                            <button className="dropdown-item" data-value="Manager" onClick={onChangeRole}>
                                                Manager
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="mb-3">
                                <button className="btn btn-primary">Sign Up</button>
                            </div>
                        </div>
                    )}
                    {message && (
                        <div className={successful ?"alert alert-success text-center" : "alert alert-danger text-center"} role="alert">
                            {message}
                        </div>
                    )}
                    <CheckButton style={{ display: "none" }} ref={checkBtn} />
                </Form>
            </div>
        </div>
    )
}

export default SignupPage