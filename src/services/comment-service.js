import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080/posts"

export async function getCommentsByPost(postId, page, size) {
    return await axios.get(`${API_URL}/${postId}/comments?page=${page}&size=${size}`, { headers: authHeader() })
}

export async function createComment(postId, comment, files) {

    const formData = new FormData()
    formData.append('content', comment)
    files.forEach((file) => formData.append('files', file))


    return await axios.post(`${API_URL}/${postId}/comments/create`, formData, { headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' }})
}

export async function editComment(postId, commentId, updatedContent, addedFiles, deletedFiles) {

    const formData = new FormData()
    formData.append('content', updatedContent)
    addedFiles.forEach((file) => formData.append('files', file))
    deletedFiles.forEach((fileUrl) => formData.append('filesToDelete', fileUrl))

    return await axios.put(`${API_URL}/${postId}/comments/${commentId}`, formData, { headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' }});
}

export async function deleteComment(postId, commentId) {
    return await axios.delete(`${API_URL}/${postId}/comments/${commentId}`, { headers: authHeader() });
}