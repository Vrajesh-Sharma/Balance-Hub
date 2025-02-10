import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import BalanceTracker from './pages/BalanceTracker';
import HabitPlanner from './pages/HabitPlanner';
import StressHub from './pages/StressHub';
import Goals from './pages/Goals';
import Journal from './pages/Journal';
import Game from './pages/Game';
import Resources from './pages/Resources';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tracker" element={<BalanceTracker />} />
          <Route path="planner" element={<HabitPlanner />} />
          <Route path="stress-hub" element={<StressHub />} />
          <Route path="goals" element={<Goals />} />
          <Route path="journal" element={<Journal />} />
          <Route path="game" element={<Game />} />
          <Route path="resources" element={<Resources />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;