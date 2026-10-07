import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Data file paths
const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
const GALLERY_UPLOADS_DIR = path.resolve(UPLOADS_DIR, 'gallery');
const HERO_UPLOADS_DIR = path.resolve(UPLOADS_DIR, 'hero');
const VIDEOS_UPLOADS_DIR = path.resolve(UPLOADS_DIR, 'videos');
const THUMBNAILS_UPLOADS_DIR = path.resolve(UPLOADS_DIR, 'thumbnails');

// Ensure directories exist
[DATA_DIR, UPLOADS_DIR, GALLERY_UPLOADS_DIR, HERO_UPLOADS_DIR, VIDEOS_UPLOADS_DIR, THUMBNAILS_UPLOADS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const SCHOOL_DATA_PATH = path.resolve(DATA_DIR, 'school-data.json');
const GALLERY_PATH = path.resolve(DATA_DIR, 'gallery.json');
const VIDEOS_PATH = path.resolve(DATA_DIR, 'videos.json');
const APPLICATIONS_PATH = path.resolve(DATA_DIR, 'applications.json');
const MESSAGES_PATH = path.resolve(DATA_DIR, 'messages.json');
const SESSIONS_PATH = path.resolve(DATA_DIR, 'sessions.json');

// Helper to safely read JSON
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

// Helper to safely write JSON
function writeJsonFile<T>(filePath: string, data: T): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Body parsing
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve public directory and uploads statically
const PUBLIC_DIR = path.resolve(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));
app.use('/assets', express.static(path.resolve(PUBLIC_DIR, 'assets')));
app.use('/uploads', express.static(UPLOADS_DIR));

// Prevent caching on dynamic API routes so updates are immediately reflected
app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Persistent session tokens stored in sessions.json so server restarts don't invalidate admin login
function getValidTokens(): Set<string> {
  const list = readJsonFile<string[]>(SESSIONS_PATH, []);
  return new Set(list);
}

function addSessionToken(token: string) {
  const tokens = getValidTokens();
  tokens.add(token);
  writeJsonFile(SESSIONS_PATH, Array.from(tokens));
}

function removeSessionToken(token: string) {
  const tokens = getValidTokens();
  tokens.delete(token);
  writeJsonFile(SESSIONS_PATH, Array.from(tokens));
}

function isSessionValid(token: string): boolean {
  if (!token) return false;
  return getValidTokens().has(token);
}

// Multer storage for gallery images
const galleryStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, GALLERY_UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `gallery-${uniqueSuffix}${ext}`);
  },
});

const heroStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, HERO_UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}`;
    cb(null, `hero-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WEBP, and GIF images are allowed'));
  }
};

const uploadGallery = multer({
  storage: galleryStorage,
  fileFilter,
  limits: { fileSize: 12 * 1024 * 1024 }, // 12MB limit
});

const uploadHero = multer({
  storage: heroStorage,
  fileFilter,
  limits: { fileSize: 12 * 1024 * 1024 },
});

// Video Upload Configuration (Max 60 MB strict limit)
const MAX_VIDEO_SIZE = 60 * 1024 * 1024; // 60 MB

const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, VIDEOS_UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `raw-video-${uniqueSuffix}${ext}`);
  },
});

const videoFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-matroska',
    'video/3gpp',
    'video/ogg',
    'video/x-msvideo',
  ];
  if (
    allowedTypes.includes(file.mimetype) ||
    file.originalname.match(/\.(mp4|webm|mov|mkv|3gp|ogg|avi)$/i)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid video format. Supported formats: MP4, WebM, MOV, MKV, 3GP.'));
  }
};

const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: MAX_VIDEO_SIZE },
});

// Video compression helper maintaining 80-90% visual quality and saving storage
async function compressVideoWithFfmpeg(
  inputPath: string,
  outputPath: string,
  thumbnailPath: string
): Promise<{ compressed: boolean; originalSize: number; compressedSize: number }> {
  const stats = fs.statSync(inputPath);
  const originalSize = stats.size;

  try {
    // Check if ffmpeg binary exists
    await execPromise('which ffmpeg');

    // Run ffmpeg compression:
    // CRF 23 provides 85-90% visual quality retention
    // -vf "scale='min(1280,iw)':-2" downscales 4k/oversized phone videos to 720p/1080p maintaining aspect ratio
    // -movflags +faststart enables progressive streaming on web browsers
    const cmd = `ffmpeg -y -i "${inputPath}" -vcodec libx264 -crf 23 -preset fast -vf "scale='min(1280,iw)':-2" -acodec aac -b:a 128k -movflags +faststart "${outputPath}"`;
    await execPromise(cmd);

    // Generate snapshot thumbnail at 1s mark
    try {
      const thumbCmd = `ffmpeg -y -ss 00:00:01 -i "${outputPath}" -vframes 1 -q:v 2 "${thumbnailPath}"`;
      await execPromise(thumbCmd);
    } catch (thumbErr) {
      console.warn('Thumbnail generation skipped:', thumbErr);
    }

    const compressedStats = fs.statSync(outputPath);
    // Delete raw uncompressed file to save space
    try {
      fs.unlinkSync(inputPath);
    } catch {}

    return {
      compressed: true,
      originalSize,
      compressedSize: compressedStats.size,
    };
  } catch (err) {
    console.warn('FFmpeg compression failed or not available, retaining original video:', err);
    // Fallback: move raw file to output path
    if (!fs.existsSync(outputPath) && fs.existsSync(inputPath)) {
      fs.copyFileSync(inputPath, outputPath);
      try {
        fs.unlinkSync(inputPath);
      } catch {}
    }
    return {
      compressed: false,
      originalSize,
      compressedSize: originalSize,
    };
  }
}

// Auth Middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    return;
  }
  const token = authHeader.split(' ')[1];
  if (!isSessionValid(token)) {
    res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
    return;
  }
  next();
}

// ----------------- API ROUTES -----------------

// Admin Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password) {
    res.status(400).json({ error: 'Password is required' });
    return;
  }

  const schoolData = readJsonFile<any>(SCHOOL_DATA_PATH, {});
  const storedPassword = schoolData?.general?.adminPasswordHash || 'ADMIN-2026';

  if (password === storedPassword) {
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    addSessionToken(token);
    res.json({ success: true, token, message: 'Authenticated successfully' });
  } else {
    res.status(401).json({ error: 'Incorrect administrator password' });
  }
});

// Admin Verify Token
app.get('/api/auth/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (isSessionValid(token)) {
      res.json({ valid: true });
      return;
    }
  }
  res.json({ valid: false });
});

// Admin Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    removeSessionToken(token);
  }
  res.json({ success: true });
});

// Change Password
app.post('/api/auth/change-password', requireAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters' });
    return;
  }

  const schoolData = readJsonFile<any>(SCHOOL_DATA_PATH, {});
  const storedPassword = schoolData?.general?.adminPasswordHash || 'ADMIN-2026';

  if (currentPassword !== storedPassword) {
    res.status(400).json({ error: 'Current password does not match' });
    return;
  }

  schoolData.general.adminPasswordHash = newPassword;
  writeJsonFile(SCHOOL_DATA_PATH, schoolData);
  res.json({ success: true, message: 'Password updated successfully' });
});

// Get School Content (Public)
app.get('/api/content', (_req: Request, res: Response) => {
  const data = readJsonFile<any>(SCHOOL_DATA_PATH, {});
  // Exclude adminPasswordHash from public response
  const sanitized = { ...data };
  if (sanitized.general) {
    const { adminPasswordHash, ...generalWithoutPassword } = sanitized.general;
    sanitized.general = generalWithoutPassword;
  }
  res.json(sanitized);
});

// Update School Content (Admin)
app.put('/api/content', requireAuth, (req: Request, res: Response) => {
  const incoming = req.body;
  const current = readJsonFile<any>(SCHOOL_DATA_PATH, {});

  // Preserve existing password if not explicitly modified
  const currentPassword = current?.general?.adminPasswordHash || 'ADMIN-2026';
  if (incoming.general) {
    incoming.general.adminPasswordHash = currentPassword;
  }

  const saved = writeJsonFile(SCHOOL_DATA_PATH, incoming);
  if (saved) {
    res.json({ success: true, message: 'Content updated successfully' });
  } else {
    res.status(500).json({ error: 'Failed to write content to storage' });
  }
});

// Facility Image Upload (Admin)
app.post('/api/upload/facility', requireAuth, uploadGallery.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file uploaded' });
    return;
  }
  res.json({
    success: true,
    imageUrl: `/uploads/gallery/${req.file.filename}`,
    filename: req.file.filename,
  });
});

// Facilities Management (Admin)
app.post('/api/facilities', requireAuth, (req: Request, res: Response) => {
  const { name, category, description, imageUrl } = req.body;
  if (!name || !name.trim()) {
    res.status(400).json({ error: 'Facility name is required' });
    return;
  }

  const data = readJsonFile<any>(SCHOOL_DATA_PATH, {});
  if (!data.facilities) {
    data.facilities = [];
  }

  const newFacility = {
    name: name.trim(),
    category: category?.trim() || 'General School',
    description: description?.trim() || '',
    imageUrl: imageUrl || '',
  };

  data.facilities.push(newFacility);
  writeJsonFile(SCHOOL_DATA_PATH, data);
  res.status(201).json({ success: true, facility: newFacility, facilities: data.facilities });
});

app.put('/api/facilities/:index', requireAuth, (req: Request, res: Response) => {
  const index = parseInt(req.params.index, 10);
  const { name, category, description, imageUrl } = req.body;

  const data = readJsonFile<any>(SCHOOL_DATA_PATH, {});
  if (!data.facilities || index < 0 || index >= data.facilities.length) {
    res.status(404).json({ error: 'Facility not found' });
    return;
  }

  data.facilities[index] = {
    name: name?.trim() || data.facilities[index].name,
    category: category?.trim() || data.facilities[index].category,
    description: description !== undefined ? description.trim() : data.facilities[index].description,
    imageUrl: imageUrl !== undefined ? imageUrl : data.facilities[index].imageUrl,
  };

  writeJsonFile(SCHOOL_DATA_PATH, data);
  res.json({ success: true, facility: data.facilities[index], facilities: data.facilities });
});

app.delete('/api/facilities/:index', requireAuth, (req: Request, res: Response) => {
  const index = parseInt(req.params.index, 10);
  const data = readJsonFile<any>(SCHOOL_DATA_PATH, {});

  if (!data.facilities || index < 0 || index >= data.facilities.length) {
    res.status(404).json({ error: 'Facility not found' });
    return;
  }

  const removed = data.facilities.splice(index, 1);
  writeJsonFile(SCHOOL_DATA_PATH, data);
  res.json({ success: true, removed: removed[0], facilities: data.facilities });
});

// Gallery: Get All Items
app.get('/api/gallery', (req: Request, res: Response) => {
  const allItems = readJsonFile<any[]>(GALLERY_PATH, []);
  const authHeader = req.headers.authorization;
  const isAdmin = authHeader && isSessionValid(authHeader.replace('Bearer ', ''));

  if (isAdmin) {
    res.json(allItems);
  } else {
    // Only return published items for public
    res.json(allItems.filter((item) => item.published !== false));
  }
});

// Gallery: Upload Image (Admin)
app.post('/api/gallery', requireAuth, uploadGallery.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image file uploaded' });
    return;
  }

  const { title, description, category, published } = req.body;
  const items = readJsonFile<any[]>(GALLERY_PATH, []);

  const newItem = {
    id: `gal_${Date.now()}`,
    title: title?.trim() || 'School Photograph',
    description: description?.trim() || '',
    category: category || 'School Life',
    imageUrl: `/uploads/gallery/${req.file.filename}`,
    filename: req.file.filename,
    published: published === 'true' || published === true,
    createdAt: new Date().toISOString(),
  };

  items.unshift(newItem);
  writeJsonFile(GALLERY_PATH, items);
  res.status(201).json(newItem);
});

// Gallery: Toggle Published (Admin)
app.patch('/api/gallery/:id/toggle', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const items = readJsonFile<any[]>(GALLERY_PATH, []);
  const item = items.find((i) => i.id === id);

  if (!item) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  item.published = !item.published;
  writeJsonFile(GALLERY_PATH, items);
  res.json(item);
});

// Gallery: Delete Image (Admin)
app.delete('/api/gallery/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  let items = readJsonFile<any[]>(GALLERY_PATH, []);
  const item = items.find((i) => i.id === id);

  if (!item) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  if (item.filename) {
    const filePath = path.resolve(GALLERY_UPLOADS_DIR, item.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
  }

  items = items.filter((i) => i.id !== id);
  writeJsonFile(GALLERY_PATH, items);
  res.json({ success: true, message: 'Gallery item deleted' });
});

// Videos: Get All
app.get('/api/videos', (req: Request, res: Response) => {
  const allVideos = readJsonFile<any[]>(VIDEOS_PATH, []);
  const authHeader = req.headers.authorization;
  const isAdmin = authHeader && isSessionValid(authHeader.replace('Bearer ', ''));

  if (isAdmin) {
    res.json(allVideos);
  } else {
    res.json(allVideos.filter((v) => v.published !== false));
  }
});

// Videos: Add Video (Admin)
app.post('/api/videos', requireAuth, (req: Request, res: Response) => {
  const { title, url, description, thumbnail, published } = req.body;
  if (!title || !url) {
    res.status(400).json({ error: 'Title and URL are required' });
    return;
  }

  const videos = readJsonFile<any[]>(VIDEOS_PATH, []);
  const newVideo = {
    id: `vid_${Date.now()}`,
    title: title.trim(),
    url: url.trim(),
    description: description?.trim() || '',
    thumbnail: thumbnail?.trim() || '',
    published: published !== false,
    createdAt: new Date().toISOString(),
  };

  videos.unshift(newVideo);
  writeJsonFile(VIDEOS_PATH, videos);
  res.status(201).json(newVideo);
});

// Videos: Toggle Published (Admin)
app.patch('/api/videos/:id/toggle', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const videos = readJsonFile<any[]>(VIDEOS_PATH, []);
  const video = videos.find((v) => v.id === id);

  if (!video) {
    res.status(404).json({ error: 'Video not found' });
    return;
  }

  video.published = !video.published;
  writeJsonFile(VIDEOS_PATH, videos);
  res.json(video);
});

// Videos: Delete (Admin)
app.delete('/api/videos/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  let videos = readJsonFile<any[]>(VIDEOS_PATH, []);
  const exists = videos.some((v) => v.id === id);

  if (!exists) {
    res.status(404).json({ error: 'Video not found' });
    return;
  }

  videos = videos.filter((v) => v.id !== id);
  writeJsonFile(VIDEOS_PATH, videos);
  res.json({ success: true, message: 'Video deleted' });
});

// Videos: Upload Video File with 60MB limit and 80-90% quality compression (Admin)
app.post(
  '/api/upload/video',
  requireAuth,
  (req: Request, res: Response, next: NextFunction) => {
    uploadVideo.single('video')(req, res, (err) => {
      if (err) {
        if (
          err.code === 'LIMIT_FILE_SIZE' ||
          (err.message && err.message.toLowerCase().includes('large'))
        ) {
          return res.status(400).json({
            error:
              'Video file exceeds the 60 MB limit. Videos larger than 60 MB cannot be uploaded. The system has rejected this file.',
          });
        }
        return res.status(400).json({ error: err.message || 'Video upload error' });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ error: 'No video file selected' });
      return;
    }

    const title = req.body.title || path.parse(req.file.originalname).name;
    const description = req.body.description || '';
    const published = req.body.published !== 'false' && req.body.published !== false;

    const rawPath = req.file.path;
    const compressedFilename = `video-${Date.now()}-${Math.round(Math.random() * 1e6)}.mp4`;
    const compressedPath = path.resolve(VIDEOS_UPLOADS_DIR, compressedFilename);
    const thumbnailFilename = `thumb-${Date.now()}.jpg`;
    const thumbnailPath = path.resolve(THUMBNAILS_UPLOADS_DIR, thumbnailFilename);

    try {
      const compressionResult = await compressVideoWithFfmpeg(rawPath, compressedPath, thumbnailPath);

      const videoUrl = `/uploads/videos/${compressedFilename}`;
      const thumbnailUrl = fs.existsSync(thumbnailPath)
        ? `/uploads/thumbnails/${thumbnailFilename}`
        : '';

      const videos = readJsonFile<any[]>(VIDEOS_PATH, []);
      const newVideo = {
        id: `vid_${Date.now()}`,
        title: title.trim(),
        url: videoUrl,
        description: description.trim(),
        thumbnail: thumbnailUrl,
        published,
        fileSize: compressionResult.compressedSize,
        originalSize: compressionResult.originalSize,
        compressed: compressionResult.compressed,
        createdAt: new Date().toISOString(),
      };

      videos.unshift(newVideo);
      writeJsonFile(VIDEOS_PATH, videos);

      res.status(201).json({
        success: true,
        video: newVideo,
        message: compressionResult.compressed
          ? `Video uploaded and compressed maintaining 85-90% quality (Size: ${(compressionResult.compressedSize / (1024 * 1024)).toFixed(1)} MB).`
          : 'Video uploaded successfully.',
      });
    } catch (err: any) {
      console.error('Failed to process uploaded video:', err);
      res.status(500).json({ error: err.message || 'Failed to process uploaded video' });
    }
  }
);

// Hero Image Upload (Admin)
app.post('/api/upload/hero', requireAuth, uploadHero.single('image'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded' });
    return;
  }

  const schoolData = readJsonFile<any>(SCHOOL_DATA_PATH, {});
  const heroUrl = `/uploads/hero/${req.file.filename}`;
  if (!schoolData.hero) schoolData.hero = {};
  schoolData.hero.heroImageUrl = heroUrl;
  writeJsonFile(SCHOOL_DATA_PATH, schoolData);

  res.json({ success: true, heroImageUrl: heroUrl });
});

// Admissions: Apply (Public)
app.post('/api/admissions/apply', (req: Request, res: Response) => {
  const {
    studentFullName,
    gender,
    dateOfBirth,
    sectionApplied,
    entryClass,
    boardingPreference,
    parentFullName,
    parentPhone,
    parentEmail,
    residentialAddress,
    previousSchool,
    additionalNotes,
  } = req.body;

  if (!studentFullName || !parentFullName || !parentPhone || !sectionApplied) {
    res.status(400).json({ error: 'Please provide all required fields' });
    return;
  }

  const applications = readJsonFile<any[]>(APPLICATIONS_PATH, []);
  const newApp = {
    id: `app_${Date.now()}`,
    applicationNumber: `ALN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    studentFullName: studentFullName.trim(),
    gender: gender || 'Not Specified',
    dateOfBirth: dateOfBirth || '',
    sectionApplied,
    entryClass: entryClass || '',
    boardingPreference: boardingPreference || 'Day',
    parentFullName: parentFullName.trim(),
    parentPhone: parentPhone.trim(),
    parentEmail: parentEmail?.trim() || '',
    residentialAddress: residentialAddress?.trim() || '',
    previousSchool: previousSchool?.trim() || '',
    additionalNotes: additionalNotes?.trim() || '',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  applications.unshift(newApp);
  writeJsonFile(APPLICATIONS_PATH, applications);
  res.status(201).json({
    success: true,
    applicationNumber: newApp.applicationNumber,
    message: 'Admission application received successfully',
  });
});

// Admissions: Get Applications (Admin)
app.get('/api/admissions/applications', requireAuth, (_req: Request, res: Response) => {
  const applications = readJsonFile<any[]>(APPLICATIONS_PATH, []);
  res.json(applications);
});

// Admissions: Update Application Status (Admin)
app.patch('/api/admissions/applications/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const applications = readJsonFile<any[]>(APPLICATIONS_PATH, []);
  const application = applications.find((a) => a.id === id);

  if (!application) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  if (status) application.status = status;
  if (remarks !== undefined) application.remarks = remarks;
  writeJsonFile(APPLICATIONS_PATH, applications);
  res.json(application);
});

// Contact Form (Public)
app.post('/api/contact', (req: Request, res: Response) => {
  const { name, phone, email, subject, message } = req.body;
  if (!name || !phone || !message) {
    res.status(400).json({ error: 'Name, phone number, and message are required' });
    return;
  }

  const messages = readJsonFile<any[]>(MESSAGES_PATH, []);
  const newMsg = {
    id: `msg_${Date.now()}`,
    name: name.trim(),
    phone: phone.trim(),
    email: email?.trim() || '',
    subject: subject?.trim() || 'General Inquiry',
    message: message.trim(),
    read: false,
    createdAt: new Date().toISOString(),
  };

  messages.unshift(newMsg);
  writeJsonFile(MESSAGES_PATH, messages);
  res.status(201).json({ success: true, message: 'Message sent successfully' });
});

// Contact Messages (Admin)
app.get('/api/contact/messages', requireAuth, (_req: Request, res: Response) => {
  const messages = readJsonFile<any[]>(MESSAGES_PATH, []);
  res.json(messages);
});

// Contact Message: Mark Read (Admin)
app.patch('/api/contact/messages/:id/read', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const messages = readJsonFile<any[]>(MESSAGES_PATH, []);
  const msg = messages.find((m) => m.id === id);

  if (!msg) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }

  msg.read = true;
  writeJsonFile(MESSAGES_PATH, messages);
  res.json(msg);
});

// Contact Message: Delete (Admin)
app.delete('/api/contact/messages/:id', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  let messages = readJsonFile<any[]>(MESSAGES_PATH, []);
  messages = messages.filter((m) => m.id !== id);
  writeJsonFile(MESSAGES_PATH, messages);
  res.json({ success: true, message: 'Message deleted' });
});

// ----------------- AI ASSISTANT (GEMINI + KNOWLEDGE GROUNDING) -----------------

const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

function buildSchoolKnowledgeContext(schoolData: any): string {
  const general = schoolData?.general || {};
  const hero = schoolData?.hero || {};
  const mission = schoolData?.missionVision || {};
  const boarding = schoolData?.boarding || {};
  const admissions = schoolData?.admissions || {};
  const sections = schoolData?.sections || [];
  const facilities = schoolData?.facilities || [];
  const clubs = schoolData?.clubs || [];
  const ethos = schoolData?.ethosAndValues || [];

  return `
Official School Name: ${general.name || 'Al-Niima Academy'}
Motto: "${general.motto || 'Standard Education & Morals for World-Class Leadership'}"
Location: ${general.location || 'Dutse, Jigawa State, Nigeria'}
Detailed Physical Address: ${general.address || 'Behind Godiya Miyetti Housing Estate, Jigawar Tsada, Dutse, Jigawa State'}
Official Phone Numbers: ${(general.phoneNumbers || ['08038382557', '08021358445']).join(', ')}
Official WhatsApp Numbers: +234 803 838 2557 and +234 802 135 8445
Official Email: ${general.email || 'info@alniimaacademy.com.ng'}
Official Website: ${general.website || 'www.alniimaacademy.com.ng'}

Mission: ${mission.mission || 'We are firm in our commitment to provide standard and qualitative education to your child.'}
Vision: ${mission.vision || 'To develop in children the ability to integrate in larger society and meet worldwide educational challenges.'}

Educational Sections:
${sections.map((s: any) => `- ${s.title} (${s.category}, Age/Class: ${s.ageRange}): ${s.description}`).join('\n')}

Boarding School Facilities:
- Boys and Girls: Strictly separate hostels for male and female students with caring house parents/matrons.
- Security: 24/7 dedicated security personnel and restricted entry.
- Water Supply: Constant running potable water throughout premises.
- Meals: Wholesome, balanced, and hygienic meals prepared daily by professional caterers.
- Study & Prep: Structured evening and morning prep sessions under teacher guidance.
${(boarding.features || []).map((f: any) => `- ${f.title}: ${f.detail}`).join('\n')}

Admissions & Application Process:
- Status: Admissions currently ongoing for the new academic session.
- Requirements:
${(admissions.requirements || []).map((r: string) => `  * ${r}`).join('\n')}
- 5-Step Admission Flow:
${(admissions.steps || []).map((s: any) => `  ${s.step}. ${s.title}: ${s.desc}`).join('\n')}
- Contact for admissions: 08038382557 or WhatsApp +234 803 838 2557.

Facilities & Infrastructure:
${facilities.map((f: any) => `- ${f.name} (${f.category}): ${f.description}`).join('\n')}

School Clubs & Co-Curricular Activities:
${clubs.map((c: any) => `- ${c.name} (${c.category}): ${c.description}`).join('\n')}

Core Ethos and Values:
${ethos.map((e: any) => `- ${e.title}: ${e.description}`).join('\n')}
`;
}

// Helper functions for language detection
function isHausaText(query: string): boolean {
  return (
    query.includes('sannu') ||
    query.includes('barka') ||
    query.includes('ina ne') ||
    query.includes('ina makaranta') ||
    query.includes('wuri') ||
    query.includes('adireshi') ||
    query.includes('shiga') ||
    query.includes('neman') ||
    query.includes('daukar') ||
    query.includes('dalibai') ||
    query.includes('kudin') ||
    query.includes('kudi') ||
    query.includes('nawa') ||
    query.includes('dakunan') ||
    query.includes('kwana') ||
    query.includes('karatu') ||
    query.includes('darussa') ||
    query.includes('malamai') ||
    query.includes('yara') ||
    query.includes('makaranta') ||
    query.includes('hostel') ||
    query.includes('abinci') ||
    query.includes('aji') ||
    query.includes('shekara') ||
    query.includes('lamba') ||
    query.includes('tsaro') ||
    query.includes('yaya') ||
    query.includes('ina') ||
    query.includes('yaushe') ||
    query.includes('godiya') ||
    query.includes('nagode')
  );
}

function isArabicText(query: string): boolean {
  return (
    /[\u0600-\u06FF]/.test(query) ||
    query.includes('salam') ||
    query.includes('marhaban') ||
    query.includes('ahlan') ||
    query.includes('shukran')
  );
}

function isYorubaText(query: string): boolean {
  return (
    query.includes('bawo') ||
    query.includes('ekaro') ||
    query.includes('ekasan') ||
    query.includes('nibo') ||
    query.includes('adirese') ||
    query.includes('owo ile-iwe') ||
    query.includes('iforukosile') ||
    query.includes('eko') ||
    query.includes('e kaabo') ||
    query.includes('se daadaa')
  );
}

function isFrenchText(query: string): boolean {
  return (
    query.includes('bonjour') ||
    query.includes('salut') ||
    query.includes('comment') ||
    query.includes('où') ||
    query.includes('ou se') ||
    query.includes('école') ||
    query.includes('ecole') ||
    query.includes('adresse') ||
    query.includes('frais') ||
    query.includes('scolarité') ||
    query.includes('scolarite') ||
    query.includes('dortoir') ||
    query.includes('internat') ||
    query.includes('inscription') ||
    query.includes('merci')
  );
}

function generateInstantKnowledgeFallback(message: string, schoolData: any, language?: string): string {
  const rawText = message.trim();
  const query = rawText.toLowerCase();
  const general = schoolData?.general || {};
  const phone1 = general.phoneNumbers?.[0] || '08038382557';
  const phone2 = general.phoneNumbers?.[1] || '08021358445';
  const address = general.address || 'Behind Godiya Miyetti Housing Estate, Jigawar Tsada, Dutse, Jigawa State';

  // ----------------- HAUSA LANGUAGE (Active when selected or detected) -----------------
  if (language === 'ha' || isHausaText(query)) {
    // Location / Address in Hausa
    if (query.includes('ina') || query.includes('wuri') || query.includes('adireshi') || query.includes('dutse') || query.includes('jigawa') || query.includes('where') || query.includes('location')) {
      return `**📍 Wurin Da Makarantar Al-Niima Academy Take:**
Makarantar tana garin **Dutse, Jihar Jigawa**.
**Cikakken Adireshi:** ${address} *(Bayan Godiya Miyetti Housing Estate, Jigawar Tsada, Dutse)*.

- Lokacin aiki da ziyara: Litinin zuwa Juma'a (8:00 na safe zuwa 4:00 na yamma).
- 📞 Lambar Waya: **${phone1}** / **${phone2}**
- 💬 WhatsApp Kai Tsaye: **+234 ${phone1.replace(/^0/, '')}**`;
    }

    // Admissions / Shiga makaranta
    if (
      query.includes('shiga') ||
      query.includes('neman') ||
      query.includes('rajista') ||
      query.includes('form') ||
      query.includes('fam') ||
      query.includes('takarda') ||
      query.includes('admission') ||
      query.includes('dauka') ||
      query.includes('apply') ||
      query.includes('enroll')
    ) {
      return `**📝 Shiga Makarantar Al-Niima Academy (Admissions):**
Ba a cika fom a intanet. Duk wanda ke son neman shiga ko sanya ɗalibi a Al-Niima Academy:
1. **Ziyartar Harabar Makaranta:** Ziyarci ofishin makaranta a Jigawar Tsada, Dutse (Bayan Godiya Miyetti Housing Estate) don karɓar takardar neman shiga ta zahiri (Admission Form) da bayanan makaranta (Prospectus).
2. **Kiran Waya ko WhatsApp:** Kira ko turo saƙo zuwa: **+234 ${phone1.replace(/^0/, '')}** ko **${phone2}**.
3. **Aika Imel:** Turo saƙo zuwa: **info@alniimaacademy.com**.

Makarantar tana ɗaukar sababbin ɗalibai a dukkan matakai (Crèche, Nursery, Primary, JSS, SSS, da A-Levels).`;
    }

    // Hostels / Dakunan kwana / Abinci
    if (query.includes('kwana') || query.includes('hostel') || query.includes('dakunan') || query.includes('daki') || query.includes('abinci') || query.includes('boarding') || query.includes('tsaro')) {
      return `**🏫 Dakunan Kwanan Ɗalibai (Boarding School):**
Makarantar Al-Niima Academy tana da ingantattun dakunan kwanan ɗalibai na musamman:
- **Rarrabe:** Dakunan kwanan maza daban, na mata daban tare da kulawar iyayen daki (House Masters da Matrons).
- **Tsaro:** Jami'an tsaro na kula da makarantar sa'o'i 24 kowace rana.
- **Ruwa da Wuta:** Isasshen ruwan famfo mai tsabta da wutar lantarki.
- **Abinci:** Abinci mai gina jiki sau uku a rana wanda ƙwararrun masu girki ke shiryawa.
- **Karatu da Tarbiyya:** Tsari mai kyau na bitar karatu (Prep) safe da yamma tare da kula da tarbiyyar addinin Musulunci da ladabi.`;
    }

    // School fees / Kuɗin makaranta
    if (query.includes('kudi') || query.includes('kudin') || query.includes('nawa') || query.includes('fee') || query.includes('cost') || query.includes('biyan')) {
      return `**💳 Kuɗin Makaranta (School Fees):**
Kuɗin makarantar Al-Niima Academy mai sauƙi ne kuma yana tafiya daidai da ingancin ilimi, tarbiyya, da kayan aiki na zamani da ake bayarwa (na ɗaliban kwana da na masu zuwa daga gida).

Domin samun cikakken jadawalin kuɗin aji da kake so don yaranka:
- 💬 Tuntubi Akanta ta WhatsApp: **+234 ${phone1.replace(/^0/, '')}**
- 📞 Kira kai tsaye: **${phone1}** ko **${phone2}**`;
    }

    // Classes / Matakai
    if (query.includes('aji') || query.includes('matakai') || query.includes('class') || query.includes('section') || query.includes('primary') || query.includes('secondary')) {
      return `**🎓 Matakan Karatu a Al-Niima Academy:**
1. **Crèche:** Kula da jarirai da ƙananan yara cikin tsafta.
2. **Kindergarten & Nursery:** Koyon karatu, rubutu, lambobi, da tarbiyya.
3. **Primary (1 – 6):** Ingantaccen ilimin firamare, kimiyya da fasahar kwamfuta (ICT).
4. **Junior Secondary (JSS 1 – 3):** Shirye-shiryen jarrabawar BECE.
5. **Senior Secondary (SSS 1 – 3):** Fannonin Kimiyya (Science), Fasaha (Arts), da Kasuwanci (Commercial) don WAEC, NECO da JAMB.
6. **A-Levels & IJMB:** Karatun share fagen shiga jami'a kai tsaye mataki na biyu.`;
    }

    // Contacts / Lambar WhatsApp
    if (query.includes('lamba') || query.includes('waya') || query.includes('whatsapp') || query.includes('kira') || query.includes('contact')) {
      return `**📞 Lambobin Tuntubar Al-Niima Academy:**
- **Lambar WhatsApp:** **+234 ${phone1.replace(/^0/, '')}**
- **Layin Waya:** **${phone1}** ko **${phone2}**
- **Imel:** ${general.email || 'info@alniimaacademy.com.ng'}
- **Adireshi:** ${address}, Dutse, Jihar Jigawa.
💡 Zaku iya danna koren madannin WhatsApp da ke kan fuskar shafin nan don magana kai tsaye!`;
    }

    // General Hausa Greeting / Overview
    return `**Barka da zuwa Al-Niima Academy AI Assistant!**
Ina nan don amsa tambayoyinku kai tsaye a **Harshen Hausa** game da makarantarmu da ke Dutse, Jihar Jigawa.

Kuna iya tambaya kan:
- 📝 **Shiga makaranta (Admissions da Fam)**
- 🏫 **Dakunan kwanan ɗalibai (Boarding na maza da mata)**
- 💳 **Kuɗin makaranta**
- 📍 **Wurin da makarantar take a Dutse**
- 📞 **Lambar WhatsApp:** **+234 ${phone1.replace(/^0/, '')}**

Wace tambaya kuke da ita a yanzu?`;
  }

  // ----------------- ARABIC LANGUAGE -----------------
  if (language === 'ar' || isArabicText(query)) {
    if (query.includes('أين') || query.includes('موقع') || query.includes('عنوان') || query.includes('مكان') || query.includes('location')) {
      return `**📍 موقع أكاديمية النعمة (Al-Niima Academy):**
تقع الأكاديمية في مدينة **دوتسي، ولاية جيغاوة، نيجيريا**.
**العنوان التفصيلي:** ${address} *(خلف مجمع غوديا ميتي السكني، جيغاوار تسادا، دوتسي)*.

- ساعات العمل الرسمية: من الإثنين إلى الجمعة (8:00 صباحاً – 4:00 مساءً).
- 📞 الهاتف: **${phone1}** / **${phone2}**
- 💬 الواتساب المباشر: **+234 ${phone1.replace(/^0/, '')}**`;
    }

    if (query.includes('قبول') || query.includes('تسجيل') || query.includes('تقديم') || query.includes('استمارة') || query.includes('admission')) {
      return `**📝 القبول والتسجيل في أكاديمية النعمة:**
باب القبول مفتوح الآن لجميع المراحل الدراسية (الحضانة، الابتدائية، المتوسطة، الثانوية، ودراسات A-Levels).

**طريقة التقديم والتسجيل:**
لا يتم التقديم عبر الإنترنت. للتسجيل أو التقديم:
1. **زيارة مقر المدرسة:** التوجه مباشرة لمكتب الإدارة في دوتسي لاستلام استمارة القبول الرسمية والدليل التعريفي.
2. **الاتصال بالهاتف / واتساب:** التواصل مع مكتب القبول عبر: **+234 ${phone1.replace(/^0/, '')}** أو **${phone2}**.
3. **البريد الإلكتروني:** **info@alniimaacademy.com**.`;
    }

    if (query.includes('سكن') || query.includes('داخلي') || query.includes('إقامة') || query.includes('وجبات') || query.includes('hostel')) {
      return `**🏫 السكن الداخلي (قسم البنين وقسم البنات):**
توفر أكاديمية النعمة سكناً داخلياً متميزاً:
- مساكن منفصلة تماماً للبنين والبنات تحت إشراف تربوي على مدار الساعة.
- حراسة وأمن مستمر 24/7.
- مياه نقية صالحة للشرب وكهرباء منتظمة.
- ثلاث وجبات غذائية صحية ومتكاملة يومياً.
- حلقات لتحفيظ القرآن الكريم والمذاكرة الصباحية والمسائية.`;
    }

    if (query.includes('رسوم') || query.includes('تكلفة') || query.includes('كم') || query.includes('سعر') || query.includes('fees')) {
      return `**💳 الرسوم الدراسية:**
تقدم أكاديمية النعمة تعليماً متميزاً بأسعار مناسبة ومعتدلة تلائم جودة التعليم والتربية والخدمات المقدمة (للطلاب النهاريين والداخليين).
للحصول على جدول الرسوم الخاص بالمرحلة المناسبة لابنكم:
- تواصل عبر الواتساب مع الحسابات: **+234 ${phone1.replace(/^0/, '')}**
- أو اتصل على: **${phone1}**`;
    }

    return `**السلام عليكم ورحمة الله وبركاته! مرحباً بكم في أكاديمية النعمة (Al-Niima Academy)**
أنا المساعد الذكي للأكاديمية، ويسعدني الإجابة عن استفساراتكم باللغة **العربية**:
- 📝 إجراءات القبول والتسجيل
- 🏫 السكن الداخلي المنفصل للبنين والبنات
- 💳 الرسوم الدراسية المعتدلة
- 📍 موقع المدرسة في دوتسي، ولاية جيغاوة
- 📞 للتواصل الفوري عبر الواتساب: **+234 ${phone1.replace(/^0/, '')}**

كيف يمكنني مساعدتكم اليوم؟`;
  }

  // ----------------- YORUBA LANGUAGE -----------------
  if (language === 'yo' || isYorubaText(query)) {
    if (query.includes('nibo') || query.includes('adirese') || query.includes('ibi') || query.includes('location')) {
      return `**📍 Ibi ti Al-Niima Academy wa:**
Ile-iwe naa wa ni ilu **Dutse, Ipinle Jigawa, Naijiria**.
**Adirẹsi:** ${address} *(Lẹhin Godiya Miyetti Housing Estate, Jigawar Tsada, Dutse)*.
- 📞 WhatsApp tabi Ipe: **+234 ${phone1.replace(/^0/, '')}**`;
    }

    if (query.includes('iforukosile') || query.includes('admission') || query.includes('gba') || query.includes('foomu')) {
      return `**📝 Gbigba Wọle si Al-Niima Academy (Admissions):**
Gbigba wọle ṣi wa ni sisi fun gbogbo awọn kilasi (Crèche, Nursery, Primary, JSS, SSS, ati A-Levels).
1. Gba fọọmu lori ayelujara tabi ni ọfiisi ile-iwe ni Dutse.
2. Ọmọ yoo kọ idanwo igbelewọn iwọle.
3. San owo ile-iwe ki o bẹrẹ ẹkọ.
Fun iranlọwọ lẹsẹkẹsẹ lori WhatsApp: **+234 ${phone1.replace(/^0/, '')}**.`;
    }

    if (query.includes('owo') || query.includes('elo') || query.includes('fees')) {
      return `**💳 Owo Ile-iwe (School Fees):**
Owo ile-iwe Al-Niima Academy wa ni iwọntunwọnsi to baramu pẹlu ẹkọ didara ati itọju ọmọ.
Lati gba alaye kikun nipa owo kilasi ti ẹ fẹ:
- Kan si wa lori WhatsApp: **+234 ${phone1.replace(/^0/, '')}**`;
    }

    return `**Ẹ n lẹ o! Kaabọ si Al-Niima Academy AI Assistant.**
Mo wa nibi lati ran yin lọwọ ni **Èdè Yorùbá**:
- 📝 Gbigba wọle (Admissions)
- 🏫 Ile gbigbe ọmọkunrin ati ọmọbinrin (Boarding)
- 📍 Ibi ti ile-iwe wa ni Dutse, Jigawa
- 📞 WhatsApp: **+234 ${phone1.replace(/^0/, '')}**

Kini ẹ fẹ lati beere loni?`;
  }

  // ----------------- FRENCH LANGUAGE -----------------
  if (language === 'fr' || isFrenchText(query)) {
    if (query.includes('où') || query.includes('adresse') || query.includes('localisation') || query.includes('location')) {
      return `**📍 Emplacement d'Al-Niima Academy:**
L'académie est située à **Dutse, État de Jigawa, Nigéria**.
**Adresse:** ${address} *(Derrière le lotissement résidentiel Godiya Miyetti, Jigawar Tsada, Dutse)*.
📞 Contact WhatsApp: **+234 ${phone1.replace(/^0/, '')}**`;
    }

    if (query.includes('admission') || query.includes('inscription') || query.includes('formulaire')) {
      return `**📝 Admissions à Al-Niima Academy:**
Les admissions sont actuellement ouvertes pour la nouvelle session académique (Crèche, Maternelle, Primaire, Collège, Lycée et A-Levels).
1. Obtenez le formulaire en ligne ou à l'administration à Dutse.
2. L'élève passe le test d'évaluation d'entrée.
3. Finalisez l'inscription et le paiement des frais.
WhatsApp direct pour les admissions: **+234 ${phone1.replace(/^0/, '')}**.`;
    }

    if (query.includes('internat') || query.includes('logement') || query.includes('dortoir')) {
      return `**🏫 Internat Séparé Garçons & Filles:**
Al-Niima Academy dispose d'un internat de haut niveau:
- Dortoirs strictement séparés pour filles et garçons avec encadrement permanent.
- Sécurité renforcée 24h/24.
- Eau potable continue et repas équilibrés trois fois par jour.`;
    }

    if (query.includes('frais') || query.includes('scolarité') || query.includes('prix') || query.includes('combien')) {
      return `**💳 Frais de Scolarité:**
Al-Niima Academy propose des tarifs très compétitifs et adaptés à la qualité de l'enseignement.
Pour obtenir la grille tarifaire complète:
- Contactez notre comptabilité sur WhatsApp: **+234 ${phone1.replace(/^0/, '')}**`;
    }

    return `**Bonjour et bienvenue à l'Académie Al-Niima!**
Je suis votre assistant IA francophone. Je réponds à vos questions sur:
- 📝 Les admissions et inscriptions
- 🏫 L'internat garçons et filles
- 📍 L'adresse à Dutse, Jigawa
- 📞 Ligne WhatsApp: **+234 ${phone1.replace(/^0/, '')}**

Comment puis-je vous aider aujourd'hui?`;
  }

  // ----------------- ENGLISH LANGUAGE (DEFAULT) -----------------
  if (
    query.includes('admiss') ||
    query.includes('apply') ||
    query.includes('register') ||
    query.includes('enroll') ||
    query.includes('form') ||
    query.includes('requirement') ||
    query.includes('entrance')
  ) {
    return `**📝 Admissions at Al-Niima Academy (Dutse, Jigawa State)**

Admissions are **open** for all levels (Crèche, Nursery, Primary, JSS, SSS, and A'Levels).

**How to Apply / Enroll:**
We do not use online forms. Anyone wishing to apply or enroll should:
1. **Visit the School Campus:** Obtain the official physical admission form and student prospectus at the administrative office in Dutse (Behind Godiya Miyetti Housing Estate, Jigawar Tsada).
2. **Contact via Telephone / WhatsApp:** Call or WhatsApp our admissions desk at **+234 ${phone1.replace(/^0/, '')}** or **${phone2}**.
3. **Email Inquiries:** Contact **info@alniimaacademy.com**.`;
  }

  if (
    query.includes('board') ||
    query.includes('hostel') ||
    query.includes('dorm') ||
    query.includes('stay') ||
    query.includes('food') ||
    query.includes('catering')
  ) {
    return `**🏫 Boarding Facilities at Al-Niima Academy**

We offer comfortable, safe, and disciplined boarding for both male and female secondary students:
- **Strictly Separate Hostels:** Dedicated hostels for boys and girls with caring house parents and matrons.
- **Security:** 24/7 round-the-clock security surveillance and restricted access.
- **Amenities:** Constant clean potable water, reliable electricity, and medical first-aid.
- **Meals:** Three hygienic, wholesome, and balanced meals daily prepared by qualified caterers.
- **Supervised Prep:** Guided evening and morning study sessions.`;
  }

  if (
    query.includes('where') ||
    query.includes('location') ||
    query.includes('address') ||
    query.includes('find') ||
    query.includes('dutse') ||
    query.includes('jigawa') ||
    query.includes('direction')
  ) {
    return `**📍 Campus Location & Address**

**Al-Niima Academy** is located in:
🏢 **${address}**
🌍 **Dutse, Jigawa State, Nigeria**
*(Directly behind Godiya Miyetti Housing Estate, Jigawar Tsada)*

- 📞 **Phone & WhatsApp:** **+234 ${phone1.replace(/^0/, '')}** / **${phone2}**
- ✉️ **Email:** ${general.email || 'info@alniimaacademy.com.ng'}
- ⏰ **Office Visiting Hours:** Monday – Friday, 8:00 AM – 4:00 PM`;
  }

  if (
    query.includes('section') ||
    query.includes('class') ||
    query.includes('creche') ||
    query.includes('nursery') ||
    query.includes('primary') ||
    query.includes('secondary') ||
    query.includes('jss') ||
    query.includes('sss') ||
    query.includes('alevel')
  ) {
    return `**🎓 Academic Sections at Al-Niima Academy:**
1. **Crèche (3 Mos – 1.5 Yrs):** Safe, attentive infant care.
2. **Kindergarten (1.5 – 3 Yrs):** Social discovery & foundational numeracy.
3. **Nursery (3 – 5 Yrs):** Phonics, literacy & character grounding.
4. **Primary (Primary 1 – 6):** Core academic curriculum & ICT.
5. **Junior Secondary (JSS 1 – 3):** Prevocational, sciences, and BECE prep.
6. **Senior Secondary (SSS 1 – 3):** Science, Arts & Commercial tracks for WAEC, NECO & JAMB.
7. **A'Level & Direct Entry:** Pre-university program.
8. **Boarding School:** Separate boys & girls hostels.`;
  }

  if (
    query.includes('fee') ||
    query.includes('cost') ||
    query.includes('tuition') ||
    query.includes('price') ||
    query.includes('how much') ||
    query.includes('payment')
  ) {
    return `**💳 Tuition & Fees Information**

Al-Niima Academy offers competitive, parent-friendly tuition covering qualitative instruction, modern science labs, ICT, and moral education (plus accommodation & catering for boarding students).

For the exact fee structure for your child's prospective grade (Day or Boarding):
- 💬 **WhatsApp Accounts Desk:** **+234 ${phone1.replace(/^0/, '')}**
- 📞 **Call:** **${phone1}** or **${phone2}**`;
  }

  if (
    query.includes('contact') ||
    query.includes('phone') ||
    query.includes('whatsapp') ||
    query.includes('call') ||
    query.includes('email')
  ) {
    return `**📞 Contact Al-Niima Academy**

- **WhatsApp Desk:** **+234 ${phone1.replace(/^0/, '')}**
- **Phone Lines:** **${phone1}** / **${phone2}**
- **Address:** ${address}
- **Email:** ${general.email || 'info@alniimaacademy.com.ng'}

💡 You can also tap the round green WhatsApp button right on this page to chat instantly with our admissions staff!`;
  }

  if (
    query.includes('hello') ||
    query.includes('hi') ||
    query.includes('good morning') ||
    query.includes('good afternoon') ||
    query.includes('good evening')
  ) {
    return `**Hello and welcome to Al-Niima Academy!** 

I am your AI Assistant. I speak **English, Hausa, Yoruba, Arabic, and French**.

How can I help you today?
- 📝 Admissions & registration
- 🏫 Boarding facilities (separate boys & girls)
- 📍 Campus location in Dutse, Jigawa
- 💳 School fees & contact lines`;
  }

  return `Thank you for reaching out to **Al-Niima Academy** (Dutse, Jigawa State).

I can answer questions in **Hausa, English, Yoruba, Arabic, and French** about:
- **Admissions & Entrance Requirements**
- **Male & Female Boarding Hostels**
- **Curriculum & Classes (Crèche to A'Levels)**
- **School Location & Visiting Hours**

💬 For direct personal assistance, tap the **WhatsApp button** on your screen or message **+234 ${phone1.replace(/^0/, '')}**!`;
}

// AI Assistant Route
app.post('/api/ai-assistant', async (req: Request, res: Response) => {
  const { message, history, language } = req.body;

  if (!message || typeof message !== 'string' || !message.trim()) {
    res.status(400).json({ error: 'A question or message is required' });
    return;
  }

  const schoolData = readJsonFile<any>(SCHOOL_DATA_PATH, {});
  const userText = message.trim();
  const lowerUserText = userText.toLowerCase();

  // Try Gemini 3.8 Flash first
  if (geminiClient) {
    try {
      const knowledgeContext = buildSchoolKnowledgeContext(schoolData);

      let languageEnforcement = '';
      if (language === 'ha' || isHausaText(lowerUserText)) {
        languageEnforcement = `
🚨 MANDATORY HAUSA LANGUAGE RULE:
The user is communicating in or has selected HAUSA (Harshen Hausa).
You MUST respond 100% in natural, polite, direct HAUSA.
DO NOT use English words or English translations.
Key Hausa Terms:
- Admissions / Neman Shiga: "Shiga Makaranta" ko "Ɗaukar Sababbin Ɗalibai"
- Requirements / Sharuɗɗa: "Abubuwan da ake buƙata don neman shiga"
- Hostels / Boarding: "Dakunan kwanan ɗalibai daban na maza da daban na mata"
- Location / Wuri: "Makarantar tana Dutse, Jihar Jigawa (Bayan Godiya Miyetti Housing Estate, Jigawar Tsada)"
- School Fees / Kuɗin Makaranta: "Kuɗin makaranta mai sauƙi ne kuma yana tafiya daidai da ingancin ilimi"
- Phone & WhatsApp: "Lambar waya da WhatsApp: +234 803 838 2557 / 08021358445"`;
      } else if (language === 'ar' || isArabicText(lowerUserText)) {
        languageEnforcement = `
🚨 MANDATORY ARABIC LANGUAGE RULE:
The user is communicating in or has selected ARABIC.
You MUST respond 100% in standard, polite, fluent ARABIC. DO NOT use English.
Begin with an Islamic greeting when appropriate (السلام عليكم ورحمة الله).`;
      } else if (language === 'yo' || isYorubaText(lowerUserText)) {
        languageEnforcement = `
🚨 MANDATORY YORUBA LANGUAGE RULE:
The user is communicating in or has selected YORUBA.
You MUST respond 100% in respectful, natural YORUBA. DO NOT use English.`;
      } else if (language === 'fr' || isFrenchText(lowerUserText)) {
        languageEnforcement = `
🚨 MANDATORY FRENCH LANGUAGE RULE:
The user is communicating in or has selected FRENCH.
You MUST respond 100% in polite, accurate FRENCH. DO NOT use English.`;
      } else {
        languageEnforcement = `
Respond in clear, professional English.`;
      }

      const systemInstruction = `You are the official Al-Niima Academy AI Assistant (Dutse, Jigawa State, Nigeria).
You have fluent command of 5 languages: English, Hausa (Harshen Hausa), Arabic (اللغة العربية), Yoruba (Èdè Yorùbá), and French (Français).

${languageEnforcement}

CRITICAL RULES:
- Always answer the user's question directly and concisely with verified school facts.
- Avoid unnecessary conversational fluff, boilerplate preambles, or repetitive disclaimers.
- Always provide accurate facts from the verified school knowledge base below.
- Include the school lines (08038382557, 08021358445) and WhatsApp (+234 803 838 2557) when answering questions on admissions, fees, or location.

VERIFIED SCHOOL FACTS:
${knowledgeContext}`;

      // Format history if provided
      const contents: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-6)) {
          if (item && item.content) {
            contents.push({
              role: item.role === 'user' ? 'user' : 'model',
              parts: [{ text: String(item.content) }],
            });
          }
        }
      }
      contents.push({
        role: 'user',
        parts: [{ text: userText }],
      });

      const response = await geminiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });

      const generatedText = response.text?.trim();
      if (generatedText) {
        res.json({
          success: true,
          answer: generatedText,
          source: 'gemini-3.8-flash',
          timestamp: new Date().toISOString(),
        });
        return;
      }
    } catch (err: any) {
      console.warn('Gemini generateContent error, falling back to verified knowledge engine:', err?.message || err);
    }
  }

  // Instant Knowledge Engine fallback with full multilingual intelligence
  const fallbackAnswer = generateInstantKnowledgeFallback(userText, schoolData, language);
  res.json({
    success: true,
    answer: fallbackAnswer,
    source: 'alniima-knowledge-engine',
    timestamp: new Date().toISOString(),
  });
});

// ----------------- VITE & STATIC HANDLING -----------------

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // In dev mode, use Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Al-Niima Academy server running at http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export default app;

