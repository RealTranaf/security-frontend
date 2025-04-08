import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080"

export async function getAllUser(){
    return axios.get(API_URL + "/users/all", { headers: authHeader() })
}

export async function getUser() {
    return axios.get(API_URL + "/users/me", { headers: authHeader() })
}

export async function basic() {
    return axios.get(API_URL + "/users/", { headers: authHeader() })
}

export async function testAdmin() {
    return axios.get(API_URL + "/admin", { headers: authHeader() })
}

export async function testManager() {
    return axios.get(API_URL + "/manager", { headers: authHeader() })
}


