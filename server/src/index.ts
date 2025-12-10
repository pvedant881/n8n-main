import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
  const allowedExtensions = ['.csv', '.docx', '.txt'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV, DOCX, and TXT files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Store file metadata
interface FileMetadata {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  uploadDate: string;
  mimetype: string;
}

const fileDatabase: FileMetadata[] = [];

// Middleware
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded files
app.use('/uploads', express.static(uploadsDir));

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to the API',
    version: '1.0.0',
  });
});

// File upload endpoint
app.post('/api/upload', upload.array('files', 10), (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles: FileMetadata[] = req.files.map((file: Express.Multer.File) => {
      const metadata: FileMetadata = {
        id: uuidv4(),
        originalName: file.originalname,
        filename: file.filename,
        size: file.size,
        uploadDate: new Date().toISOString(),
        mimetype: file.mimetype,
      };
      
      fileDatabase.push(metadata);
      return metadata;
    });

    res.status(200).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Get file list endpoint
app.get('/api/files', (req: Request, res: Response) => {
  try {
    res.status(200).json({
      files: fileDatabase.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()),
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to retrieve files' });
  }
});

// Delete file endpoint
app.delete('/api/files/:id', (req: Request, res: Response) => {
  try {
    const fileId = req.params.id;
    const fileIndex = fileDatabase.findIndex(file => file.id === fileId);
    
    if (fileIndex === -1) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = fileDatabase[fileIndex];
    const filePath = path.join(uploadsDir, file.filename);
    
    // Delete physical file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Remove from database
    fileDatabase.splice(fileIndex, 1);
    
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Read file content helper
const readFileContent = async (filename: string): Promise<string> => {
  const filePath = path.join(uploadsDir, filename);
  const extension = path.extname(filename).toLowerCase();
  
  try {
    if (extension === '.txt' || extension === '.csv') {
      return fs.readFileSync(filePath, 'utf-8');
    } else if (extension === '.docx') {
      // For DOCX files, we'll just return a placeholder since we don't have docx parser
      return `[DOCX file: ${filename} - Content parsing not implemented in this demo]`;
    }
    return '';
  } catch (error) {
    console.error('Error reading file:', error);
    return '';
  }
};

// Chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, files } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    let context = '';
    
    // Add file contents to context if files are provided
    if (files && Array.isArray(files) && files.length > 0) {
      const fileContents = await Promise.all(
        files.map(async (fileId: string) => {
          const file = fileDatabase.find(f => f.id === fileId);
          if (file) {
            const content = await readFileContent(file.filename);
            return `File: ${file.originalName}\nContent:\n${content}\n`;
          }
          return '';
        })
      );
      
      context = fileContents.filter(content => content.length > 0).join('\n\n');
    }

    // Prepare the conversation
    const messages = [
      {
        role: 'system' as const,
        content: `You are a helpful assistant. You have access to uploaded files and can answer questions about them. When relevant, reference the uploaded content in your responses.${context ? `\n\nUploaded files context:\n${context}` : ''}`,
      },
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.';

    res.status(200).json({
      message: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat error:', error);
    
    // Handle OpenAI API errors gracefully
    if (error instanceof Error && error.message.includes('OpenAI API')) {
      return res.status(500).json({ 
        error: 'Chat service temporarily unavailable. Please check if OpenAI API key is configured.',
        message: 'I apologize, but the chat service is currently unavailable. Please try again later.'
      });
    }
    
    res.status(500).json({ 
      error: 'Chat request failed',
      message: 'I apologize, but I encountered an error processing your request.'
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`CORS enabled for ${clientUrl}`);
});