import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProjectList from './pages/ProjectList';
import ProjectDashboard from './pages/ProjectDashboard';
import ProjectSetup from './pages/ProjectSetup';
import AssetWarehouse from './pages/AssetWarehouse';
import ScriptEditor from './pages/ScriptEditor';
import StoryboardEditor from './pages/StoryboardEditor';
import VersionComparison from './pages/VersionComparison';
import EpisodeManagement from './pages/EpisodeManagement';
import ProjectWizard from './pages/ProjectWizard';
import GateReview from './pages/GateReview';
import PreviewPage from './pages/PreviewPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/new" element={<ProjectWizard />} />
        <Route path="/projects/:id" element={<ProjectDashboard />} />
        <Route path="/projects/:id/gate/:gate" element={<GateReview />} />
        <Route path="/projects/:id/preview" element={<PreviewPage />} />
        <Route path="/projects/:id/setup" element={<ProjectSetup />} />
        <Route path="/projects/:id/settings" element={<SettingsPage />} />
        <Route path="/projects/:id/assets" element={<AssetWarehouse />} />
        <Route path="/projects/:id/episodes" element={<EpisodeManagement />} />
        <Route path="/projects/:id/episodes/:eid/script" element={<ScriptEditor />} />
        <Route path="/projects/:id/episodes/:eid/storyboard" element={<StoryboardEditor />} />
        <Route
          path="/projects/:id/episodes/:eid/storyboard/panels/:panelId/compare"
          element={<VersionComparison />}
        />
        {/* Redirects for deprecated routes */}
        <Route path="/projects/:id/pipeline" element={<Navigate to="../" replace />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
