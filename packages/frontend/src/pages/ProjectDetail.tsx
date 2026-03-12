import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getProject } from '../api/projects';
import type { Project } from '../api/types';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (id) getProject(Number(id)).then((res) => setProject(res.data));
  }, [id]);

  if (!project) return <div className="p-8">Loading...</div>;

  const sections = [
    { label: 'Assets', path: 'assets', desc: 'Characters, Scenes, Props' },
    { label: 'Episodes', path: 'episodes', desc: 'Scripts & Storyboards' },
    { label: 'Pipeline', path: 'pipeline', desc: 'Run & Monitor' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link to="/projects" className="text-sm text-blue-600 hover:underline">&larr; Back to Projects</Link>
      <h1 className="text-2xl font-bold mt-4">{project.title}</h1>
      <p className="text-gray-600 mt-1">{project.description || 'No description'}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {sections.map((s) => (
          <Link
            key={s.path}
            to={`/projects/${id}/${s.path}`}
            className="p-6 border rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg">{s.label}</h3>
            <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
