// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/api';

// =============================================================================
// Auth Token Management
// =============================================================================

let authToken: string | null = null;

export function setAuthToken(token: string): void {
  authToken = token;
}

export function clearAuthToken(): void {
  authToken = null;
}

// =============================================================================
// Types
// =============================================================================

// Auth types
export interface AuthUser {
  email: string;
  is_admin: boolean;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  token?: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user: AuthUser | null;
}

// API types matching backend serializers
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
  created_at?: string;
  is_hidden: boolean;
  images?: ApiResearchImage[];
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

// =============================================================================
// Transform functions
// =============================================================================

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

// =============================================================================
// API Error handling
// =============================================================================

export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    throw new ApiError(
      response.status,
      errorData?.message || errorData?.error || `HTTP error ${response.status}`,
      errorData
    );
  }
  return response.json();
}

/**
 * Wrapper around fetch that adds auth headers
 */
async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  // Add Authorization header if token exists
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return fetch(url, { 
    ...options,
    headers,
  });
}

// =============================================================================
// Paginated response type
// =============================================================================

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// =============================================================================
// Auth API
// =============================================================================

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiFetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<LoginResponse>(response);
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await apiFetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
    });
    return handleResponse(response);
  },

  async getCurrentSession(): Promise<SessionResponse> {
    const response = await apiFetch(`${API_BASE_URL}/auth/me/`);
    return handleResponse<SessionResponse>(response);
  },
};

// =============================================================================
// Projects API
// =============================================================================

export const projectsApi = {
  async list(): Promise<ResearchProject[]> {
    const response = await apiFetch(`${API_BASE_URL}/projects/`);
    const data = await handleResponse<PaginatedResponse<ApiResearchProject>>(response);
    return data.results.map(transformProject);
  },

  async create(project: { name: string; description: string; is_hidden?: boolean }): Promise<ResearchProject> {
    const response = await apiFetch(`${API_BASE_URL}/projects/`, {
      method: 'POST',
      body: JSON.stringify(project),
    });
    const data = await handleResponse<ApiResearchProject>(response);
    return transformProject(data);
  },

  async update(id: string, project: { name?: string; description?: string; is_hidden?: boolean }): Promise<ResearchProject> {
    const response = await apiFetch(`${API_BASE_URL}/projects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(project),
    });
    const data = await handleResponse<ApiResearchProject>(response);
    return transformProject(data);
  },

  async delete(id: string): Promise<void> {
    const response = await apiFetch(`${API_BASE_URL}/projects/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to delete project');
    }
  },

  async toggleVisibility(id: string): Promise<{ is_hidden: boolean }> {
    const response = await apiFetch(`${API_BASE_URL}/projects/${id}/visibility/`, {
      method: 'PATCH',
    });
    return handleResponse(response);
  },
};

// =============================================================================
// Images API
// =============================================================================

export const imagesApi = {
  async listByProject(projectId: string): Promise<ResearchImage[]> {
    const response = await apiFetch(`${API_BASE_URL}/images/?project_id=${projectId}`);
    const data = await handleResponse<PaginatedResponse<ApiResearchImage>>(response);
    return data.results.map(transformImage);
  },

  async getById(id: string): Promise<ResearchImage> {
    // This endpoint is public for review page
    const response = await apiFetch(`${API_BASE_URL}/images/${id}/`);
    const data = await handleResponse<ApiResearchImage>(response);
    return transformImage(data);
  },

  async create(projectId: string, imageData: { name: string; question: string; file: File }): Promise<ResearchImage> {
    const formData = new FormData();
    formData.append('project', projectId);
    formData.append('name', imageData.name);
    formData.append('question', imageData.question);
    formData.append('image', imageData.file);

    const headers: Record<string, string> = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/images/`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await handleResponse<ApiResearchImage>(response);
    return transformImage(data);
  },

  async delete(id: string): Promise<void> {
    const response = await apiFetch(`${API_BASE_URL}/images/${id}/`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new ApiError(response.status, 'Failed to delete image');
    }
  },

  async toggleVisibility(id: string): Promise<{ is_hidden: boolean }> {
    const response = await apiFetch(`${API_BASE_URL}/images/${id}/visibility/`, {
      method: 'PATCH',
    });
    return handleResponse(response);
  },
};

// =============================================================================
// Annotations API
// =============================================================================

export const annotationsApi = {
  async submit(data: {
    id: string;
    image_href: string;
    text_content: string;
    annotations: unknown[];
  }): Promise<{ message: string; session_id: string; created_count: number; total_count: number }> {
    const response = await apiFetch(`${API_BASE_URL}/annotations/submit/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// =============================================================================
// Report API (Admin only)
// =============================================================================

// API response types
interface ApiAnnotation {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  text: string;
  sessionId: string;
  createdAt: string;
}

interface ApiReportData {
  uniqueId: string;
  imageName: string;
  question: string;
  imageUrl: string;
  annotations: ApiAnnotation[];
}

// Frontend report types
export interface ReportAnnotation {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  text: string;
  timestamp: string;
  sessionId: string;
}

export interface ReportData {
  uniqueId: string;
  imageHref: string;
  textContent: string;
  imageName: string;
  annotations: ReportAnnotation[];
  submittedAt: string;
}

// Report API
export const reportApi = {
  async getReportData(imageId: string): Promise<ReportData> {
    const response = await apiFetch(`${API_BASE_URL}/report/${imageId}/`);
    const data = await handleResponse<ApiReportData>(response);
    
    // Transform to frontend format
    const annotations: ReportAnnotation[] = data.annotations.map(ann => ({
      id: ann.id,
      left: ann.left,
      top: ann.top,
      width: ann.width,
      height: ann.height,
      text: ann.text,
      timestamp: ann.createdAt,
      sessionId: ann.sessionId,
    }));

    // Get the latest annotation timestamp as submittedAt
    const latestTimestamp = annotations.length > 0
      ? annotations.reduce((latest, ann) => 
          ann.timestamp > latest ? ann.timestamp : latest, annotations[0].timestamp)
      : new Date().toISOString();

    return {
      uniqueId: data.uniqueId,
      imageHref: data.imageUrl,
      textContent: data.question,
      imageName: data.imageName,
      annotations,
      submittedAt: latestTimestamp,
    };
  },
};
