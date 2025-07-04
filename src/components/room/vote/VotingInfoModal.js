import React from 'react'
import { downloadFile } from '../../../services/download-service'
import { handleExportExcelPoll } from '../../../services/poll-service'

function VotingInfoModal({ show, onClose, room, poll, votes, isRoomCreator }) {
    if (!show) return null

    return (
        <div className='modal show d-block' tabIndex='-1' style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className='modal-dialog modal-lg modal-dialog-scrollable'>
                <div className='modal-content'>
                    <div className='modal-header'>
                        <h5 className='modal-title'>
                            <i className='bi bi-bar-chart-line me-2'></i>
                            {poll.title}
                        </h5>
                        <button type='button' className='btn-close' onClick={onClose}></button>
                    </div>
                    <div className='modal-body' style={{ maxHeight: '40rem', overflowY: 'auto' }}>
                        <p>{poll.description}</p>
                        <p><strong>Deadline:</strong> {new Date(poll.deadline).toLocaleString()}</p>
                        <p><strong>Created on:</strong> {new Date(poll.createdAt).toLocaleString()}</p>
                        <p><strong>Total Votes:</strong> {votes ? votes.length : 0}</p>
                        {isRoomCreator && (
                            <button className='btn btn-primary mb-3' onClick={() => handleExportExcelPoll(room.id, poll.id, poll.title)}>
                                <i class='bi bi-filetype-xls me-2'></i>
                                Export to Excel
                            </button>
                        )}
                        {poll.fileUrls && poll.fileUrls.length > 0 && (
                            <div>
                                <strong>Attachments:</strong>
                                <div>
                                    {poll.fileUrls.map((fileUrl, index) => {
                                        const fileName = fileUrl.split('/').pop()
                                        const originalName = fileName.substring(fileName.indexOf('_') + 1)
                                        return (
                                            <div key={index}>
                                                <span
                                                    className='btn btn-link p-0'
                                                    style={{ textDecoration: 'underline' }}
                                                    onClick={() => downloadFile(fileUrl, fileName)}
                                                >
                                                    <i className='bi bi-paperclip me-1'></i>
                                                    {originalName}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                        <div className='table-responsive mt-2'>
                            <table className='table table-bordered'>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Vote</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {votes && votes.length > 0 ? (
                                        votes.map((vote, index) => (
                                            <tr key={index}>
                                                <td>{vote.username}</td>
                                                <td>{poll.options[vote.optionIndex]}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2} className='text-center text-muted'>No votes yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className='modal-footer'>
                        <button className='btn btn-secondary' onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VotingInfoModal