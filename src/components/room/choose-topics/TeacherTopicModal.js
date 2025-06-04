import React from 'react'

function TeacherTopicModal({
    show,
    onClose,
    onSubmit,
    title,
    setTitle,
    description,
    setDescription,
    files,
    setFiles,
    fileInputRef,
    submitted
}) {
    if (!show) return null
    return (
        <div className='modal show d-block' tabIndex='-1' style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className='modal-dialog modal-lg'>
                <div className='modal-content'>
                    <div className='modal-header'>
                        <h5 className='modal-title'>
                            <i className='bi bi-plus-lg me-2'></i>
                            Add Topic (Teacher Only)
                        </h5>
                        <button type='button' className='btn-close' onClick={onClose}></button>
                    </div>
                    <div className='modal-body'>
                        <div className='mb-2'>
                            <label className='form-label fw-semibold'>Title</label>
                            <input
                                className='form-control mb-2'
                                placeholder='Add a title...'
                                value={title}
                                required
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>
                        <div className='position-relative'>
                            <div className='mb-2'>
                                <label className='form-label fw-semibold'>Description</label>
                                <textarea
                                    className='form-control'
                                    placeholder='Describe the topic...'
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    style={{ paddingRight: 40 }}
                                    required
                                />
                                <button
                                    type='button'
                                    className='attach-btn-inside-textarea'
                                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                    tabIndex={-1}
                                >
                                    <i className='bi bi-paperclip fs-4' style={{ color: '#198754' }}></i>
                                </button>
                                <input
                                    type='file'
                                    className='d-none'
                                    multiple
                                    ref={fileInputRef}
                                    onChange={e => setFiles(Array.from(e.target.files))}
                                />
                            </div>
                        </div>
                        {files.length > 0 && (
                            <div className='mt-2'>
                                {files.map((file, index) => (
                                    <span key={index} className='badge bg-secondary me-2'>{file.name}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className='modal-footer'>
                        <button className='btn btn-secondary' onClick={onClose}>
                            <i className='bi bi-x-lg me-1'></i>
                            Cancel
                        </button>
                        <button className='btn btn-primary' onClick={onSubmit}>
                            <i className='bi bi-send me-1'></i>
                            Add Topic
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TeacherTopicModal