import React, { useEffect, useState } from 'react'
import { getPublicHello } from '../services/user-service'

function Home() {
    const [content, setContent] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getPublicHello()
                setContent(response.data)
            } catch (error) {
                const _content =
                    (error.response && error.response.data) ||
                    error.message ||
                    error.toString();

                setContent(_content);
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

export default Home