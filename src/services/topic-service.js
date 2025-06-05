import axios from 'axios'
import authHeader from './auth-header'

const API_URL = 'http://localhost:8080/rooms'

export async function getAllTopics(roomId) {
    return await axios.get(`${API_URL}/${roomId}/topics`, { headers: authHeader() })
}

export async function getNonCustomTopics(roomId) {
    return await axios.get(`${API_URL}/${roomId}/topics/non-custom`, { headers: authHeader() })
}

export async function selectExistingTopic(roomId, topicId) {
    const formData = new FormData()
    formData.append('topicId', topicId)
    return await axios.post(`${API_URL}/${roomId}/topics/select`, formData, { headers: authHeader() })
}

export async function submitCustomTopic(roomId, title, description, files) {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    files.forEach((file) => formData.append('files', file))
    return await axios.post(`${API_URL}/${roomId}/topics/custom`, formData, { headers: authHeader() })
}

export async function submitTeacherTopic(roomId, title, description, files) {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    files.forEach((file) => formData.append('files', file))
    return await axios.post(`${API_URL}/${roomId}/topics/teacher`, formData, { headers: authHeader() })
}

export async function getStudentSelectedTopic(roomId) {
    return await axios.get(`${API_URL}/${roomId}/topics/selected`, { headers: authHeader() })
}

export async function getAllStudentSelections(roomId) {
    return await axios.get(`${API_URL}/${roomId}/topics/selections`, { headers: authHeader() })
}

export async function verifyStudentSelection(roomId, selectionId) {
    return await axios.patch(`${API_URL}/${roomId}/topics/selections/${selectionId}/verify`, {}, { headers: authHeader() })
}