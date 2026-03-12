import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listProjects, createProject } from '../api/projects';
import type { Project } from '../api/types';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    listProjects().then((res) => setProjects(res.data));
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createProject({ title });
    setTitle('');
    setShowCreate(false);
    const res = await listProjects();
    setProjects(res.data);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          New Project
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project title..."
            className="w-full p-2 border rounded mb-2"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              Create
            </button>
            <button onClick={() => setShowCreate(false)} className="px-3 py-1 border rounded text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/projects/${p.id}`}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold">{p.title}</h3>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{p.status}</span>
              {p.genre && <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">{p.genre}</span>}
            </div>
          </Link>
        ))}
      </div>

      {projects.length === 0 && !showCreate && (
        <p className="text-center text-gray-500 mt-12">No projects yet. Create your first one!</p>
      )}
    </div>
  );
}
