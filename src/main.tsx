import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import "bootstrap/dist/css/bootstrap.min.css"
import { ToastContainer } from 'react-toastify'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import App from './pages/App'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import Edit from './pages/Edit'
import { Button } from 'react-bootstrap'
import Logout from './pages/Logout'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Button onClick={() => window.location.href = "/"} variant="primary" id='BUTTON_froccs'>Fröccs</Button>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<App />} />
        <Route path='/profile/:username' element={<Profile />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/edit/:id' element={<Edit />} />
        <Route path='/logout' element={<Logout />}/>
        <Route path="*" element={<Navigate to="/" replace/>} />
      </Routes>
    </BrowserRouter>
    
    <ToastContainer/>
  </StrictMode>,
)
