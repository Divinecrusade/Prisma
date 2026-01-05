import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from '@untitledui/base/buttons/button';
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Edit05,
  Trash01,
  Copy01,
  Image01,
  Users01,
  Loading02
} from '@untitledui/icons';
import CreateProjectModal from './CreateProjectModal';
import AddImageModal from './AddImageModal';
import EditProjectModal from './EditProjectModal';
import EditImageModal from './EditImageModal';
import { projectsApi, imagesApi, type ResearchProject, type ResearchImage } from '../api';

// Alias icons for backward compatibility
const PlusIcon = Plus;
const ChevronDownIcon = ChevronDown;
const ChevronUpIcon = ChevronUp;
const EyeIcon = Eye;
const EyeOffIcon = EyeOff;
const EditIcon = Edit05;
const TrashIcon = Trash01;
const CopyIcon = Copy01;
const ImageIcon = Image01;
const UsersIcon = Users01;

const AdminPage: React.FC = () => {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [addImageModalState, setAddImageModalState] = useState<{ isOpen: boolean; projectId: string; projectName: string }>({
    isOpen: false,
    projectId: '',
    projectName: ''
  });
  const [editProjectModalState, setEditProjectModalState] = useState<{
    isOpen: boolean;
    project: { id: string; name: string; description: string } | null;
  }>({
    isOpen: false,
    project: null
  });
  const [editImageModalState, setEditImageModalState] = useState<{
    isOpen: boolean;
    image: { id: string; name: string; question: string; url: string } | null;
    projectId: string;
  }>({
    isOpen: false,
    image: null,
    projectId: ''
  });

  // Fetch projects on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await projectsApi.list();
        setProjects(data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const openAddImageModal = (projectId: string, projectName: string) => {
    setAddImageModalState({ isOpen: true, projectId, projectName });
  };

  const closeAddImageModal = () => {
    setAddImageModalState({ isOpen: false, projectId: '', projectName: '' });
  };

  const openEditProjectModal = (project: ResearchProject) => {
    setEditProjectModalState({
      isOpen: true,
      project: { id: project.id, name: project.name, description: project.description }
    });
  };

  const closeEditProjectModal = () => {
    setEditProjectModalState({ isOpen: false, project: null });
  };

  const openEditImageModal = (image: ResearchImage, projectId: string) => {
    setEditImageModalState({
      isOpen: true,
      image: { id: image.id, name: image.name, question: image.question, url: image.url },
      projectId
    });
  };

  const closeEditImageModal = () => {
    setEditImageModalState({ isOpen: false, image: null, projectId: '' });
  };

  // Handle new project created
  const handleProjectCreated = (newProject: ResearchProject) => {
    setProjects(prev => [newProject, ...prev]);
  };

  // Handle new image added
  const handleImageAdded = (newImage: ResearchImage) => {
    setProjects(prev => prev.map(project => 
      project.id === addImageModalState.projectId 
        ? { ...project, images: [...project.images, newImage] }
        : project
    ));
  };

  const toggleProjectVisibility = async (projectId: string) => {
    try {
      await projectsApi.toggleVisibility(projectId);
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, isHidden: !project.isHidden }
          : project
      ));
    } catch (err) {
      console.error('Failed to toggle project visibility:', err);
    }
  };

  const toggleImageVisibility = async (projectId: string, imageId: string) => {
    try {
      await imagesApi.toggleVisibility(imageId);
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
    } catch (err) {
      console.error('Failed to toggle image visibility:', err);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await projectsApi.delete(projectId);
        setProjects(prev => prev.filter(project => project.id !== projectId));
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  const deleteImage = async (projectId: string, imageId: string) => {
    if (window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      try {
        await imagesApi.delete(imageId);
        setProjects(prev => prev.map(project => 
          project.id === projectId 
            ? {
                ...project,
                images: project.images.filter(image => image.id !== imageId)
              }
            : project
        ));
      } catch (err) {
        console.error('Failed to delete image:', err);
      }
    }
  };

  const copyReviewLink = (imageId: string) => {
    const link = `${window.location.origin}/review/${imageId}`;
    navigator.clipboard.writeText(link);
    alert('Review link copied to clipboard!');
  };

  const navigate = useNavigate();
  const gotoReport = (imageId: string) => {
    const link = `${window.location.origin}/report/${imageId}`;
    navigate(link);
  };

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-25">
        <div className="text-center">
          <Loading02 className="mx-auto h-8 w-8 animate-spin text-brand-600" />
          <p className="mt-2 text-text-md text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-25">
        <div className="text-center">
          <p className="text-text-md text-error-600">{error}</p>
          <Button 
            color="primary" 
            size="md" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-25 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-display-md font-semibold text-gray-900">Research Projects</h1>
            <p className="mt-1 text-text-md text-gray-600">Manage your UX research projects and analyze user feedback</p>
          </div>
          <Button color="primary" size="md" iconLeading={PlusIcon} onClick={() => setIsCreateModalOpen(true)}>
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
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="truncate text-text-lg font-semibold text-gray-900">{project.name}</h2>
                    {project.isHidden && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-text-xs font-medium text-gray-600">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-text-sm text-gray-600">{project.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-text-xs text-gray-500">
                    <span>Created: {project.createdAt}</span>
                    <span className="flex items-center gap-1">
                      <ImageIcon className="h-3.5 w-3.5" />
                      {project.images.length} images
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersIcon className="h-3.5 w-3.5" />
                      {project.images.reduce((sum, img) => sum + img.reviewCount, 0)} reviews
                    </span>
                  </div>
                </div>

                <div className="ml-4 flex items-center gap-2">
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => toggleProjectVisibility(project.id)}
                    iconLeading={project.isHidden ? EyeOffIcon : EyeIcon}
                  >
                    {project.isHidden ? 'Show' : 'Hide'}
                  </Button>
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => openEditProjectModal(project)}
                    iconLeading={EditIcon}
                  >
                    Edit
                  </Button>
                  <Button
                    color="secondary-destructive"
                    size="sm"
                    onClick={() => deleteProject(project.id)}
                    iconLeading={TrashIcon}
                  >
                    Delete
                  </Button>
                  <Button
                    color="secondary"
                    size="sm"
                    onClick={() => toggleProjectExpansion(project.id)}
                    iconLeading={expandedProject === project.id ? ChevronUpIcon : ChevronDownIcon}
                  >
                    {expandedProject === project.id ? 'Collapse' : 'Expand'}
                  </Button>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedProject === project.id && (
                <div className="bg-gray-50 px-6 py-4">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-text-md font-medium text-gray-900">Images</h3>
                    <Button
                      color="primary"
                      size="sm"
                      iconLeading={PlusIcon}
                      onClick={() => openAddImageModal(project.id, project.name)}
                    >
                      Add Image
                    </Button>
                  </div>

                  {project.images.length === 0 ? (
                    <div className="py-8 text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
                      <p className="mt-2 text-text-sm text-gray-500">No images added yet</p>
                      <Button
                        color="secondary"
                        size="sm"
                        className="mt-3"
                        iconLeading={PlusIcon}
                        onClick={() => openAddImageModal(project.id, project.name)}
                      >
                        Add your first image
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {project.images.map((image) => (
                        <div
                          key={image.id}
                          className={`rounded-lg border border-gray-200 bg-white p-4 ${
                            image.isHidden ? 'opacity-60' : ''
                          }`}
                        >
                          <div className="mb-3 flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate text-text-sm font-medium text-gray-900">{image.name}</h4>
                              {image.isHidden && (
                                <span className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-text-xs text-gray-600">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <div className="ml-2 flex gap-1">
                              <button
                                onClick={() => toggleImageVisibility(project.id, image.id)}
                                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                title={image.isHidden ? 'Show image' : 'Hide image'}
                              >
                                {image.isHidden ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => openEditImageModal(image, project.id)}
                                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                title="Edit image"
                              >
                                <EditIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteImage(project.id, image.id)}
                                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-error-600"
                                title="Delete image"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <p className="mb-3 line-clamp-2 text-text-xs text-gray-600">{image.question}</p>

                          <div className="mb-3 flex items-center gap-2 text-text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <UsersIcon className="h-3 w-3" />
                              {image.reviewCount} reviews
                            </span>
                            <div>Added at: {image.addedAt}</div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              color="secondary"
                              size="sm"
                              onClick={() => copyReviewLink(image.id)}
                              iconLeading={CopyIcon}
                              className="flex-1"
                            >
                              Get Review Link
                            </Button>
                            <Button
                              color="secondary"
                              size="sm"
                              onClick={() => gotoReport(image.id)}
                              className="flex-1"
                            >
                              Go to Report
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
            <Button color="primary" size="md" iconLeading={PlusIcon} className="mt-4" onClick={() => setIsCreateModalOpen(true)}>
              Create Project
            </Button>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      {/* Add Image Modal */}
      <AddImageModal
        isOpen={addImageModalState.isOpen}
        onClose={closeAddImageModal}
        projectId={addImageModalState.projectId}
        projectName={addImageModalState.projectName}
        onImageAdded={handleImageAdded}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={editProjectModalState.isOpen}
        onClose={closeEditProjectModal}
        project={editProjectModalState.project}
      />

      {/* Edit Image Modal */}
      <EditImageModal
        isOpen={editImageModalState.isOpen}
        onClose={closeEditImageModal}
        image={editImageModalState.image}
        projectId={editImageModalState.projectId}
      />
    </div>
  );
};

export default AdminPage;
