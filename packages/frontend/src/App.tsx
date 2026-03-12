import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProjectList from './pages/ProjectList';
import ProjectDashboard from './pages/ProjectDashboard';
import ProjectSetup from './pages/ProjectSetup';
import AssetWarehouse from './pages/AssetWarehouse';
import ScriptEditor from './pages/ScriptEditor';
import StoryboardEditor from './pages/StoryboardEditor';
import VersionComparison from './pages/VersionComparison';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/:id" element={<ProjectDashboard />} />
        <Route path="/projects/:id/setup" element={<ProjectSetup />} />
        <Route path="/projects/:id/assets" element={<AssetWarehouse />} />
        <Route path="/projects/:id/episodes/:eid/script" element={<ScriptEditor />} />
        <Route path="/projects/:id/episodes/:eid/storyboard" element={<StoryboardEditor />} />
        <Route
          path="/projects/:id/episodes/:eid/storyboard/panels/:panelId/compare"
          element={<VersionComparison />}
        />
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
