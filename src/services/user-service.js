import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080"

axios.defaults.withCredentials = true;

export async function getPublicHello(){
    return axios.get(`${API_URL}/public`, { headers: authHeader() })
}

export async function getAllUser(){
    return axios.get(`${API_URL}/users/all`, { headers: authHeader() })
}

export async function getCurrentUser() {
    return axios.get(`${API_URL}/users/me`, { headers: authHeader() })  
}

export async function getUser(username) {
    return axios.get(`${API_URL}/users/${username}`, { headers: authHeader() })
}

export async function basic() {
    return axios.get(`${API_URL}/users/`, { headers: authHeader() })
}

export async function testAdmin() {
    return axios.get(`${API_URL}/admin`, { headers: authHeader() })
}

export async function testTeacher() {
    return axios.get(`${API_URL}/teacher`, { headers: authHeader() })
}

export async function searchUsers(query) {
    return axios.get(`${API_URL}/users/search?query=${query}`, { headers: authHeader() })
}

