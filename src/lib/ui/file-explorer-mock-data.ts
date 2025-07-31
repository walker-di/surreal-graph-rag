/**
 * Mock data service for file explorer
 * Provides placeholder file system data for UI development
 */

import type {
  FileSystemFile,
  FileSystemFolder,
  FileSystemItem,
} from "./file-explorer-types.js";

export const mockFileSystem: FileSystemItem[] = [
  {
    id: "root",
    name: "Documents",
    type: "folder",
    path: "/Documents",
    dateModified: new Date("2024-01-15"),
    dateCreated: new Date("2024-01-01"),
    children: [
      {
        id: "projects",
        name: "Projects",
        type: "folder",
        path: "/Documents/Projects",
        parentId: "root",
        dateModified: new Date("2024-01-20"),
        dateCreated: new Date("2024-01-05"),
        children: [
          {
            id: "project1",
            name: "surreal-rag",
            type: "folder",
            path: "/Documents/Projects/surreal-rag",
            parentId: "projects",
            dateModified: new Date("2024-01-25"),
            dateCreated: new Date("2024-01-10"),
          } as FileSystemFolder,
          {
            id: "readme",
            name: "README.md",
            type: "file",
            path: "/Documents/Projects/README.md",
            parentId: "projects",
            size: 2048,
            extension: "md",
            mimeType: "text/markdown",
            dateModified: new Date("2024-01-22"),
            dateCreated: new Date("2024-01-15"),
          } as FileSystemFile,
        ],
      } as FileSystemFolder,
      {
        id: "images",
        name: "Images",
        type: "folder",
        path: "/Documents/Images",
        parentId: "root",
        dateModified: new Date("2024-01-18"),
        dateCreated: new Date("2024-01-03"),
        children: [
          {
            id: "photo1",
            name: "vacation.jpg",
            type: "file",
            path: "/Documents/Images/vacation.jpg",
            parentId: "images",
            size: 1024000,
            extension: "jpg",
            mimeType: "image/jpeg",
            dateModified: new Date("2024-01-16"),
            dateCreated: new Date("2024-01-16"),
          } as FileSystemFile,
        ],
      } as FileSystemFolder,
      {
        id: "notes",
        name: "notes.txt",
        type: "file",
        path: "/Documents/notes.txt",
        parentId: "root",
        size: 512,
        extension: "txt",
        mimeType: "text/plain",
        dateModified: new Date("2024-01-14"),
        dateCreated: new Date("2024-01-12"),
      } as FileSystemFile,
    ],
  } as FileSystemFolder,
];

export function getFileSystemItems(path: string = "/"): FileSystemItem[] {
  // Placeholder function to simulate file system navigation

  // Root level - show the Documents folder
  if (path === "/") {
    return mockFileSystem;
  }

  // Documents level - show its contents (Projects, Images, notes.txt)
  if (path === "/Documents") {
    const documentsFolder = mockFileSystem[0] as FileSystemFolder;
    return documentsFolder.children || [];
  }

  // Find items in the specified path
  const findItemsInPath = (
    items: FileSystemItem[],
    targetPath: string,
  ): FileSystemItem[] => {
    for (const item of items) {
      if (item.path === targetPath && item.type === "folder") {
        return (item as FileSystemFolder).children || [];
      }
      if (item.type === "folder" && (item as FileSystemFolder).children) {
        const found = findItemsInPath(
          (item as FileSystemFolder).children!,
          targetPath,
        );
        if (found.length > 0) return found;
      }
    }
    return [];
  };

  return findItemsInPath(mockFileSystem, path);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileIcon(item: FileSystemItem): string {
  if (item.type === "folder") return "📁";

  const file = item as FileSystemFile;
  switch (file.extension) {
    case "txt":
      return "📄";
    case "md":
      return "📝";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "🖼️";
    case "pdf":
      return "📕";
    case "js":
    case "ts":
      return "📜";
    default:
      return "📄";
  }
}
