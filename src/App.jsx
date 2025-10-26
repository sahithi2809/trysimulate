import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/browse" element={<BrowseSimulations />} />
          <Route path="/creator" element={<CreatorDashboard />} />
          <Route path="/creator/build" element={<SimulationBuilder />} />
          <Route path="/simulation/customer-comments/:id" element={<CustomerCommentsSimulation />} />
          <Route path="/simulation/sales-negotiation/:id" element={<SalesNegotiationSimulation />} />
          <Route path="/simulation/prioritization/:id" element={<PrioritizationSimulation />} />
          <Route path="/simulation/team-conflict/:id" element={<TeamConflictSimulation />} />
          <Route path="/simulation/custom/:id" element={<UniversalSimulationRenderer />} />
          <Route path="/simulation/html/:id" element={<UniversalHTMLSimulationRenderer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

