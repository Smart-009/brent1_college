import React, { useState } from 'react'
import { useSchoolErp } from '../../context/SchoolErpContext'
import { LibraryBook, BookLoan } from '../../types/schoolErp'
import { BookOpenIcon, PlusIcon, SearchIcon, CheckIcon, XIcon } from '../common/Icons'

export const LibraryView: React.FC = () => {
  const { libraryBooks, bookLoans, students, staff, issueBookLoan, returnBookLoan, addLibraryBook, activeSchool } = useSchoolErp()
  const [activeTab, setActiveTab] = useState<'catalog' | 'loans'>('catalog')
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)

  // Add Book Form State
  const [isbn, setIsbn] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState<LibraryBook['category']>('Science')
  const [totalCopies, setTotalCopies] = useState(20)
  const [shelfLocation, setShelfLocation] = useState('')

  // Issue Loan Form State
  const [selectedBookId, setSelectedBookId] = useState('')
  const [borrowerType, setBorrowerType] = useState<'Student' | 'Staff'>('Student')
  const [borrowerId, setBorrowerId] = useState('')
  const [dueDate, setDueDate] = useState('2026-03-15')

  const filteredBooks = libraryBooks.filter((bk) =>
    bk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bk.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bk.isbn.includes(searchTerm)
  )

  const filteredLoans = bookLoans.filter((ln) =>
    ln.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ln.borrowerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !author) return
    addLibraryBook({
      isbn: isbn || `ISBN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      title,
      author,
      category,
      totalCopies,
      availableCopies: totalCopies,
      shelfLocation: shelfLocation || 'General Stacks',
    })
    setIsAddBookModalOpen(false)
    setIsbn('')
    setTitle('')
    setAuthor('')
    setShelfLocation('')
  }

  const handleIssueLoan = (e: React.FormEvent) => {
    e.preventDefault()
    const bk = libraryBooks.find((b) => b.id === selectedBookId)
    if (!bk) return

    let borrowerName = ''
    if (borrowerType === 'Student') {
      const std = students.find((s) => s.id === borrowerId)
      borrowerName = std ? `${std.fullName} (${std.admissionNo})` : 'Student'
    } else {
      const stf = staff.find((s) => s.id === borrowerId)
      borrowerName = stf ? stf.fullName : 'Faculty Member'
    }

    issueBookLoan({
      bookId: bk.id,
      bookTitle: bk.title,
      borrowerId,
      borrowerName,
      borrowerRole: borrowerType,
      dueDate,
    })

    setIsIssueModalOpen(false)
    setSelectedBookId('')
    setBorrowerId('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Library & Textbook Management
          </h1>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.88rem' }}>
            Curriculum textbook catalog, book check-outs, circulation tracking, and overdue fine collection.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setIsIssueModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.6rem 1rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <BookOpenIcon size={16} /> Issue Book Loan
          </button>
          <button
            onClick={() => setIsAddBookModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.6rem 1rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <PlusIcon size={16} /> Catalog New Book
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Cataloged Titles</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.35rem' }}>{libraryBooks.length}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            {libraryBooks.reduce((sum, b) => sum + b.totalCopies, 0)} Total copies
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Books in Circulation</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#2563eb', marginTop: '0.35rem' }}>
            {bookLoans.filter((l) => l.status === 'Borrowed' || l.status === 'Overdue').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Currently on loan</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Overdue Loans</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#b91c1c', marginTop: '0.35rem' }}>
            {bookLoans.filter((l) => l.status === 'Overdue').length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '0.25rem' }}>Subject to late return fees</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Available on Shelves</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '0.35rem' }}>
            {libraryBooks.reduce((sum, b) => sum + b.availableCopies, 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>Ready for checkout</div>
        </div>
      </div>

      {/* View Switcher and Search */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('catalog')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'catalog' ? '#2563eb' : '#f1f5f9',
              color: activeTab === 'catalog' ? '#ffffff' : '#475569',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Book Catalog ({libraryBooks.length})
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'loans' ? '#2563eb' : '#f1f5f9',
              color: activeTab === 'loans' ? '#ffffff' : '#475569',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Active Circulation & Loans ({bookLoans.length})
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.5rem 0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', flex: '1 1 280px', maxWidth: '350px' }}>
          <SearchIcon size={16} color="#64748b" />
          <input
            type="text"
            placeholder={activeTab === 'catalog' ? 'Search title, author or ISBN...' : 'Search borrower or book...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Catalog Table */}
      {activeTab === 'catalog' ? (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Title & Author</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>ISBN Code</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Shelf Location</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'center' }}>Total Copies</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'center' }}>Available</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((bk) => (
                <tr key={bk.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{bk.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>By {bk.author}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                      {bk.category}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontSize: '0.82rem', color: '#475569' }}>
                    {bk.isbn}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#0f172a', fontWeight: 600, fontSize: '0.82rem' }}>
                    {bk.shelfLocation}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 600 }}>
                    {bk.totalCopies}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: bk.availableCopies > 0 ? '#dcfce7' : '#fee2e2',
                        color: bk.availableCopies > 0 ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {bk.availableCopies} in stock
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Loans Table */
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Borrower</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Book Title</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Borrow Date</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Due Date</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Loan Status</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Fine</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((ln) => (
                <tr key={ln.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{ln.borrowerName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Role: {ln.borrowerRole}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#2563eb' }}>
                    {ln.bookTitle}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.82rem' }}>
                    {ln.borrowDate}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, fontSize: '0.82rem', color: ln.status === 'Overdue' ? '#b91c1c' : '#0f172a' }}>
                    {ln.dueDate}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor:
                          ln.status === 'Returned'
                            ? '#dcfce7'
                            : ln.status === 'Overdue'
                            ? '#fee2e2'
                            : '#dbeafe',
                        color:
                          ln.status === 'Returned'
                            ? '#15803d'
                            : ln.status === 'Overdue'
                            ? '#b91c1c'
                            : '#1e40af',
                      }}
                    >
                      {ln.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: ln.fineAmount > 0 ? '#b91c1c' : '#64748b' }}>
                    {ln.fineAmount > 0 ? `${activeSchool.currency} ${ln.fineAmount.toLocaleString()}` : 'None'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    {ln.status !== 'Returned' && (
                      <button
                        onClick={() => returnBookLoan(ln.id)}
                        style={{
                          padding: '0.35rem 0.75rem',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#16a34a',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Return & Clear ✓
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Book Modal */}
      {isAddBookModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '1.75rem',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Catalog New Library Book</h3>
              <button onClick={() => setIsAddBookModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <XIcon size={18} />
              </button>
            </div>
            <form onSubmit={handleAddBook} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Book Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pure Mathematics 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Author / Publisher
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hugh Neill & Douglas Quadling"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Subject Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                  >
                    <option value="Science">Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Languages">Languages</option>
                    <option value="Literature">Literature</option>
                    <option value="Humanities">Humanities</option>
                    <option value="General">General</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Total Copies
                  </label>
                  <input
                    type="number"
                    value={totalCopies}
                    onChange={(e) => setTotalCopies(Number(e.target.value))}
                    min={1}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    ISBN Code
                  </label>
                  <input
                    type="text"
                    placeholder="978-019..."
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Shelf Location
                  </label>
                  <input
                    type="text"
                    placeholder="Shelf M-03"
                    value={shelfLocation}
                    onChange={(e) => setShelfLocation(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Save Accession
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Book Loan Modal */}
      {isIssueModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(3px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '1.75rem',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>Issue Book on Loan</h3>
              <button onClick={() => setIsIssueModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <XIcon size={18} />
              </button>
            </div>
            <form onSubmit={handleIssueLoan} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Select Book (from available shelf stock)
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                  required
                >
                  <option value="">-- Choose Book --</option>
                  {libraryBooks
                    .filter((b) => b.availableCopies > 0)
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.availableCopies} available) - {b.shelfLocation}
                      </option>
                    ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Borrower Type
                  </label>
                  <select
                    value={borrowerType}
                    onChange={(e) => setBorrowerType(e.target.value as any)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                  >
                    <option value="Student">Student</option>
                    <option value="Staff">Faculty / Staff</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    required
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>
                  Borrower Name
                </label>
                <select
                  value={borrowerId}
                  onChange={(e) => setBorrowerId(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}
                  required
                >
                  <option value="">-- Choose Borrower --</option>
                  {borrowerType === 'Student'
                    ? students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} ({s.admissionNo} - {s.className})
                        </option>
                      ))
                    : staff.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.fullName} ({st.designation})
                        </option>
                      ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  style={{
                    padding: '0.55rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Issue Loan Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
