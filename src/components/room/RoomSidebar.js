function RoomSidebar({ room, selectedPage, setSelectedPage }) {
    return (
        <div className='p-3 border-end' style={{ width: '300px', minHeight: '100vh', background: 'rgb(42, 42, 42)' }}>
            <h1 style={{color: 'rgb(236, 236, 236)'}}>{room.name}</h1>
            <div className='mt-4 d-grid gap-2'>
                <span
                    className={`sidebar-link ${selectedPage === 'posts' ? ' active' : ''}`}
                    onClick={() => setSelectedPage('posts')}
                >
                    <i className='bi bi-newspaper'></i>
                    Posts
                </span>
                <span
                    className={`sidebar-link${selectedPage === 'choose-topics' ? ' active' : ''}`}
                    onClick={() => setSelectedPage('choose-topics')}
                >
                    <i className='bi bi-list-check'></i>
                    Choose Topics
                </span>
                <span
                    className={`sidebar-link${selectedPage === 'users' ? ' active' : ''}`}
                    onClick={() => setSelectedPage('users')}
                >
                    <i className='bi bi-people'></i>
                    Manage Users
                </span>
                <span
                    className={`sidebar-link${selectedPage === 'weekly-report' ? ' active' : ''}`}
                    onClick={() => setSelectedPage('weekly-report')}
                >
                    <i className='bi bi-calendar-week'></i>
                    Weekly Report
                </span>
            </div>
        </div>
    )
}

export default RoomSidebar