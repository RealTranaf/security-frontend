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
    return await axios.patch(`${API_URL}/${roomId}/topics/selections/${selectionId}/verify`, { headers: authHeader() })
}

export async function deleteTopic(roomId, topicId) {
    return await axios.delete(`${API_URL}/${roomId}/topics/${topicId}`, { headers: authHeader() })
}

export async function editTopic(roomId, topicId, title, description, files, filesToDelete) {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    files.forEach(file => formData.append('files', file))
    filesToDelete.forEach(file => formData.append('filesToDelete', file))
    return await axios.put(`${API_URL}/${roomId}/topics/${topicId}`, formData, { headers: authHeader() })
}
export async function handleExportExcelTopic(roomId, roomName, roomType) {
    try {
        const url = `${API_URL}/${roomId}/topics/export-excel`
        const response = await axios.get(url, { responseType: 'blob', headers: authHeader() })
        const blob = new Blob([response.data], { type: response.headers['content-type'] })
        const safeName = roomName ? roomName.replace(/\s+/g, '_') : 'room'
        const safeType = roomType ? roomType.replace(/\s+/g, '_') : 'type'
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = `topics_${safeName}_${safeType}.xlsx`
        document.body.appendChild(link)
        link.click()
        link.remove()
    } catch (error) {
        alert('Failed to export file.')
        console.error(error)
    }
}
export function selectGroupTopic(roomId, topicId, usernames) {
    const formData = new FormData();
    formData.append('topicId', topicId)
    usernames.forEach(username => formData.append('usernames', username));
    return axios.post(`${API_URL}/${roomId}/topics/select-group`, formData, { headers: authHeader() });
}

export function submitCustomTopicGroup(roomId, title, description, files, usernames) {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    files.forEach(file => formData.append('files', file));
    usernames.forEach(username => formData.append('usernames', username));
    return axios.post(`${API_URL}/${roomId}/topics/custom-group`, formData, { headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' } });
}