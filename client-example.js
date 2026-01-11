// Example client-side API integration for Mezmo Backend

const API_BASE_URL = 'https://your-app.railway.app/api';

class MezmoClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('mezmo_token');
  }

  // Helper method for making requests
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }

    return data;
  }

  // Authentication methods
  async register(email, password, name) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
      skipAuth: true,
    });
    
    this.token = data.token;
    localStorage.setItem('mezmo_token', data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
    
    this.token = data.token;
    localStorage.setItem('mezmo_token', data.token);
    return data;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('mezmo_token');
  }

  // User methods
  async getProfile() {
    return await this.request('/users/me');
  }

  async updateProfile(name) {
    return await this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  // Data methods
  async getAllData() {
    return await this.request('/data');
  }

  async getDataItem(id) {
    return await this.request(`/data/${id}`);
  }

  async createData(title, content) {
    return await this.request('/data', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    });
  }

  async updateData(id, title, content) {
    return await this.request(`/data/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, content }),
    });
  }

  async deleteData(id) {
    return await this.request(`/data/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export for use
export default MezmoClient;

// Usage example:
/*
const client = new MezmoClient('https://your-app.railway.app/api');

// Register
await client.register('user@example.com', 'password123', 'John Doe');

// Login
await client.login('user@example.com', 'password123');

// Get profile
const profile = await client.getProfile();

// Create data
await client.createData('My Title', 'My content');

// Get all data
const items = await client.getAllData();

// Logout
client.logout();
*/
