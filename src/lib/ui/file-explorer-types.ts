/**
 * File Explorer Types
 * Placeholder interfaces for file system representation
 */

export interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  parentId?: string;
  size?: number;
  dateModified: Date;
  dateCreated: Date;
  extension?: string;
  isHidden?: boolean;
}

export interface FileSystemFolder extends FileSystemItem {
  type: "folder";
  children?: FileSystemItem[];
  isExpanded?: boolean;
  childCount?: number;
}

export interface FileSystemFile extends FileSystemItem {
  type: "file";
  mimeType?: string;
  content?: string;
  thumbnail?: string;
}

export interface FileExplorerState {
  currentPath: string;
  selectedItems: string[];
  viewMode: "list" | "grid";
  sortBy: "name" | "size" | "dateModified" | "type";
  sortOrder: "asc" | "desc";
  showHidden: boolean;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface FilePreview {
  type: "text" | "image" | "pdf" | "unknown";
  content?: string;
  metadata?: Record<string, any>;
}
