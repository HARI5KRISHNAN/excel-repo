import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api/sheets/';

export interface CommentData {
  id?: number;
  row: number;
  col: number;
  content: string;
  author?: string;
  resolved?: boolean;
  createdAt?: string;
}

class CommentService {
  private getConfig() {
    return {
      headers: authService.getAuthHeader()
    };
  }

  async getComments(sheetId: number): Promise<CommentData[]> {
    const response = await axios.get(`${API_URL}${sheetId}/comments`, this.getConfig());
    return response.data;
  }

  async addComment(sheetId: number, row: number, col: number, content: string): Promise<CommentData> {
    const response = await axios.post(
      `${API_URL}${sheetId}/comments`,
      { row, col, content },
      this.getConfig()
    );
    return response.data;
  }

  async resolveComment(sheetId: number, commentId: number): Promise<void> {
    await axios.put(
      `${API_URL}${sheetId}/comments/${commentId}/resolve`,
      {},
      this.getConfig()
    );
  }

  async deleteComment(sheetId: number, commentId: number): Promise<void> {
    await axios.delete(
      `${API_URL}${sheetId}/comments/${commentId}`,
      this.getConfig()
    );
  }
}

export default new CommentService();
