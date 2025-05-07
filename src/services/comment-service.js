import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080/posts"

export async function getCommentsByPost(postId) {
    return await axios.get(`${API_URL}/${postId}/comments`, { headers: authHeader() })
}

export async function createComment(postId, comment) {
    return await axios.post(`${API_URL}/${postId}/comments/create`, { content: comment }, { headers: authHeader() })
}