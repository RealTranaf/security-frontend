import React, { useEffect, useState } from 'react'
import { testManager } from '../services/user-service'
import eventBus from '../services/eventBus'

function ManagerBoard() {
    const [content, setContent] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await testManager()
                setContent(response.data)
            } catch (error) {
                const _content =
                    (error.response && error.response.data) ||
                    error.message ||
                    error.toString()

                setContent(_content)
                if (error.response && error.response.status === 401) {
                    eventBus.dispatch("logout");
                }
            }
        }
        fetchData()
    }, [])

    return (
        <div className="container">
            <div className="bg-light p-5 rounded">
                <h3>{content}</h3>
            </div>
        </div>
    )
}

export default ManagerBoard