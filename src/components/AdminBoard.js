import React, { useEffect, useState } from 'react'
import { testAdmin } from '../services/user-service'
import eventBus from '../services/eventBus'
function AdminBoard() {
    const [content, setContent] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await testAdmin()
                setContent(response.data)
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    eventBus.dispatch('logout')
                }
                if (error.response && error.response.status === 403) {
                    window.location.href = '/login'
                } else {
                    console.error('Failed to fetch user:', error)
                }
            }
        }
        fetchData()
    }, [])



    return (
        <div className='container'>
            <div className='bg-light p-5 rounded'>
                <h3>{content}</h3>
            </div>
        </div>
    )
}

export default AdminBoard