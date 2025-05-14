import React from 'react'

function RoomSidebar({ room, selectedPage, setSelectedPage }) {
    return (
        <div className='p-3 border-end' style={{ width: '25rem' }}>
            <h1>{room.name}</h1>
            <div className="mt-4 d-grid gap-2">
                <button
                    className={`btn btn-outline-secondary${selectedPage === 'posts' ? ' active' : ''}`}
                    onClick={() => setSelectedPage('posts')}
                >
                    Posts
                </button>
                <button
                    className={`btn btn-outline-secondary${selectedPage === 'users' ? ' active' : ''}`}
                    onClick={() => setSelectedPage('users')}
                >
                    Manage Users
                </button>

            </div>
        </div>
    )
}

export default RoomSidebar