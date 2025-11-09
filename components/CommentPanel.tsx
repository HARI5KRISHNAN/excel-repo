import React, { useState, useEffect } from 'react';
import commentService, { CommentData } from '../services/commentService';
import { useAuth } from '../contexts/AuthContext';

interface CommentPanelProps {
  sheetId: number;
  isOpen: boolean;
  onClose: () => void;
  selectedCell?: { row: number; col: number } | null;
  onAddComment?: () => void;
}

export const CommentPanel: React.FC<CommentPanelProps> = ({
  sheetId,
  isOpen,
  onClose,
  selectedCell,
  onAddComment,
}) => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, sheetId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const data = await commentService.getComments(sheetId);
      setComments(data);
    } catch (err: any) {
      setError('Failed to load comments');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedCell) return;

    try {
      const comment = await commentService.addComment(
        sheetId,
        selectedCell.row,
        selectedCell.col,
        newComment.trim()
      );
      setComments([comment, ...comments]);
      setNewComment('');
      if (onAddComment) onAddComment();
    } catch (err: any) {
      setError('Failed to add comment');
      console.error(err);
    }
  };

  const handleResolve = async (commentId: number) => {
    try {
      await commentService.resolveComment(sheetId, commentId);
      setComments(
        comments.map((c) => (c.id === commentId ? { ...c, resolved: true } : c))
      );
    } catch (err: any) {
      setError('Failed to resolve comment');
      console.error(err);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await commentService.deleteComment(sheetId, commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err: any) {
      setError('Failed to delete comment');
      console.error(err);
    }
  };

  const getCellLabel = (row: number, col: number) => {
    const colLabel = String.fromCharCode(65 + col);
    return `${colLabel}${row + 1}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Comments</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Add Comment Section */}
      {selectedCell && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Add comment to cell {getCellLabel(selectedCell.row, selectedCell.col)}
          </div>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            rows={3}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Add Comment
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
          {error}
        </div>
      )}

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No comments yet. Select a cell and add the first comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3 rounded-lg border ${
                comment.resolved
                  ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                    {getCellLabel(comment.row, comment.col)}
                  </span>
                  {comment.resolved && (
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                      Resolved
                    </span>
                  )}
                </div>
              </div>

              <div className="text-sm font-medium text-gray-800 dark:text-white mb-1">
                {comment.author}
              </div>

              <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                {comment.content}
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
              </div>

              <div className="flex items-center space-x-2">
                {!comment.resolved && (
                  <button
                    onClick={() => comment.id && handleResolve(comment.id)}
                    className="text-xs px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
                  >
                    Resolve
                  </button>
                )}
                {comment.author === user?.username && (
                  <button
                    onClick={() => comment.id && handleDelete(comment.id)}
                    className="text-xs px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
