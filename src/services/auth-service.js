import axios from "axios";

const API_URL = "http://localhost:8080/auth"

axios.defaults.withCredentials = true;

export async function signup (username, email, password, role){
    return await axios.post(API_URL + "/signup", {
        username,
        email,
        password,
        role
    });
};

export async function login (username, password){
    const response = await axios.post(API_URL + "/login", {
            username,
            password
        });
    if (response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
}

export function logout(){
    localStorage.removeItem("user");
};

export async function verify(username, verificationCode) {
    return await axios.post(API_URL + "/verify", {
        username,
        verificationCode
    });
}

export async function resendCode(username) {
    return await axios.post(API_URL + "/resend", {
        username
    })
}

export async function forgotPassword(email) {
    return await axios.post(API_URL + "/forgot-password", {
        email
    })
}

export async function resetPassword(token, newPassword) {
    return await axios.post(API_URL + "/reset-password", {
        token,
        newPassword
    })
}

export async function validateResetToken(token){
    return await axios.get(API_URL + "/reset-password", {
        params: {token}
    });
}