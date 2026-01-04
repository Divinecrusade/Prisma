import React, { useState } from 'react';
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
  Users01
} from '@untitledui/icons';
import CreateProjectModal from './CreateProjectModal';
import AddImageModal from './AddImageModal';
import EditProjectModal from './EditProjectModal';
import EditImageModal from './EditImageModal';

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

interface ResearchImage {
  id: string;
  name: string;
  question: string;
  url: string;
  addedAt: string;
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
        question: 'How intuitive is the navigation layout on the homepage?',
        url: '/images/homepage.png',
        addedAt: '2024-01-15',
        isHidden: false,
        reviewCount: 12
      },
      {
        id: 'img-2',
        name: 'Profile Page',
        question: 'Is the user profile information easy to find and understand?',
        url: '/images/profile.png',
        addedAt: '2024-01-16',
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
        question: 'Does the cart summary clearly show all costs before checkout?',
        url: '/images/cart.png',
        addedAt: '2024-02-01',
        isHidden: true,
        reviewCount: 15
      }
    ]
  }
];

const AdminPage: React.FC = () => {
  const [projects, setProjects] = useState<ResearchProject[]>(mockProjects);
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

  const [editImageModalState, setEditImageModalState] = useState<{
    isOpen: boolean;
    image: { id: string; name: string; question: string; url: string } | null;
    projectId: string;
  }>({
    isOpen: false,
    image: null,
    projectId: ''
  });

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

  const navigate = useNavigate();
  const gotoReport = (imageId: string) => {
    const link = `${window.location.origin}/report/${imageId}`;
    navigate(link);
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
                    <p className="mt-1 text-text-sm text-gray-600 text-left">{project.description}</p>
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
                      onClick={() => openEditProjectModal(project)}
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
                    <Button color="primary" size="sm" iconLeading={PlusIcon} onClick={() => openAddImageModal(project.id, project.name)}>
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
                            <div className="min-w-0 flex-1 text-left">
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
                                color="secondary"
                                size="sm"
                                onClick={() => openEditImageModal(image, project.id)}
                                iconLeading={EditIcon}
                                title="Edit image"
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
                          
                          <p className="mb-3 text-text-sm text-gray-600 text-justify">{image.question}</p>
                          
                          <div className="mb-3 flex justify-between text-text-sm text-gray-600">
                            <div className="mb-1 flex items-center gap-1">
                              <UsersIcon className="h-3.5 w-3.5" />
                              {image.reviewCount} reviews
                            </div>
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
      />

      {/* Add Image Modal */}
      <AddImageModal
        isOpen={addImageModalState.isOpen}
        onClose={closeAddImageModal}
        projectId={addImageModalState.projectId}
        projectName={addImageModalState.projectName}
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
