import React, { useState, useRef } from 'react'

function GradeForm({ initialGrade, initialNote, onSave }) {
    const [grade, setGrade] = useState(initialGrade || '')
    const [note, setNote] = useState(initialNote || '')
    const [files, setFiles] = useState([])

    const fileInputRef = useRef(null)

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(grade, note, files)
    }

    return (
        <form
            onSubmit={handleSubmit}
            className='d-flex flex-column align-items-start'
        >
            <input
                className='form-control mb-1'
                placeholder='Grade'
                value={grade}
                onChange={e => setGrade(e.target.value)}
            >
            </input>
            <div className='position-relative'>
                <input
                    className='form-control mb-1'
                    placeholder='Note'
                    value={note}
                    onChange={e => setNote(e.target.value)}
                >
                </input>
                <button
                    type='button'
                    className='attach-btn-inside-textarea'
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    tabIndex={-1}
                >
                    <i className='bi bi-paperclip fs-4' style={{ color: 'var(--main-red)' }}></i>
                </button>
                <input
                    type="file"
                    multiple
                    className="d-none"
                    ref={fileInputRef}
                    onChange={e => setFiles(Array.from(e.target.files))}
                >
                </input>
            </div>
            {files.length > 0 && (
                <div className="mt-1">
                    {files.map((file, idx) => (
                        <span key={idx} className="badge bg-secondary me-1">{file.name}</span>
                    ))}
                </div>
            )}
            <button
                className='btn btn-sm btn-success'
                type='submit'
            >
                <i className='bi bi-check-lg me-1'></i>
                Save
            </button>
        </form>
    )
}

export default GradeForm