import axios from 'axios'
import authHeader from './auth-header'

const API_URL = 'http://localhost:8080'

export async function downloadFile(fileUrl, fileName) {
    try {
        const response = await axios.get(API_URL + fileUrl, { responseType: 'blob', headers: authHeader() })
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    } catch (error) {
        alert('Failed to download file.')
        console.error(error)
    }
}