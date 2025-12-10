import React from 'react';
import { Trash2, File, Calendar, HardDrive } from 'lucide-react';

interface FileMetadata {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  uploadDate: string;
  mimetype: string;
}

interface FileListProps {
  files: FileMetadata[];
  onDelete: (fileId: string) => void;
  isDeleting: boolean;
}

const FileList: React.FC<FileListProps> = ({ files, onDelete, isDeleting }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (mimetype: string, originalName: string) => {
    const extension = originalName.split('.').pop()?.toLowerCase();
    
    if (mimetype === 'text/csv' || extension === 'csv') {
      return '📊';
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension === 'docx') {
      return '📄';
    } else if (mimetype === 'text/plain' || extension === 'txt') {
      return '📝';
    }
    return '📁';
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <File className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">No files uploaded yet</p>
        <p className="text-xs text-gray-400">Upload some files to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Uploaded Files ({files.length})
        </h3>
      </div>
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {files.map((file) => (
          <div key={file.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-2xl">{getFileIcon(file.mimetype, file.originalName)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.originalName}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-xs text-gray-500">
                      <HardDrive className="h-3 w-3 mr-1" />
                      {formatFileSize(file.size)}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(file.uploadDate)}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onDelete(file.id)}
                disabled={isDeleting}
                className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete file"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;