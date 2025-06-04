import axios from 'axios'
import authHeader from './auth-header'

const API_URL = 'http://localhost:8080/rooms'

export function createPoll(roomId, title, description, options, deadline, files) {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    options.forEach(option => formData.append('options', option))
    formData.append('deadline', deadline)
    files.forEach((file) => formData.append('files', file))
    return axios.post(`${API_URL}/${roomId}/polls/create`, formData, { headers: authHeader() })
}

export function getPolls(roomId) {
    return axios.get(`${API_URL}/${roomId}/polls`, { headers: authHeader() })
}

export function votePoll(roomId, pollId, optionIndex) {
    const formData = new FormData()
    formData.append('optionIndex', optionIndex)
    return axios.post(`${API_URL}/${roomId}/polls/${pollId}/vote`, formData, { headers: authHeader() })
}

export function getPollVotes(roomId, pollId) {
    return axios.get(`${API_URL}/${roomId}/polls/${pollId}/votes`, { headers: authHeader() })
}
export function editPoll(roomId, pollId, title, description, options, deadline, files, filesToDelete) {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('deadline', deadline)
    options.forEach(option => formData.append('options', option))
    files.forEach(file => formData.append('files', file))
    filesToDelete.forEach(fileUrl => formData.append('filesToDelete', fileUrl))
    return axios.put(`${API_URL}/${roomId}/polls/${pollId}`, formData, { headers: authHeader() })
}

export function deletePoll(roomId, pollId) {
    return axios.delete(`${API_URL}/${roomId}/polls/${pollId}`, { headers: authHeader() })
}