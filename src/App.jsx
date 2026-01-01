import { useState, useEffect, useMemo } from 'react'

// Custom hook for localStorage persistence
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('Error reading localStorage:', error)
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error('Error setting localStorage:', error)
    }
  }

  return [storedValue, setValue]
}

// Utility functions for sorting and filtering
const sortApplications = (apps, sortBy, sortOrder) => {
  return [...apps].sort((a, b) => {
    let comparison = 0
    
    if (sortBy === 'dateApplied') {
      comparison = new Date(a.dateApplied) - new Date(b.dateApplied)
    } else if (sortBy === 'company') {
      comparison = a.company.localeCompare(b.company)
    } else if (sortBy === 'status') {
      const statusOrder = ['Applied', 'OA', 'Interview', 'Offer', 'Rejected']
      comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
    }
    
    return sortOrder === 'asc' ? comparison : -comparison
  })
}

const filterApplications = (apps, statusFilter, searchQuery) => {
  return apps.filter(app => {
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter
    const matchesSearch = app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.role.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })
}

// Status badge component
function StatusBadge({ status }) {
  const statusStyles = {
    Applied: { bg: '#3b82f6', color: '#fff' },
    OA: { bg: '#f59e0b', color: '#000' },
    Interview: { bg: '#8b5cf6', color: '#fff' },
    Offer: { bg: '#10b981', color: '#fff' },
    Rejected: { bg: '#ef4444', color: '#fff' }
  }
  
  const style = statusStyles[status] || statusStyles.Applied
  
  return (
    <span 
      className="status-badge"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {status}
    </span>
  )
}

// Application form component
function ApplicationForm({ onSubmit, initialData, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    company: '',
    role: '',
    status: 'Applied',
    dateApplied: new Date().toISOString().split('T')[0],
    link: '',
    notes: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.company.trim() || !formData.role.trim()) return
    onSubmit(formData)
    if (!initialData) {
      setFormData({
        company: '',
        role: '',
        status: 'Applied',
        dateApplied: new Date().toISOString().split('T')[0],
        link: '',
        notes: ''
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="application-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="company">Company *</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="e.g. Amazon"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role *</label>
          <input
            type="text"
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            placeholder="e.g. SWE Intern"
            required
          />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Applied">Applied</option>
            <option value="OA">OA</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="dateApplied">Date Applied</label>
          <input
            type="date"
            id="dateApplied"
            name="dateApplied"
            value={formData.dateApplied}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="link">Application Link</label>
        <input
          type="url"
          id="link"
          name="link"
          value={formData.link}
          onChange={handleChange}
          placeholder="https://..."
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Referral from..., Interview prep notes, etc."
          rows={3}
        />
      </div>
      
      <div className="form-actions">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {initialData ? 'Update' : 'Add Application'}
        </button>
      </div>
    </form>
  )
}

// Application card component
function ApplicationCard({ app, onEdit, onDelete, onStatusChange }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="application-card">
      <div className="card-header">
        <div className="card-title">
          <h3>{app.company}</h3>
          <p className="role">{app.role}</p>
        </div>
        <StatusBadge status={app.status} />
      </div>
      
      <div className="card-meta">
        <span className="date">Applied: {formatDate(app.dateApplied)}</span>
        {app.link && (
          <a href={app.link} target="_blank" rel="noopener noreferrer" className="link">
            View Posting ↗
          </a>
        )}
      </div>
      
      {app.notes && <p className="notes">{app.notes}</p>}
      
      <div className="card-actions">
        <select 
          value={app.status} 
          onChange={(e) => onStatusChange(app.id, e.target.value)}
          className="status-select"
        >
          <option value="Applied">Applied</option>
          <option value="OA">OA</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
        <button className="btn btn-small" onClick={() => onEdit(app)}>Edit</button>
        <button className="btn btn-small btn-danger" onClick={() => onDelete(app.id)}>Delete</button>
      </div>
    </div>
  )
}

// Stats component
function Stats({ applications }) {
  const stats = useMemo(() => {
    const total = applications.length
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {})
    
    const responseRate = total > 0 
      ? Math.round(((statusCounts['OA'] || 0) + (statusCounts['Interview'] || 0) + (statusCounts['Offer'] || 0)) / total * 100)
      : 0
    
    return { total, ...statusCounts, responseRate }
  }, [applications])

  return (
    <div className="stats-container">
      <div className="stat-card">
        <span className="stat-value">{stats.total}</span>
        <span className="stat-label">Total</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{stats.Applied || 0}</span>
        <span className="stat-label">Applied</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{stats.OA || 0}</span>
        <span className="stat-label">OA</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{stats.Interview || 0}</span>
        <span className="stat-label">Interview</span>
      </div>
      <div className="stat-card">
        <span className="stat-value">{stats.Offer || 0}</span>
        <span className="stat-label">Offers</span>
      </div>
      <div className="stat-card highlight">
        <span className="stat-value">{stats.responseRate}%</span>
        <span className="stat-label">Response Rate</span>
      </div>
    </div>
  )
}

// Main App component
export default function App() {
  const [applications, setApplications] = useLocalStorage('job-applications', [])
  const [showForm, setShowForm] = useState(false)
  const [editingApp, setEditingApp] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('dateApplied')
  const [sortOrder, setSortOrder] = useState('desc')

  // Add new application
  const addApplication = (formData) => {
    const newApp = {
      ...formData,
      id: Date.now().toString()
    }
    setApplications(prev => [...prev, newApp])
    setShowForm(false)
  }

  // Update existing application
  const updateApplication = (formData) => {
    setApplications(prev => 
      prev.map(app => app.id === editingApp.id ? { ...formData, id: app.id } : app)
    )
    setEditingApp(null)
  }

  // Delete application
  const deleteApplication = (id) => {
    if (window.confirm('Delete this application?')) {
      setApplications(prev => prev.filter(app => app.id !== id))
    }
  }

  // Quick status change
  const changeStatus = (id, newStatus) => {
    setApplications(prev =>
      prev.map(app => app.id === id ? { ...app, status: newStatus } : app)
    )
  }

  // Filtered and sorted applications
  const displayedApplications = useMemo(() => {
    const filtered = filterApplications(applications, statusFilter, searchQuery)
    return sortApplications(filtered, sortBy, sortOrder)
  }, [applications, statusFilter, searchQuery, sortBy, sortOrder])

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>Job Tracker</h1>
          <p className="subtitle">Track your internship applications</p>
        </div>
        <button 
          className="btn btn-primary add-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Close' : '+ Add Application'}
        </button>
      </header>

      <main className="main">
        <Stats applications={applications} />

        {showForm && (
          <section className="form-section">
            <h2>New Application</h2>
            <ApplicationForm 
              onSubmit={addApplication} 
              onCancel={() => setShowForm(false)}
            />
          </section>
        )}

        {editingApp && (
          <section className="form-section">
            <h2>Edit Application</h2>
            <ApplicationForm 
              onSubmit={updateApplication}
              initialData={editingApp}
              onCancel={() => setEditingApp(null)}
            />
          </section>
        )}

        <section className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search company or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Applied">Applied</option>
              <option value="OA">OA</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
            
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="dateApplied">Sort by Date</option>
              <option value="company">Sort by Company</option>
              <option value="status">Sort by Status</option>
            </select>
            
            <button 
              className="btn btn-small"
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        </section>

        <section className="applications-section">
          {displayedApplications.length === 0 ? (
            <div className="empty-state">
              <p>No applications yet.</p>
              <p>Click "Add Application" to get started!</p>
            </div>
          ) : (
            <div className="applications-grid">
              {displayedApplications.map(app => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  onEdit={setEditingApp}
                  onDelete={deleteApplication}
                  onStatusChange={changeStatus}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>Built by Omar Masad • {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}
