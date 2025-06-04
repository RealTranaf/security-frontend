import React from 'react'

function StudentSelectionsModal({ show, onClose, studentSelections, room }) {
    if (!show) return null
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
                        <div className='table-responsive'>
                            <table className='table table-striped align-middle'>
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Topic</th>
                                        <th>Description</th>
                                        <th>Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {room.userList
                                        .filter(u => u.role === 'STUDENT')
                                        .map(student => {
                                            const selection = studentSelections.find(sel => sel.student === student.username)
                                            return (
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
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td colSpan={3} className='text-muted'>Not Selected</td>
                                                        </>
                                                    )}
                                                </tr>
                                            )
                                        })}
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