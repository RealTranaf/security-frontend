import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080/rooms"

export async function getPostsByRoom (roomId, page, size) {
    return await axios.get(`${API_URL}/${roomId}/posts?page=${page}&size=${size}`, { headers: authHeader() })
}

export async function createPost(roomId, content, files) {
    const formData = new FormData()
    formData.append('content', content)
    files.forEach((file) => formData.append('files', file))

    return await axios.post(`${API_URL}/${roomId}/posts/create`, formData, { headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' } })
}

export async function deletePost(roomId, postId) {
    return await axios.delete(`${API_URL}/${roomId}/posts/${postId}`, { headers: authHeader() });
}

export async function editPost(roomId, postId, content, addedFiles, deletedFiles) {

    const formData = new FormData()
    formData.append('content', content)
    addedFiles.forEach((file) => formData.append('files', file))
    deletedFiles.forEach((fileUrl) => formData.append('filesToDelete', fileUrl))

    return await axios.put(`${API_URL}/${roomId}/posts/${postId}`, formData, { headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' } });
}