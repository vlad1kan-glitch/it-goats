/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { TournamentPublic } from './pages/TournamentPublic';
import { TournamentAdmin } from './pages/TournamentAdmin';
import { CreateTournament } from './pages/CreateTournament';

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tournaments/new" element={<CreateTournament />} />
          <Route path="tournaments/:id" element={<TournamentPublic />} />
          <Route path="tournaments/:id/admin" element={<TournamentAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
