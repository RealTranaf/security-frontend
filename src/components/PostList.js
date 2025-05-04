import React from 'react'

function PostList({posts, newCommentContent, setNewCommentContent, handleAddComment}) {
  return (
    <div className='mt-4'>
        <h5>Posts</h5>
        {posts.length === 0 ? (
            <p>No posts yet. Be the first one to post!</p>
        ) : (
            posts.map((post) => (
                <div>
                </div>
            ))
        )}
    </div>
  )
}

export default PostList