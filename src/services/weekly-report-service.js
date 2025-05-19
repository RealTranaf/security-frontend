import axios from 'axios'
import authHeader from './auth-header'

const API_URL = "http://localhost:8080/rooms"

export function getWeeklyReportPosts(roomId) {
    return axios.get(`${API_URL}/${roomId}/weekly-reports`, { headers: authHeader() })
}

export function createWeeklyReportPost(roomId, title, content, deadline, files) {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    formData.append('deadline', deadline)
    files.forEach(file => formData.append('files', file))
    return axios.post(`${API_URL}/${roomId}/weekly-reports/create`, formData, {headers: authHeader() })
}

export function submitWeeklyReport(roomId, reportPostId, content, files){
    const formData = new FormData()
    formData.append("content", content)
    files.forEach(file => formData.append('files', file))
    return axios.post(`${API_URL}/${roomId}/weekly-reports/${reportPostId}/create`, formData, {headers: authHeader() })
}

export function getWeeklyReportSubmissions(roomId, reportPostId) {
    return axios.get(`${API_URL}/${roomId}/weekly-reports/${reportPostId}/submissions`, { headers: authHeader() })
}

export function gradeWeeklyReportSubmission(roomId, submissionId, grade, note) {
    const formData = new FormData()
    formData.append("grade", grade)
    formData.append("note", note)
    return axios.post(`${API_URL}/${roomId}/weekly-reports/submissions/${submissionId}/grade`, formData, { headers: authHeader() })
}