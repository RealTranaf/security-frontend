import React from 'react'

function PostList({ posts, newCommentContent, setNewCommentContent, handleAddComment }) {
    return (
        <div className="mt-4">
            <h5>Posts</h5>
            {posts.length === 0 ? (
                <p>No posts yet. Be the first to post!</p>
            ) : (
                posts.map((post) => (
                    <div key={post.id} className="card mb-3">
                        <div className="card-body">
                            <h6 className="card-title">{post.author.username}</h6>
                            <p className="card-text">{post.content}</p>
                            <p className="text-muted small">Created: {new Date(post.createdTime).toLocaleString()}</p>
                            <hr />
                            <h6>Comments</h6>
                            {post.comments.length === 0 ? (
                                <p>No comments yet.</p>
                            ) : (
                                <ul className="list-group mb-3">
                                    {post.comments.map((comment) => (
                                        <li key={comment.id} className="list-group-item">
                                            <strong>{comment.author.username}:</strong> {comment.content}
                                            <p className="text-muted small">
                                                Created: {new Date(comment.createdTime).toLocaleString()}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="d-flex">
                                <input
                                    type="text"
                                    className="form-control me-2"
                                    value={newCommentContent[post.id] || ''}
                                    onChange={(e) =>
                                        setNewCommentContent((prev) => ({
                                            ...prev,
                                            [post.id]: e.target.value
                                        }))
                                    }
                                    placeholder="Write a comment..."
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleAddComment(post.id)}
                                >
                                    Comment
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