import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export interface CommentItem {
  id: string
  course_id: string
  lesson_id?: string
  user_id: string
  user_name: string
  user_role: 'student' | 'teacher' | 'admin'
  content: string
  created_at: string
  likes: number
  liked_by?: string[]
  replies?: CommentItem[]
}

interface CourseCommentsSectionProps {
  courseId: string
  courseTitle?: string
  lessonId?: string
}

export function CourseCommentsSection({ courseId, courseTitle, lessonId }: CourseCommentsSectionProps) {
  const { profile } = useAuth()
  const storageKey = `eclat_comments_${courseId}`

  // Default seed comments so discussions look alive immediately
  const getInitialComments = (): CommentItem[] => {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      try {
        return JSON.parse(raw)
      } catch {}
    }

    return [
      {
        id: 'c-init-1',
        course_id: courseId,
        user_id: 'usr-student-1',
        user_name: 'David Ochieng',
        user_role: 'student',
        content:
          'The practical exercises in Module 1 were very clear! Was able to set up my environment and run the starter scripts without any issues. Looking forward to the next lesson!',
        created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        likes: 5,
        liked_by: [],
        replies: [
          {
            id: 'c-init-1-r1',
            course_id: courseId,
            user_id: 'usr-faculty-1',
            user_name: 'Lead Instructor',
            user_role: 'teacher',
            content:
              'Great work, David! Make sure to test your code with different test cases and submit your quiz once done.',
            created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            likes: 3,
            liked_by: [],
          },
        ],
      },
      {
        id: 'c-init-2',
        course_id: courseId,
        user_id: 'usr-student-2',
        user_name: 'Amina Al-Mansoor',
        user_role: 'student',
        content:
          'Question: For the final certificate, do we need to score 100% on all module quizzes, or is an 80% passing grade sufficient?',
        created_at: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
        likes: 2,
        liked_by: [],
        replies: [
          {
            id: 'c-init-2-r1',
            course_id: courseId,
            user_id: 'usr-admin-1',
            user_name: 'Academic Directorate',
            user_role: 'admin',
            content:
              'Hello Amina! An aggregate passing grade of 70% or higher across all module quizzes qualifies you for the official Eclat Institute Certificate of Completion.',
            created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
            likes: 4,
            liked_by: [],
          },
        ],
      },
    ]
  }

  const [comments, setComments] = useState<CommentItem[]>(getInitialComments)
  const [newCommentText, setNewCommentText] = useState('')
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(comments))
    } catch {}
  }, [comments, storageKey])

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCommentText.trim()) return

    const studentName = profile?.full_name || 'Enrolled Student'
    const newComment: CommentItem = {
      id: `comm-${Date.now()}`,
      course_id: courseId,
      lesson_id: lessonId,
      user_id: profile?.id || `usr-${Date.now()}`,
      user_name: studentName,
      user_role: (profile?.role === 'teacher' ? 'teacher' : profile?.role === 'admin' ? 'admin' : 'student'),
      content: newCommentText.trim(),
      created_at: new Date().toISOString(),
      likes: 0,
      liked_by: [],
      replies: [],
    }

    setComments((prev) => [newComment, ...prev])
    setNewCommentText('')
  }

  const handlePostReply = (parentCommentId: string) => {
    if (!replyText.trim()) return

    const studentName = profile?.full_name || 'Enrolled Student'
    const newReply: CommentItem = {
      id: `rep-${Date.now()}`,
      course_id: courseId,
      lesson_id: lessonId,
      user_id: profile?.id || `usr-${Date.now()}`,
      user_name: studentName,
      user_role: (profile?.role === 'teacher' ? 'teacher' : profile?.role === 'admin' ? 'admin' : 'student'),
      content: replyText.trim(),
      created_at: new Date().toISOString(),
      likes: 0,
      liked_by: [],
    }

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === parentCommentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReply],
          }
        }
        return c
      })
    )

    setReplyText('')
    setReplyingToId(null)
  }

  const handleLike = (commentId: string, isReply = false, parentId?: string) => {
    const currentUserId = profile?.id || 'guest-user'

    setComments((prev) =>
      prev.map((c) => {
        if (!isReply && c.id === commentId) {
          const alreadyLiked = c.liked_by?.includes(currentUserId)
          return {
            ...c,
            likes: alreadyLiked ? c.likes - 1 : c.likes + 1,
            liked_by: alreadyLiked
              ? c.liked_by?.filter((id) => id !== currentUserId)
              : [...(c.liked_by || []), currentUserId],
          }
        }

        if (isReply && c.id === parentId) {
          return {
            ...c,
            replies: c.replies?.map((r) => {
              if (r.id === commentId) {
                const alreadyLiked = r.liked_by?.includes(currentUserId)
                return {
                  ...r,
                  likes: alreadyLiked ? r.likes - 1 : r.likes + 1,
                  liked_by: alreadyLiked
                    ? r.liked_by?.filter((id) => id !== currentUserId)
                    : [...(r.liked_by || []), currentUserId],
                }
              }
              return r
            }),
          }
        }

        return c
      })
    )
  }

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    } catch {
      return 'Just now'
    }
  }

  return (
    <div
      className="card"
      style={{
        marginTop: '2rem',
        padding: 'clamp(1.25rem, 3vw, 1.75rem)',
        borderRadius: '16px',
        border: '1px solid var(--color-border)',
        background: '#ffffff',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💬</span>
            <span>Student Discussions &amp; Course Q&amp;A</span>
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>
            Ask questions, share code snippets, discuss lectures, and connect with faculty and fellow students.
          </p>
        </div>
        <span
          style={{
            fontSize: '0.78rem',
            background: '#eff6ff',
            color: '#1d4ed8',
            padding: '4px 12px',
            borderRadius: '999px',
            fontWeight: 800,
          }}
        >
          {comments.length} Discussion{comments.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* New Comment Input Box */}
      <form onSubmit={handlePostComment} style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#1e3a8a',
              color: '#ffffff',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              flexShrink: 0,
            }}
          >
            {(profile?.full_name || 'S').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <textarea
              className="input"
              rows={3}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Post a question or comment about this lesson/course..."
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9rem',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="btn btn-primary"
                style={{
                  fontWeight: 800,
                  fontSize: '0.84rem',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '8px',
                  opacity: newCommentText.trim() ? 1 : 0.6,
                }}
              >
                Post Comment →
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {comments.map((comm) => (
          <div
            key={comm.id}
            style={{
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
            }}
          >
            {/* Comment Author Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: comm.user_role === 'teacher' ? '#059669' : comm.user_role === 'admin' ? '#9333ea' : '#2563eb',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {comm.user_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                    {comm.user_name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {formatTimestamp(comm.created_at)}
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background:
                    comm.user_role === 'teacher'
                      ? '#d1fae5'
                      : comm.user_role === 'admin'
                      ? '#f3e8ff'
                      : '#e0f2fe',
                  color:
                    comm.user_role === 'teacher'
                      ? '#065f46'
                      : comm.user_role === 'admin'
                      ? '#6b21a8'
                      : '#0369a1',
                }}
              >
                {comm.user_role === 'teacher' ? 'Instructor' : comm.user_role === 'admin' ? 'Administration' : 'Student'}
              </span>
            </div>

            {/* Comment Body */}
            <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.55, margin: '0 0 0.75rem 0', whiteSpace: 'pre-line' }}>
              {comm.content}
            </p>

            {/* Actions: Like & Reply */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => handleLike(comm.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                }}
              >
                <span>👍</span>
                <span>{comm.likes} Helpful</span>
              </button>

              <button
                type="button"
                onClick={() => setReplyingToId(replyingToId === comm.id ? null : comm.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                }}
              >
                <span>💬 Reply</span>
              </button>
            </div>

            {/* Reply Input Form */}
            {replyingToId === comm.id && (
              <div style={{ marginTop: '0.85rem', paddingLeft: '1rem', borderLeft: '2px solid #cbd5e1' }}>
                <textarea
                  className="input"
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comm.user_name}...`}
                  style={{ width: '100%', fontSize: '0.84rem', padding: '0.5rem 0.75rem', borderRadius: '8px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '0.4rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setReplyingToId(null)
                      setReplyText('')
                    }}
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handlePostReply(comm.id)}
                    disabled={!replyText.trim()}
                    style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
                  >
                    Post Reply
                  </button>
                </div>
              </div>
            )}

            {/* Nested Replies */}
            {comm.replies && comm.replies.length > 0 && (
              <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', paddingLeft: '1rem', borderLeft: '2px solid #e2e8f0' }}>
                {comm.replies.map((rep) => (
                  <div key={rep.id} style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a' }}>{rep.user_name}</span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '1px 6px',
                            borderRadius: '999px',
                            background: rep.user_role === 'teacher' ? '#d1fae5' : '#e0f2fe',
                            color: rep.user_role === 'teacher' ? '#065f46' : '#0369a1',
                          }}
                        >
                          {rep.user_role === 'teacher' ? 'Instructor' : 'Student'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{formatTimestamp(rep.created_at)}</span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#334155', margin: '0 0 0.4rem 0', lineHeight: 1.5 }}>
                      {rep.content}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleLike(rep.id, true, comm.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      👍 {rep.likes} Helpful
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
