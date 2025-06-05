import React, { useState } from 'react'
import { editRoom } from '../../services/room-service'

const CLASS_TYPE_OPTIONS = [
    { value: 'CLASS_1', label: 'Đồ án 1' },
    { value: 'CLASS_2', label: 'Đồ án 2' },
    { value: 'CLASS_3', label: 'Đồ án 3' },
    { value: 'CLASS_F', label: 'Đồ án tốt nghiệp' }
]

function RoomSidebar({ room, selectedPage, setSelectedPage, onRoomUpdate }) {
    const [showModal, setShowModal] = useState(false)
    const [editName, setEditName] = useState(room.name)
    const [editType, setEditType] = useState(room.type)

    const handleEdit = () => {
        setEditName(room.name)
        setEditType(room.type)
        setShowModal(true)
    }

    const handleSave = async () => {
        if (!editName.trim() || !editType) {
            return
        }
        try {
            await editRoom(room.id, editName, editType)
            setShowModal(false)
            if (onRoomUpdate) onRoomUpdate({ ...room, name: editName, type: editType })
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className='p-3 border-end' style={{ width: '300px', minHeight: '100vh', background: 'rgb(42, 42, 42)' }}>
            <div className='d-flex align-items-center justify-content-between'>
                <h1 style={{ color: 'rgb(236, 236, 236)' }}>
                    {room.name}
                </h1>
                <button
                    className='btn btn-sm btn-outline-light ms-2'
                    title='Edit room'
                    onClick={handleEdit}
                    style={{ padding: '2px 8px', fontSize: 18 }}
                >
                    <i className='bi bi-pencil'></i>
                </button>
            </div>
            <div style={{ color: '#bbb', fontSize: 15, marginTop: 4 }}>
                {CLASS_TYPE_OPTIONS.find(opt => opt.value === room.type)?.label || room.type}
            </div>
            <div className='mt-4 d-grid gap-2'>
                <span
                    className={`sidebar-link ${selectedPage === 'posts' ? ' active' : ''}`}
                    onClick={() => setSelectedPage('posts')}
                >
                    <i className='bi bi-newspaper'></i>
                    Posts
                </span>
                <span
                    className={`sidebar-link${selectedPage === 'users' ? ' active' : ''}`}
                    onClick={() => setSelectedPage('users')}
                >
                    <i className='bi bi-people'></i>
                    Manage Users
                </span>
                <span
                    className={`sidebar-link${selectedPage === 'choose-topics' ? ' active' : ''}`}
                    onClick={() => setSelectedPage('choose-topics')}
                >
                    <i className='bi bi-list-check'></i>
                    Choose Topics
                </span>
                <span
                    className={`sidebar-link${selectedPage === 'weekly-report' ? ' active' : ''}`}
                    onClick={() => setSelectedPage('weekly-report')}
                >
                    <i className='bi bi-calendar-week'></i>
                    Weekly Report
                </span>
                <span
                    className={`sidebar-link${selectedPage === 'weekly-report' ? ' active' : ''}`}
                    onClick={() => setSelectedPage('voting')}
                >
                    <i className='bi bi-check-lg'></i>
                    Voting
                </span>
            </div>
            {showModal && (
                <div className='modal show d-block' tabIndex='-1' style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <div className='modal-dialog'>
                        <div className='modal-content'>
                            <div className='modal-header'>
                                <h5 className='modal-title'>Edit Room</h5>
                                <button type='button' className='btn-close' onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className='modal-body'>
                                <div className='mb-2'>
                                    <label className='form-label'>Room Name</label>
                                    <input
                                        className='form-control'
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                    />
                                </div>
                                <div className='mb-2'>
                                    <label className='form-label'>Class Type</label>
                                    <select
                                        className='form-select'
                                        value={editType}
                                        onChange={e => setEditType(e.target.value)}
                                    >
                                        {CLASS_TYPE_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className='modal-footer'>
                                <button className='btn btn-success' onClick={handleSave}>
                                    Save
                                </button>
                                <button className='btn btn-secondary' onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RoomSidebar