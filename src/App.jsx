import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Index from './pages/Index'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CasesList from './pages/CasesList'
import BrowseCases from './pages/BrowseCases'
import CreateCase from './pages/CreateCase'
import CaseDetails from './pages/CaseDetails'
import Hearing from './pages/Hearing'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/cases" element={<ProtectedRoute><CasesList /></ProtectedRoute>} />
      <Route path="/cases/browse" element={<ProtectedRoute><BrowseCases /></ProtectedRoute>} />
      <Route path="/cases/new" element={<ProtectedRoute><CreateCase /></ProtectedRoute>} />
      <Route path="/cases/:caseId" element={<ProtectedRoute><CaseDetails /></ProtectedRoute>} />
      <Route path="/cases/:caseId/hearing" element={<ProtectedRoute><Hearing /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
// src/App.jsx
