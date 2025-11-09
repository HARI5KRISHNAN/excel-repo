import { SheetData, Merge } from '../types';

export interface Version {
  id: string;
  timestamp: number;
  data: SheetData;
  merges: Merge[];
  description?: string;
  auto?: boolean; // Auto-saved version
}

const MAX_VERSIONS = 20; // Keep last 20 versions
const AUTO_SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes
const STORAGE_KEY = 'darevel-version-history';

/**
 * Version History Manager
 */
export class VersionHistoryManager {
  private versions: Version[] = [];
  private lastAutoSave: number = 0;

  constructor() {
    this.loadVersions();
  }

  /**
   * Load versions from localStorage
   */
  private loadVersions(): void {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.versions = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load version history:', error);
      this.versions = [];
    }
  }

  /**
   * Save versions to localStorage
   */
  private saveVersions(): void {
    try {
      // Keep only the latest MAX_VERSIONS
      if (this.versions.length > MAX_VERSIONS) {
        this.versions = this.versions.slice(-MAX_VERSIONS);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.versions));
    } catch (error) {
      console.error('Failed to save version history:', error);
    }
  }

  /**
   * Create a new version
   */
  createVersion(data: SheetData, merges: Merge[], description?: string, auto: boolean = false): Version {
    const version: Version = {
      id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      data: JSON.parse(JSON.stringify(data)), // Deep clone
      merges: JSON.parse(JSON.stringify(merges)), // Deep clone
      description,
      auto
    };

    this.versions.push(version);
    this.saveVersions();

    return version;
  }

  /**
   * Auto-save version if enough time has passed
   */
  autoSave(data: SheetData, merges: Merge[]): Version | null {
    const now = Date.now();
    if (now - this.lastAutoSave >= AUTO_SAVE_INTERVAL) {
      this.lastAutoSave = now;
      return this.createVersion(data, merges, 'Auto-save', true);
    }
    return null;
  }

  /**
   * Get all versions
   */
  getVersions(): Version[] {
    return [...this.versions].reverse(); // Most recent first
  }

  /**
   * Get a specific version
   */
  getVersion(id: string): Version | undefined {
    return this.versions.find(v => v.id === id);
  }

  /**
   * Delete a version
   */
  deleteVersion(id: string): boolean {
    const index = this.versions.findIndex(v => v.id === id);
    if (index !== -1) {
      this.versions.splice(index, 1);
      this.saveVersions();
      return true;
    }
    return false;
  }

  /**
   * Clear all versions
   */
  clearAll(): void {
    this.versions = [];
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Get version count
   */
  getCount(): number {
    return this.versions.length;
  }

  /**
   * Get auto-save versions only
   */
  getAutoSaveVersions(): Version[] {
    return this.versions.filter(v => v.auto).reverse();
  }

  /**
   * Get manual save versions only
   */
  getManualSaveVersions(): Version[] {
    return this.versions.filter(v => !v.auto).reverse();
  }
}

// Singleton instance
export const versionHistory = new VersionHistoryManager();
