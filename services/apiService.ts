import axios from 'axios';
import authService from './authService';
import { SheetData, Merge } from '../types';

const API_URL = 'http://localhost:8080/api/sheets/';

export interface SheetSaveRequest {
  name: string;
  data: string; // JSON stringified SheetData
  merges?: string; // JSON stringified Merge[]
}

export interface SheetResponse {
  id: number;
  name: string;
  data: string; // JSON stringified SheetData
  merges?: string; // JSON stringified Merge[]
  lastSavedAt: string;
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private getConfig() {
    return {
      headers: authService.getAuthHeader()
    };
  }

  async saveSheet(name: string, data: SheetData, merges: Merge[]): Promise<SheetResponse> {
    const request: SheetSaveRequest = {
      name,
      data: JSON.stringify(data),
      merges: JSON.stringify(merges)
    };

    const response = await axios.post(API_URL + 'save', request, this.getConfig());
    return response.data;
  }

  async updateSheet(id: number, name: string, data: SheetData, merges: Merge[]): Promise<SheetResponse> {
    const request: SheetSaveRequest = {
      name,
      data: JSON.stringify(data),
      merges: JSON.stringify(merges)
    };

    const response = await axios.put(API_URL + id, request, this.getConfig());
    return response.data;
  }

  async loadAllSheets(): Promise<SheetResponse[]> {
    const response = await axios.get(API_URL + 'load', this.getConfig());
    return response.data;
  }

  async loadSheet(id: number): Promise<SheetResponse> {
    const response = await axios.get(API_URL + id, this.getConfig());
    return response.data;
  }

  async deleteSheet(id: number): Promise<{ message: string }> {
    const response = await axios.delete(API_URL + id, this.getConfig());
    return response.data;
  }

  parseSheetData(dataString: string): SheetData {
    return JSON.parse(dataString);
  }

  parseMerges(mergesString?: string): Merge[] {
    if (!mergesString) return [];
    return JSON.parse(mergesString);
  }
}

export default new ApiService();
