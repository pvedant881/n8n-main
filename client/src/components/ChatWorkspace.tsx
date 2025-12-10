import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Paperclip, X } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatWorkspaceProps {
  messages: Message[];
  onSendMessage: (message: string, selectedFiles: string[]) => void;
  isLoading: boolean;
  availableFiles: { id: string; originalName: string }[];
}

const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  availableFiles
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage, selectedFiles);
      setInputMessage('');
      setSelectedFiles([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const removeFileSelection = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Bot className="h-5 w-5 mr-2 text-blue-600" />
          AI Chat Assistant
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Ask questions about your uploaded files
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="mx-auto h-12 w-12 text-gray-400" />
            <h4 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h4>
            <p className="mt-1 text-sm text-gray-500">
              Start a conversation by asking a question about your files
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-xs lg:max-w-md xl:max-w-lg ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                } items-start space-x-2`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`}
                  >
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="px-4 py-2 bg-gray-100 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <div className="px-6 py-2 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((fileId) => {
              const file = availableFiles.find(f => f.id === fileId);
              if (!file) return null;
              return (
                <div
                  key={fileId}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  <Paperclip className="h-3 w-3 mr-1" />
                  {file.originalName}
                  <button
                    onClick={() => removeFileSelection(fileId)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your files..."
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 pr-12 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
              disabled={isLoading}
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFileSelector(!showFileSelector)}
              className={`p-2 rounded-lg border transition-colors ${
                showFileSelector
                  ? 'border-blue-500 bg-blue-50 text-blue-600'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
              title="Attach files"
              disabled={isLoading || availableFiles.length === 0}
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* File Selector Dropdown */}
        {showFileSelector && availableFiles.length > 0 && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Select files to reference:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {availableFiles.map((file) => (
                <label key={file.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => toggleFileSelection(file.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{file.originalName}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWorkspace;