import axios from "axios";
import authHeader from "./auth-header";

const API_URL = "http://localhost:8080/rooms"

export async function createRoom (roomName){
    return await axios.post(API_URL + "/create", { name: roomName }, { headers: authHeader() })
}

export async function getRoomList() {
    return await axios.get(API_URL, { headers: authHeader() })
}

export async function getRoomDetail(roomId) {
    return await axios.get(API_URL + `/${roomId}`, { headers: authHeader() })
}

export async function addUserstoRoom(roomId, usernames){
    return await axios.post(API_URL + `/${roomId}` + "/add-users", { usernames }, { headers: authHeader()} )
}