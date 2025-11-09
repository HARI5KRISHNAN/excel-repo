import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api/sheets/';

export interface PermissionData {
  id: number;
  username: string;
  email: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  grantedAt: string;
}

export interface ChangeLogEntry {
  id: number;
  action: string;
  row?: number;
  col?: number;
  oldValue?: string;
  newValue?: string;
  username: string;
  timestamp: string;
}

class CollaborationService {
  private getConfig() {
    return {
      headers: authService.getAuthHeader()
    };
  }

  // Permissions
  async getPermissions(sheetId: number): Promise<PermissionData[]> {
    const response = await axios.get(`${API_URL}${sheetId}/permissions`, this.getConfig());
    return response.data;
  }

  async grantPermission(sheetId: number, username: string, role: string): Promise<void> {
    await axios.post(
      `${API_URL}${sheetId}/permissions`,
      { username, role },
      this.getConfig()
    );
  }

  async revokePermission(sheetId: number, permissionId: number): Promise<void> {
    await axios.delete(
      `${API_URL}${sheetId}/permissions/${permissionId}`,
      this.getConfig()
    );
  }

  // Change Log
  async getChangeLog(sheetId: number, page: number = 0, size: number = 50): Promise<{
    logs: ChangeLogEntry[];
    totalPages: number;
    totalElements: number;
  }> {
    const response = await axios.get(
      `${API_URL}${sheetId}/changelog?page=${page}&size=${size}`,
      this.getConfig()
    );
    return response.data;
  }
}

export default new CollaborationService();
