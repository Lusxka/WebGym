import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

const AppRoutes: React.FC = () => {
  const { state } = useApp();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!state.isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" />} 
      />
      <Route 
        path="/dashboard" 
        element={state.isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} 
      />
      <Route path="/" element={<Navigate to={state.isAuthenticated ? "/dashboard" : "/login"} />} />
    </Routes>
  );
};

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <AppProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AppProvider>
    </div>
  );
}

export default App;