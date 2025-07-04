import React, { useState, useRef } from 'react'

function GradeForm({ initialGrade, initialNote, onSave }) {
    const [showModal, setShowModal] = useState(false)
    const [grade, setGrade] = useState(initialGrade || '')
    const [note, setNote] = useState(initialNote || '')
    const [files, setFiles] = useState([])

    const fileInputRef = useRef(null)

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(grade, note, files)
        setShowModal(false)
    }

    return (
        <>
            <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={() => setShowModal(true)}
                title="Grade/Note"
            >
                <i className="bi bi-pencil-square me-1"></i>
                Grade
            </button>
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Grade Submission</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                    <input
                                        className="form-control mb-2"
                                        placeholder="Grade"
                                        value={grade}
                                        onChange={e => setGrade(e.target.value)}
                                    />
                                    <div className="position-relative mb-2">
                                        <input
                                            className="form-control"
                                            placeholder="Note"
                                            value={note}
                                            onChange={e => setNote(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="attach-btn-inside-textarea"
                                            onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                            tabIndex={-1}
                                            style={{ position: 'absolute', right: 10, top: 5, background: 'none', border: 'none' }}
                                        >
                                            <i className="bi bi-paperclip fs-5" style={{ color: 'var(--main-red)' }}></i>
                                        </button>
                                        <input
                                            type="file"
                                            multiple
                                            className="d-none"
                                            ref={fileInputRef}
                                            onChange={e => setFiles(Array.from(e.target.files))}
                                        />
                                    </div>
                                    {files.length > 0 && (
                                        <div className="mb-2">
                                            {files.map((file, idx) => (
                                                <span key={idx} className="badge bg-secondary me-1">{file.name}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button className="btn btn-secondary" type="button" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button className="btn btn-primary" type="submit">
                                        <i className="bi bi-check-lg me-1"></i>
                                        Save
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default GradeForm