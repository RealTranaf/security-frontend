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
                className='btn btn-sm btn-primary'
                type='submit'
            >
                Save
            </button>
        </form>
    )
}

export default GradeForm