import React, { useState } from 'react';
import { Button } from '@untitledui/base/buttons/button';

// Icon components
const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

const EditIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CopyIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const ImageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UsersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

interface ResearchImage {
  id: string;
  name: string;
  url: string;
  questions: string[];
  isHidden: boolean;
  reviewCount: number;
}

interface ResearchProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  isHidden: boolean;
  images: ResearchImage[];
}

// Mock data - replace with actual API calls
const mockProjects: ResearchProject[] = [
  {
    id: '1',
    name: 'Mobile App Navigation Study',
    description: 'Evaluating user interface navigation patterns in mobile applications',
    createdAt: '2024-01-15',
    isHidden: false,
    images: [
      {
        id: 'img-1',
        name: 'Homepage Design',
        url: '/images/homepage.png',
        questions: ['How intuitive is the navigation?', 'What catches your attention first?'],
        isHidden: false,
        reviewCount: 12
      },
      {
        id: 'img-2',
        name: 'Profile Page',
        url: '/images/profile.png',
        questions: ['Is the profile information clear?'],
        isHidden: false,
        reviewCount: 8
      }
    ]
  },
  {
    id: '2',
    name: 'E-commerce Checkout Flow',
    description: 'Understanding user behavior during the checkout process',
    createdAt: '2024-02-01',
    isHidden: false,
    images: [
      {
        id: 'img-3',
        name: 'Cart Summary',
        url: '/images/cart.png',
        questions: ['Is the pricing information clear?', 'Are there any confusing elements?'],
        isHidden: true,
        reviewCount: 15
      }
    ]
  }
];

const AdminPage: React.FC = () => {
  const [projects, setProjects] = useState<ResearchProject[]>(mockProjects);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const toggleProjectVisibility = (projectId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, isHidden: !project.isHidden }
        : project
    ));
  };

  const toggleImageVisibility = (projectId: string, imageId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? {
            ...project,
            images: project.images.map(image =>
              image.id === imageId 
                ? { ...image, isHidden: !image.isHidden }
                : image
            )
          }
        : project
    ));
  };

  const deleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      setProjects(prev => prev.filter(project => project.id !== projectId));
    }
  };

  const deleteImage = (projectId: string, imageId: string) => {
    if (window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? {
              ...project,
              images: project.images.filter(image => image.id !== imageId)
            }
          : project
      ));
    }
  };

  const copyReviewLink = (imageId: string) => {
    const link = `${window.location.origin}/review/${imageId}`;
    navigator.clipboard.writeText(link);
    alert('Review link copied to clipboard!');
  };

  const copyAnalysisLink = (imageId: string) => {
    const link = `${window.location.origin}/analysis/${imageId}`;
    navigator.clipboard.writeText(link);
    alert('Analysis link copied to clipboard!');
  };

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  return (
    <div className="min-h-screen bg-gray-25 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-display-md font-semibold text-gray-900">Research Projects</h1>
            <p className="mt-1 text-text-md text-gray-600">Manage your UX research projects and analyze user feedback</p>
          </div>
          <Button color="primary" size="md" iconLeading={PlusIcon}>
            New Project
          </Button>
        </div>

        {/* Projects List */}
        <div className="space-y-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs ${
                project.isHidden ? 'opacity-60' : ''
              }`}
            >
              {/* Project Header */}
              <div className="border-b border-gray-200 px-6 py-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-text-lg font-semibold text-gray-900">{project.name}</h2>
                      {project.isHidden && (
                        <span className="inline-flex items-center rounded-full bg-warning-50 px-2 py-1 text-text-xs font-medium text-warning-700">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-text-sm text-gray-600">{project.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-text-sm text-gray-500">
                      <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <ImageIcon className="h-4 w-4" />
                        {project.images.length} images
                      </span>
                      <span className="flex items-center gap-1">
                        <UsersIcon className="h-4 w-4" />
                        {project.images.reduce((total, img) => total + img.reviewCount, 0)} reviews
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={() => toggleProjectExpansion(project.id)}
                      iconTrailing={expandedProject === project.id ? ChevronUpIcon : ChevronDownIcon}
                    >
                      {expandedProject === project.id ? 'Collapse' : 'Expand'}
                    </Button>
                    <Button
                      color="secondary"
                      size="sm"
                      onClick={() => toggleProjectVisibility(project.id)}
                      iconLeading={project.isHidden ? EyeOffIcon : EyeIcon}
                      title={project.isHidden ? 'Show project' : 'Hide project'}
                    />
                    <Button
                      color="secondary"
                      size="sm"
                      iconLeading={EditIcon}
                      title="Edit project"
                    />
                    <Button
                      color="secondary-destructive"
                      size="sm"
                      onClick={() => deleteProject(project.id)}
                      iconLeading={TrashIcon}
                      title="Delete project"
                    />
                  </div>
                </div>
              </div>

              {/* Project Images */}
              {expandedProject === project.id && (
                <div className="px-6 py-5">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-text-lg font-semibold text-gray-900">Images</h3>
                    <Button color="primary" size="sm" iconLeading={PlusIcon}>
                      Add Image
                    </Button>
                  </div>
                  
                  {project.images.length === 0 ? (
                    <div className="py-12 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
                      <p className="mt-3 text-text-sm text-gray-500">No images added yet</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {project.images.map((image) => (
                        <div
                          key={image.id}
                          className={`rounded-lg border border-gray-200 p-4 ${
                            image.isHidden ? 'bg-gray-50 opacity-60' : 'bg-white'
                          }`}
                        >
                          <div className="mb-3 flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-text-sm font-semibold text-gray-900">{image.name}</h4>
                              {image.isHidden && (
                                <span className="mt-1 inline-flex items-center rounded-full bg-warning-50 px-2 py-1 text-text-xs font-medium text-warning-700">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                color="secondary"
                                size="sm"
                                onClick={() => toggleImageVisibility(project.id, image.id)}
                                iconLeading={image.isHidden ? EyeOffIcon : EyeIcon}
                                title={image.isHidden ? 'Show image' : 'Hide image'}
                              />
                              <Button
                                color="secondary-destructive"
                                size="sm"
                                onClick={() => deleteImage(project.id, image.id)}
                                iconLeading={TrashIcon}
                                title="Delete image"
                              />
                            </div>
                          </div>
                          
                          <div className="mb-3 text-text-sm text-gray-600">
                            <div className="mb-1 flex items-center gap-1">
                              <UsersIcon className="h-3.5 w-3.5" />
                              {image.reviewCount} reviews
                            </div>
                            <div>Questions: {image.questions.length}</div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              color="secondary"
                              size="sm"
                              onClick={() => copyReviewLink(image.id)}
                              iconLeading={CopyIcon}
                              className="flex-1"
                            >
                              Review Link
                            </Button>
                            <Button
                              color="secondary"
                              size="sm"
                              onClick={() => copyAnalysisLink(image.id)}
                              iconLeading={CopyIcon}
                              className="flex-1"
                            >
                              Report
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="py-12 text-center">
            <div className="mb-4 text-gray-400">
              <ImageIcon className="mx-auto h-16 w-16" />
            </div>
            <h3 className="text-text-lg font-semibold text-gray-900">No projects yet</h3>
            <p className="mt-1 text-text-sm text-gray-600">Create your first UX research project to get started</p>
            <Button color="primary" size="md" iconLeading={PlusIcon} className="mt-4">
              Create Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
