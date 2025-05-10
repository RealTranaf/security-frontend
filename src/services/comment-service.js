import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080/posts"

export async function getCommentsByPost(postId, page, size) {
    return await axios.get(`${API_URL}/${postId}/comments?page=${page}&size=${size}`, { headers: authHeader() })
}

export async function createComment(postId, comment) {
    return await axios.post(`${API_URL}/${postId}/comments/create`, { content: comment }, { headers: authHeader() })
}

export async function editComment(postId, commentId, updatedContent) {
    return await axios.put(`${API_URL}/${postId}/comments/${commentId}`, { content: updatedContent }, { headers: authHeader() });
}

export async function deleteComment(postId, commentId) {
    return await axios.delete(`${API_URL}/${postId}/comments/${commentId}`, { headers: authHeader() });
}