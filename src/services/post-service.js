import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080/rooms"

export async function getPostsByRoom (roomId, page, size) {
    return await axios.get(`${API_URL}/${roomId}/posts?page=${page}&size=${size}`, { headers: authHeader() })
}

export async function createPost(roomId, post) {
    return await axios.post(`${API_URL}/${roomId}/posts/create`, { content: post }, { headers: authHeader() })
}

export async function deletePost(roomId, postId) {
    return await axios.delete(`${API_URL}/${roomId}/posts/${postId}`, { headers: authHeader() });
}

export async function editPost(roomId, postId, updatedContent) {
    return await axios.put(`${API_URL}/${roomId}/posts/${postId}`, { content: updatedContent }, { headers: authHeader() });
}