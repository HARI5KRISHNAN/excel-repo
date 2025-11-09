import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axios.post(API_URL + 'login', credentials);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  async signup(data: SignupData): Promise<{ message: string }> {
    const response = await axios.post(API_URL + 'signup', data);
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('user');
  }

  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  getAuthHeader(): { Authorization: string } | {} {
    const user = this.getCurrentUser();
    if (user && user.token) {
      return { Authorization: 'Bearer ' + user.token };
    }
    return {};
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  async checkAuth(): Promise<boolean> {
    try {
      const user = this.getCurrentUser();
      if (!user || !user.token) {
        return false;
      }
      // Verify token is still valid by making a request to /me
      const response = await axios.get(API_URL + 'me', {
        headers: this.getAuthHeader()
      });
      return response.status === 200;
    } catch (error) {
      this.logout();
      return false;
    }
  }
}

export default new AuthService();
