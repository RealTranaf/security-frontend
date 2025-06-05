import axios from 'axios'
import authHeader from './auth-header'

const API_URL = 'http://localhost:8080/rooms'

export async function createRoom (roomName, type){
    return await axios.post(API_URL + '/create', { name: roomName, type: type }, { headers: authHeader() })
}

export async function getRoomList() {
    return await axios.get(API_URL, { headers: authHeader() })
}

export async function getRoomDetail(roomId) {
    return await axios.get(API_URL + `/${roomId}`, { headers: authHeader() })
}

export async function editRoom(roomId, roomName, type) {
    return await axios.put(API_URL + `/${roomId}`, { name: roomName, type: type }, { headers: authHeader() })
}

export async function addUserstoRoom(roomId, usernames){
    return await axios.post(API_URL + `/${roomId}/add-users`, { usernames }, { headers: authHeader() } )
}

export async function removeUsersFromRoom(roomId, usernames) {
    // return await axios.delete(API_URL + `/${roomId}/remove-users`, { data: {usernames} }, { headers: authHeader() })
    const queryParams = usernames.map((username) => `username=${encodeURIComponent(username)}`).join('&')
    return await axios.delete(`${API_URL}/${roomId}/remove-users?${queryParams}`, {
        headers: authHeader()
    })
}
