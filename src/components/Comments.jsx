import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Comments.css';

const Comments = ({ complaintId, isInternal = false }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    fetchComments();
  }, [complaintId]);

  const fetchComments = async (pageNum = 1, append = false) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/comments/complaint/${complaintId}?page=${pageNum}&limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        if (append) {
          setComments(prev => [...prev, ...data.comments]);
        } else {
          setComments(data.comments);
        }
        setHasMore(data.comments.length === 20);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/comments/complaint/${complaintId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newComment,
            parentCommentId: replyingTo,
            isInternal,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
        setReplyingTo(null);
        toast.success('Comment added');
      } else {
        toast.error(data.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error adding comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        setComments(prev => prev.filter(c => c._id !== commentId));
        toast.success('Comment deleted');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Error deleting comment');
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const getAvatarColor = (role) => {
    const colors = {
      student: '#3b82f6',
      admin: '#10b981',
      warden: '#f59e0b',
      superadmin: '#ef4444',
    };
    return colors[role] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="comments-loading">
        <div className="loading-spinner-small"></div>
        <span>Loading comments...</span>
      </div>
    );
  }

  return (
    <div className="comments-section">
      {isInternal && (
        <div className="internal-notice">
          <span className="internal-badge">Internal Notes</span>
          <span className="internal-text">Only visible to staff members</span>
        </div>
      )}

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="comment-form">
        {replyingTo && (
          <div className="replying-to">
            <span>Replying to comment</span>
            <button type="button" onClick={() => setReplyingTo(null)} className="cancel-reply">
              Cancel
            </button>
          </div>
        )}
        <div className="comment-input-wrapper">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isInternal ? "Add an internal note..." : "Add a comment..."}
            rows={3}
            className="comment-input"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="comment-submit-btn"
          >
            Post
          </button>
        </div>
        <div className="comment-hint">
          Use @username to mention someone
        </div>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment._id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`comment-item ${comment.isInternal ? 'internal' : ''}`}
            >
              <div className="comment-avatar">
                {comment.authorId?.avatar ? (
                  <img src={comment.authorId.avatar} alt={comment.authorName} />
                ) : (
                  <div
                    className="avatar-placeholder"
                    style={{ backgroundColor: getAvatarColor(comment.authorRole) }}
                  >
                    {getInitials(comment.authorName)}
                  </div>
                )}
              </div>

              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">{comment.authorName}</span>
                  <span
                    className="comment-role"
                    style={{ color: getAvatarColor(comment.authorRole) }}
                  >
                    {comment.authorRole}
                  </span>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  {comment.isInternal && <span className="internal-tag">Internal</span>}
                </div>

                <p className="comment-text">{comment.content}</p>

                <div className="comment-actions">
                  <button
                    type="button"
                    onClick={() => setReplyingTo(comment._id)}
                    className="comment-action-btn"
                  >
                    Reply
                  </button>
                  {(comment.authorId?._id === user?._id || user?.role === 'admin') && (
                    <button
                      type="button"
                      onClick={() => handleDelete(comment._id)}
                      className="comment-action-btn delete"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <div className="no-comments">
            <div className="no-comments-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <p>No comments yet</p>
            <span className="no-comments-hint">Be the first to comment</span>
          </div>
        )}

        {hasMore && comments.length > 0 && (
          <button onClick={loadMore} className="load-more-btn">
            Load more comments
          </button>
        )}
      </div>

      <div ref={commentsEndRef} />
    </div>
  );
};

export default Comments;
