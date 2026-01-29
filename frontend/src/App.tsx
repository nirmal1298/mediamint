import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './layouts/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Issues from './pages/Issues';
import ProjectDetails from './pages/ProjectDetails';
import IssueDetails from './pages/IssueDetails';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<Dashboard />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/issues/:id" element={<IssueDetails />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
