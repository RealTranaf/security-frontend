import React, { useEffect, useRef, useState } from 'react'
import { getAllTopics, selectExistingTopic, submitCustomTopic } from '../../../services/topic-service'

function ChooseTopics({ roomId, currentUser }) {
    const [topics, setTopics] = useState([])
    const [selectedTopicId, setSelectedTopicId] = useState(null)
    const [customTitle, setCustomTitle] = useState('')
    const [customDescription, setCustomDescription] = useState('')
    const [customFiles, setCustomFiles] = useState([])
    const [submitted, setSubmitted] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [selectedTopic, setSelectedTopic] = useState(null)
    const fileInputRef = useRef(null)

    const fetchTopics = async () => {
        try {
            const response = await getAllTopics(roomId)
            setTopics(response.data.topics)

        } catch (error) {
            console.error('Failed to load topics')
        }
    }

    useEffect(() => {
        fetchTopics()
    }, [roomId])

    const handleSelectTopic = (topicId) => {
        const topic = topics.find(t => t.id === topicId)
        setSelectedTopic(topic)
        setShowModal(true)
    }

    const handleChooseExisting = async () => {
        try {
            await selectExistingTopic(roomId, selectedTopic.id)
            setSubmitted(true)
            setShowModal(false)
        } catch (error) {
            console.error('Failed to choose topics')
        }
    }

    const handleSubmitCustom = async () => {
        if (!customTitle.trim() || !customDescription.trim()) {
            return
        }
        try {
            await submitCustomTopic(roomId, customTitle, customDescription, customFiles)
            setSubmitted(true)
            setCustomTitle('')
            setCustomDescription('')
            setCustomFiles([])
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        } catch (error) {
            console.error('Failed to submit topics')
        }
    }

    return (
        <div className='mt-3'>
            <h5>Choose an Existing Topic</h5>
            <div className='mb-3'>
                
            </div>
        </div>
    )
}

export default ChooseTopics