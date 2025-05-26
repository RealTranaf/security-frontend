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
    return axios.post(`${API_URL}/${roomId}/weekly-reports/create`, formData, { headers: authHeader() })
}

export function editWeeklyReportPost(roomId, reportPostId, title, content, deadline, files, filesToDelete) {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('content', content)
    formData.append('deadline', deadline)
    files.forEach(file => formData.append('files', file))
    filesToDelete.forEach(fileUrl => formData.append('filesToDelete', fileUrl))
    return axios.put(`${API_URL}/${roomId}/weekly-reports/${reportPostId}/edit`, formData, { headers: authHeader() })
}

export function deleteWeeklyReportPost(roomId, reportPostId) {
    return axios.delete(`${API_URL}/${roomId}/weekly-reports/${reportPostId}/delete`, { headers: authHeader() })
}

export function submitWeeklyReport(roomId, reportPostId, content, files) {
    const formData = new FormData()
    formData.append("content", content)
    files.forEach(file => formData.append('files', file))
    return axios.post(`${API_URL}/${roomId}/weekly-reports/${reportPostId}/create`, formData, { headers: authHeader() })
}

export function resubmitWeeklyReport(roomId, reportPostId, content, files) {
    const formData = new FormData()
    formData.append('content', content)
    files.forEach(file => formData.append('files', file))
    return axios.put(`${API_URL}/${roomId}/weekly-reports/${reportPostId}/create`, formData, { headers: authHeader() })
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

export async function handleExportExcel(roomId, reportPostId, deadline) {
    try {
        const url = `${API_URL}/${roomId}/weekly-reports/${reportPostId}/export-excel`
        const response = await axios.get(url, { responseType: 'blob', headers: authHeader() })
        const blob = new Blob([response.data], { type: response.headers['content-type'] })
        
        const safeDeadline = deadline ? deadline.toString().replace(/[: ]/g, '_') : 'no_deadline'
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = `${reportPostId}_${safeDeadline}.xlsx`
        link.click()
    } catch (error) {
        alert('Failed to export file.')
        console.error(error)
    }
}

export function getUserWeeklyReportSubmissions(roomId, username) {
    return axios.get(`${API_URL}/${roomId}/weekly-reports/student-submissions?username=${username}`, { headers: authHeader() })
}
