import React from 'react'
import { verifyStudentSelection, handleExportExcelTopic } from '../../../services/topic-service'


function StudentSelectionsModal({ show, onClose, studentSelections, room, onVerify, isRoomCreator }) {
    if (!show) return null

    const handleVerify = async (selectionId) => {
        try {
            await verifyStudentSelection(room.id, selectionId)
            if (onVerify) {
                onVerify() //Refresh data
            }
        } catch (error) {
            console.error(error)
        }
    }

    const students = room.userList.filter(u => u.role === 'STUDENT')
    const studentRows = students.map(student => {
        const selection = studentSelections.find(sel => sel.student === student.username)
        let status = 2
        if (selection && selection.topic) {
            status = selection.verified ? 0 : 1
        }
        return { student, selection, status }
    })

    studentRows.sort((a, b) => {
        if (a.status !== b.status) return a.status - b.status
        return a.student.username.localeCompare(b.student.username)
    })

    return (
        <div className='modal show d-block' tabIndex='-1' style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className='modal-dialog modal-lg'>
                <div className='modal-content'>
                    <div className='modal-header'>
                        <h5 className='modal-title'>
                            <i className='bi bi-people me-2'></i>
                            Student Topic Selections
                        </h5>
                        <button type='button' className='btn-close' onClick={onClose}></button>
                    </div>
                    <div className='modal-body'>
                        {isRoomCreator && (
                            <button className='btn btn-outline-success mb-3' onClick={() => handleExportExcelTopic(room.id, room.name, room.type)}>
                                <i className='bi bi-file-earmark-excel me-1'></i>
                                Export to Excel
                            </button>
                        )}
                        <div className='table-responsive'>
                            <table className='table table-striped align-middle'>
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Topic</th>
                                        <th>Description</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {studentRows.map(({ student, selection }) => (
                                        <tr key={student.username}>
                                            <td>{student.username}</td>
                                            {selection && selection.topic ? (
                                                <>
                                                    <td>{selection.topic.title}</td>
                                                    <td>{selection.topic.description}</td>
                                                    <td>
                                                        <span className={`badge ${selection.custom ? 'bg-secondary' : 'bg-primary'}`}>
                                                            {selection.custom ? 'Custom' : 'Existing'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {selection.verified
                                                            ? <span className='badge bg-success'>Verified</span>
                                                            : <span className='badge bg-warning text-dark'>Pending</span>
                                                        }
                                                    </td>
                                                    <td>
                                                        {!selection.verified && (
                                                            <button
                                                                className='btn btn-sm btn-success'
                                                                onClick={() => handleVerify(selection.id)}
                                                            >
                                                                Verify
                                                            </button>
                                                        )}
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td colSpan={4} className='text-muted'>Not Selected</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className='modal-footer'>
                        <button className='btn btn-secondary' onClick={onClose}>
                            <i className='bi bi-x-lg me-1'></i>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}



export default StudentSelectionsModal