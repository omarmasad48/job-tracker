# Job Application Tracker

A React app to track your internship and job applications.

## Features

- ✅ Add, edit, and delete applications
- ✅ Track company, role, status, date, link, and notes
- ✅ Filter by status (Applied, OA, Interview, Offer, Rejected)
- ✅ Search by company or role name
- ✅ Sort by date, company, or status
- ✅ Dashboard with stats and response rate
- ✅ Data persists in localStorage
- ✅ Responsive design

## Tech Stack

- React 18
- Vite
- CSS (no frameworks)
- localStorage for persistence

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
  App.jsx          # Main component with all logic
  main.jsx         # Entry point
  index.css        # Styles
```

## Data Structure

Each application is stored as:

```javascript
{
  id: string,
  company: string,
  role: string,
  status: 'Applied' | 'OA' | 'Interview' | 'Offer' | 'Rejected',
  dateApplied: string (YYYY-MM-DD),
  link: string,
  notes: string
}
```

## Interview Talking Points

- **localStorage persistence**: O(1) read/write with JSON serialization
- **Filtering**: Uses hashmap-style status matching for O(1) lookups
- **Sorting**: Implements comparison functions for different sort criteria
- **Search**: String matching with `.includes()` - O(n*m) where n = apps, m = query length
- **State management**: React hooks (useState, useMemo) for efficient re-renders

## Built By

Omar Masad - 2025
