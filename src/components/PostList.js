import React, { useState } from 'react'

function PostList({ posts, newCommentContent, setNewCommentContent, handleAddComment }) {

  const [comments, setComments] = useState({})
  const [loadingComments, setLoadingComments] = useState({})

  const fetchComments = async (postId) => {
    if (comments[postId]) {
      return
    }
    setLoadingComments((prev) => ({ ...prev, [postId]: true }))
    try {
      const response = await getCommentsByPost(postId)
      setComments((prev) => ({ ...prev, [postId]: response.data }))
    } catch (error) {
      console.error(`Failed to fetch comments for post ${postId}:`, error)
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }))
    }
  }

  return (
    <div className='mt-4'>
      <h5>Posts</h5>
      {posts.length === 0 ? (
        <p>No posts yet. Be the first one to post!</p>
      ) : (
        posts.map((post) => (
          <div key={post.div} className='card mb-3'>
            <div className='card-body'>
              <h6 className='card-title'>{post.author}</h6>
              <p className='card-text'>{post.content}</p>
              <p className='text-muted small'> Created: {new Date(post.createdTime).toLocaleString()}</p>
              <hr />
              <h6>Comments</h6>
              {loadingComments[post.id] ? (
                <p>Loading comments...</p>
              ) : (
                <>
                  {!comments[post.id] ? (
                    <button
                      className='btn btn-link p-0'
                      onClick={() => fetchComments(post.id)}
                    >
                      Load Comments
                    </button>
                  ) : (
                    <ul className='list-group mb-3'>
                      {comments[post.id].length === 0 ? (
                        <p>No comments yet.</p>
                      ) : (
                        comments[post.id].map((comment) => (
                          <li key={comment.id} className='list-group-item'>
                            <strong>{comment.author}:</strong> {comment.content}
                            <p className='text-muted small'>
                              Created: {new Date(comment.createdTime).toLocaleString()}
                            </p>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </>
              )}
              <div className='d-flex'>
                <input
                  type='text'
                  className='form-control me-2'
                  value={newCommentContent[post.id] || ''}
                  onChange={(e) => 
                    setNewCommentContent((prev) => ({
                      ...prev,
                      [post.id]: e.target.value
                    }))
                  }
                  placeholder='Write a comment...'
                >
                </input>
                <button
                  className='btn btn-primary'
                  onClick={() => handleAddComment(post.id)}
                >
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default PostList