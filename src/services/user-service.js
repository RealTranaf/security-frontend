import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080"

export async function getAllUser(){
    return axios.get(API_URL + "/users/all")
}

