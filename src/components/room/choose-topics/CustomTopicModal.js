import React from 'react'

function CustomTopicModal({
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
                <div className='modal-content '>
                    <div className='modal-header'>
                        <h5 className='modal-title'>
                            <i className='bi bi-lightbulb me-2'></i>
                            Submit Custom Topic
                        </h5>
                        <button type='button' className='btn-close' onClick={onClose}></button>
                    </div>
                    <div className='modal-body'>
                        <div className='mb-2'>
                            <label className='form-label fw-semibold'>Title</label>
                            <input
                                type='text'
                                className='form-control mb-2'
                                placeholder='Add a title...'
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className='position-relative'>
                            <div className='mb-2'>
                                <label className='form-label fw-semibold'>Description</label>
                                <textarea
                                    className='form-control'
                                    placeholder='Describe your topic suggestion...'
                                    value={description}
                                    style={{ paddingRight: 40 }}
                                    onChange={e => setDescription(e.target.value)}
                                    required
                                />
                                <button
                                    type='button'
                                    className='attach-btn-inside-textarea'
                                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                    tabIndex={-1}
                                >
                                    <i className='bi bi-paperclip fs-4' style={{ color: 'var(--main-red)' }}></i>
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
                            <div className='mb-2'>
                                {files.map((file, index) => (
                                    <span key={index} className='badge bg-secondary me-2'>{file.name}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className='modal-footer'>
                        <button
                            className='btn btn-secondary'
                            onClick={onClose}
                        >
                            <i className='bi bi-x-lg me-1'></i>
                            Cancel
                        </button>
                        <button
                            className='btn btn-primary'
                            onClick={onSubmit}
                            disabled={submitted}
                        >
                            <i className='bi bi-send me-1'></i>
                            Submit Custom Topic
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CustomTopicModal