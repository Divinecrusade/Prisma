// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/api';

// Types matching backend serializers
export interface ApiResearchImage {
  id: string;
  project: string;
  name: string;
  question: string;
  image?: string;
  url: string;
  added_at?: string;
  is_hidden?: boolean;
  review_count?: number;
}

export interface ApiResearchProject {
  id: string;
  name: string;
  description: string;
  created_at?: string;  // optional - not returned by create endpoint
  is_hidden: boolean;
  images?: ApiResearchImage[];  // optional - not returned by create/update endpoints
}

// Frontend types (camelCase)
export interface ResearchImage {
  id: string;
  name: string;
  question: string;
  url: string;
  addedAt: string;
  isHidden: boolean;
  reviewCount: number;
}

export interface ResearchProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  isHidden: boolean;
  images: ResearchImage[];
}

// Transform functions
const transformImage = (img: ApiResearchImage): ResearchImage => ({
  id: img.id,
  name: img.name,
  question: img.question,
  url: img.url,
  addedAt: img.added_at ?? new Date().toISOString().split('T')[0],
  isHidden: img.is_hidden ?? false,
  reviewCount: img.review_count ?? 0,
});

const transformProject = (proj: ApiResearchProject): ResearchProject => ({
  id: proj.id,
  name: proj.name,
  description: proj.description,
  createdAt: proj.created_at ?? new Date().toISOString().split('T')[0],
  isHidden: proj.is_hidden,
  images: proj.images?.map(transformImage) ?? [],
});

// API Error handling
class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(response.status, data.message || response.statusText, data);
  }
  return response.json();
}

// Paginated response type
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Projects API
export const projectsApi = {
  async list(): Promise<ResearchProject[]> {
    const response = await fetch(`${API_BASE_URL}/projects/`);
    const data = await handleResponse<PaginatedResponse<ApiResearchProject>>(response);
    return data.results.map(transformProject);
  },

  async create(project: { name: string; description: string; is_hidden?: boolean }): Promise<ResearchProject> {
    const response = await fetch(`${API_BASE_URL}/projects/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    const data = await handleResponse<ApiResearchProject>(response);
    return transformProject(data);
  },

  async update(id: string, project: { name?: string; description?: string }): Promise<ResearchProject> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    const data = await handleResponse<ApiResearchProject>(response);
    return transformProject(data);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }
  },

  async toggleVisibility(id: string): Promise<{ is_hidden: boolean }> {
    const response = await fetch(`${API_BASE_URL}/projects/${id}/visibility/`, {
      method: 'PATCH',
    });
    return handleResponse(response);
  },
};

// Images API
export const imagesApi = {
  async listByProject(projectId: string): Promise<ResearchImage[]> {
    const response = await fetch(`${API_BASE_URL}/images/?project_id=${projectId}`);
    const data = await handleResponse<PaginatedResponse<ApiResearchImage>>(response);
    return data.results.map(transformImage);
  },

  async create(projectId: string, imageData: { name: string; question: string; file: File }): Promise<ResearchImage> {
    const formData = new FormData();
    formData.append('project', projectId);
    formData.append('name', imageData.name);
    formData.append('question', imageData.question);
    formData.append('image', imageData.file);

    const response = await fetch(`${API_BASE_URL}/images/`, {
      method: 'POST',
      body: formData,
    });
    const data = await handleResponse<ApiResearchImage>(response);
    return transformImage(data);
  },

  async update(id: string, imageData: { name?: string; question?: string; file?: File }): Promise<ResearchImage> {
    const formData = new FormData();
    if (imageData.name) formData.append('name', imageData.name);
    if (imageData.question) formData.append('question', imageData.question);
    if (imageData.file) formData.append('image', imageData.file);

    const response = await fetch(`${API_BASE_URL}/images/${id}/`, {
      method: 'PATCH',
      body: formData,
    });
    const data = await handleResponse<ApiResearchImage>(response);
    return transformImage(data);
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/images/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }
  },

  async toggleVisibility(id: string): Promise<{ is_hidden: boolean }> {
    const response = await fetch(`${API_BASE_URL}/images/${id}/visibility/`, {
      method: 'PATCH',
    });
    return handleResponse(response);
  },

  async getById(id: string): Promise<ResearchImage> {
    const response = await fetch(`${API_BASE_URL}/images/${id}/`);
    const data = await handleResponse<ApiResearchImage>(response);
    return transformImage(data);
  },
};

// Annotations API
export const annotationsApi = {
  async submit(data: {
    id: string;
    image_href: string;
    text_content: string;
    annotations: unknown[];
  }): Promise<{ message: string; session_id: string; created_count: number; total_count: number }> {
    const response = await fetch(`${API_BASE_URL}/annotations/submit/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};
