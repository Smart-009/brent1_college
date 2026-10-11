import React from 'react'
import { SchoolErpProvider, useSchoolErp } from './context/SchoolErpContext'
import { LoginPortal } from './pages/LoginPortal'
import { SchoolErpApp } from './pages/SchoolErpApp'

function MainContent() {
  const { currentUser } = useSchoolErp()

  if (!currentUser) {
    return <LoginPortal />
  }

  return <SchoolErpApp />
}

export function App() {
  return (
    <SchoolErpProvider>
      <MainContent />
    </SchoolErpProvider>
  )
}

export default App
