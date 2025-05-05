import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080/rooms"

export async function getPostsByRoom (roomId) {
    return await axios.get(`${API_URL}/${roomId}/posts`, { headers: authHeader() })
}

export async function createPost(roomId, post) {
    return await axios.post(`${API_URL}/${roomId}/posts/create`, { post }, { headers: authHeader() })
}