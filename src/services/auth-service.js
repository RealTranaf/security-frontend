import axios from "axios";

const API_URL = "http://localhost:8080/auth"

export async function signup (username, email, password, role){
    return await axios.post(API_URL + "/signup", {
        username,
        email,
        password,
        role
    });
};

export async function login (username, password){
    const response = await axios
        .post(API_URL + "/login", {
            username,
            password,
        });
    if (response.data.accessToken) {
        localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
}

export async function logout(){
    localStorage.removeItem("user");
};

export async function getCurrentUser(){
    return JSON.parse(localStorage.getItem("user"));
};

export async function verify(username, verificationCode) {
    return await axios.post(API_URL + "/verify", {
        username,
        verificationCode
    });
}