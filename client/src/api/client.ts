const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface RequestConfig extends RequestInit {
  headers?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private async request(endpoint: string, config: RequestConfig = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(config.headers || {}),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...config,
      headers,
    });

    return response;
  }

  async get(endpoint: string, config?: RequestConfig) {
    const response = await this.request(endpoint, {
      ...config,
      method: 'GET',
    });
    return this.handleResponse(response);
  }

  async post(endpoint: string, body?: Record<string, unknown>, config?: RequestConfig) {
    const response = await this.request(endpoint, {
      ...config,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse(response);
  }

  async put(endpoint: string, body?: Record<string, unknown>, config?: RequestConfig) {
    const response = await this.request(endpoint, {
      ...config,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse(response);
  }

  async delete(endpoint: string, config?: RequestConfig) {
    const response = await this.request(endpoint, {
      ...config,
      method: 'DELETE',
    });
    return this.handleResponse(response);
  }

  private async handleResponse(response: Response) {
    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        data,
      };
    }

    return data;
  }
}

export const apiClient = new ApiClient(API_URL);
