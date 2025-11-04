import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import BrowseSimulations from './pages/BrowseSimulations';
import CreatorDashboard from './pages/CreatorDashboard';
import SimulationBuilder from './pages/SimulationBuilder';
import CustomerCommentsSimulation from './pages/simulations/CustomerCommentsSimulation';
import SalesNegotiationSimulation from './pages/simulations/SalesNegotiationSimulation';
import PrioritizationSimulation from './pages/simulations/PrioritizationSimulation';
import TeamConflictSimulation from './pages/simulations/TeamConflictSimulation';
import UniversalSimulationRenderer from './components/UniversalSimulationRenderer';
import HTMLSimulationRenderer from './components/HTMLSimulationRenderer';
import UniversalHTMLSimulationRenderer from './components/UniversalHTMLSimulationRenderer';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import CompleteProfile from './pages/CompleteProfile';

function App() {
  return (
    <AuthProvider>
      <Router basename="/trysimulate">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
          <Routes>
            <Route path="/auth" element={<><Navbar /><AuthPage /></>} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/complete-profile" element={<><Navbar /><CompleteProfile /></>} />
            <Route path="/" element={<><Navbar /><LandingPage /></>} />
            <Route path="/browse" element={<><Navbar /><BrowseSimulations /></>} />
            <Route path="/creator" element={<><Navbar /><CreatorDashboard /></>} />
            <Route path="/creator/build" element={<><Navbar /><SimulationBuilder /></>} />
            <Route path="/simulation/customer-comments/:id" element={<><Navbar /><CustomerCommentsSimulation /></>} />
            <Route path="/simulation/sales-negotiation/:id" element={<><Navbar /><SalesNegotiationSimulation /></>} />
            <Route path="/simulation/prioritization/:id" element={<><Navbar /><PrioritizationSimulation /></>} />
            <Route path="/simulation/team-conflict/:id" element={<><Navbar /><TeamConflictSimulation /></>} />
            <Route path="/simulation/custom/:id" element={<><Navbar /><UniversalSimulationRenderer /></>} />
            <Route path="/simulation/html/:id" element={<><Navbar /><UniversalHTMLSimulationRenderer /></>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

