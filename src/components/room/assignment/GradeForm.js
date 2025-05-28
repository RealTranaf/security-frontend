import React, { useState } from 'react'

function GradeForm({ initialGrade, initialNote, onSave }) {
    const [grade, setGrade] = useState(initialGrade || '')
    const [note, setNote] = useState(initialNote || '')


    return (
        <form 
            onSubmit={e => { 
                e.preventDefault()
                onSave(grade, note)
            }}
            className='d-flex flex-column align-items-start'
        >
            <input 
                className='form-control mb-1' 
                placeholder='Grade'
                value={grade}
                onChange={e => setGrade(e.target.value)}    
            >
            </input>
            <input
                className='form-control mb-1' 
                placeholder='Note'
                value={note}
                onChange={e => setNote(e.target.value)} 
            >

            </input>
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