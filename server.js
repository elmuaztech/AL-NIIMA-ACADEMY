// server.ts
import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { exec } from "child_process";
import util from "util";
var execPromise = util.promisify(exec);
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var DATA_DIR = path.resolve(__dirname, "data");
var UPLOADS_DIR = path.resolve(__dirname, "uploads");
var GALLERY_UPLOADS_DIR = path.resolve(UPLOADS_DIR, "gallery");
var HERO_UPLOADS_DIR = path.resolve(UPLOADS_DIR, "hero");
var VIDEOS_UPLOADS_DIR = path.resolve(UPLOADS_DIR, "videos");
var THUMBNAILS_UPLOADS_DIR = path.resolve(UPLOADS_DIR, "thumbnails");
[DATA_DIR, UPLOADS_DIR, GALLERY_UPLOADS_DIR, HERO_UPLOADS_DIR, VIDEOS_UPLOADS_DIR, THUMBNAILS_UPLOADS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
var SCHOOL_DATA_PATH = path.resolve(DATA_DIR, "school-data.json");
var GALLERY_PATH = path.resolve(DATA_DIR, "gallery.json");
var VIDEOS_PATH = path.resolve(DATA_DIR, "videos.json");
var APPLICATIONS_PATH = path.resolve(DATA_DIR, "applications.json");
var MESSAGES_PATH = path.resolve(DATA_DIR, "messages.json");
var SESSIONS_PATH = path.resolve(DATA_DIR, "sessions.json");
function readJsonFile(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
var PUBLIC_DIR = path.resolve(__dirname, "public");
app.use(express.static(PUBLIC_DIR));
app.use("/assets", express.static(path.resolve(PUBLIC_DIR, "assets")));
app.use("/uploads", express.static(UPLOADS_DIR));
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});
function getValidTokens() {
  const list = readJsonFile(SESSIONS_PATH, []);
  return new Set(list);
}
function addSessionToken(token) {
  const tokens = getValidTokens();
  tokens.add(token);
  writeJsonFile(SESSIONS_PATH, Array.from(tokens));
}
function removeSessionToken(token) {
  const tokens = getValidTokens();
  tokens.delete(token);
  writeJsonFile(SESSIONS_PATH, Array.from(tokens));
}
function isSessionValid(token) {
  if (!token) return false;
  return getValidTokens().has(token);
}
var galleryStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, GALLERY_UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `gallery-${uniqueSuffix}${ext}`);
  }
});
var heroStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, HERO_UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}`;
    cb(null, `hero-${uniqueSuffix}${ext}`);
  }
});
var fileFilter = (_req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WEBP, and GIF images are allowed"));
  }
};
var uploadGallery = multer({
  storage: galleryStorage,
  fileFilter,
  limits: { fileSize: 12 * 1024 * 1024 }
  // 12MB limit
});
var uploadHero = multer({
  storage: heroStorage,
  fileFilter,
  limits: { fileSize: 12 * 1024 * 1024 }
});
var MAX_VIDEO_SIZE = 60 * 1024 * 1024;
var videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, VIDEOS_UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".mp4";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `raw-video-${uniqueSuffix}${ext}`);
  }
});
var videoFileFilter = (_req, file, cb) => {
  const allowedTypes = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-matroska",
    "video/3gpp",
    "video/ogg",
    "video/x-msvideo"
  ];
  if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(mp4|webm|mov|mkv|3gp|ogg|avi)$/i)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid video format. Supported formats: MP4, WebM, MOV, MKV, 3GP."));
  }
};
var uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: MAX_VIDEO_SIZE }
});
async function compressVideoWithFfmpeg(inputPath, outputPath, thumbnailPath) {
  const stats = fs.statSync(inputPath);
  const originalSize = stats.size;
  try {
    await execPromise("which ffmpeg");
    const cmd = `ffmpeg -y -i "${inputPath}" -vcodec libx264 -crf 23 -preset fast -vf "scale='min(1280,iw)':-2" -acodec aac -b:a 128k -movflags +faststart "${outputPath}"`;
    await execPromise(cmd);
    try {
      const thumbCmd = `ffmpeg -y -ss 00:00:01 -i "${outputPath}" -vframes 1 -q:v 2 "${thumbnailPath}"`;
      await execPromise(thumbCmd);
    } catch (thumbErr) {
      console.warn("Thumbnail generation skipped:", thumbErr);
    }
    const compressedStats = fs.statSync(outputPath);
    try {
      fs.unlinkSync(inputPath);
    } catch {
    }
    return {
      compressed: true,
      originalSize,
      compressedSize: compressedStats.size
    };
  } catch (err) {
    console.warn("FFmpeg compression failed or not available, retaining original video:", err);
    if (!fs.existsSync(outputPath) && fs.existsSync(inputPath)) {
      fs.copyFileSync(inputPath, outputPath);
      try {
        fs.unlinkSync(inputPath);
      } catch {
      }
    }
    return {
      compressed: false,
      originalSize,
      compressedSize: originalSize
    };
  }
}
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
    return;
  }
  const token = authHeader.split(" ")[1];
  if (!isSessionValid(token)) {
    res.status(401).json({ error: "Unauthorized: Session expired or invalid" });
    return;
  }
  next();
}
app.post("/api/auth/login", (req, res) => {
  const { password } = req.body;
  if (!password) {
    res.status(400).json({ error: "Password is required" });
    return;
  }
  const schoolData = readJsonFile(SCHOOL_DATA_PATH, {});
  const storedPassword = schoolData?.general?.adminPasswordHash || "ADMIN-2026";
  if (password === storedPassword) {
    const token = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    addSessionToken(token);
    res.json({ success: true, token, message: "Authenticated successfully" });
  } else {
    res.status(401).json({ error: "Incorrect administrator password" });
  }
});
app.get("/api/auth/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (isSessionValid(token)) {
      res.json({ valid: true });
      return;
    }
  }
  res.json({ valid: false });
});
app.post("/api/auth/logout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    removeSessionToken(token);
  }
  res.json({ success: true });
});
app.post("/api/auth/change-password", requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    res.status(400).json({ error: "New password must be at least 6 characters" });
    return;
  }
  const schoolData = readJsonFile(SCHOOL_DATA_PATH, {});
  const storedPassword = schoolData?.general?.adminPasswordHash || "ADMIN-2026";
  if (currentPassword !== storedPassword) {
    res.status(400).json({ error: "Current password does not match" });
    return;
  }
  schoolData.general.adminPasswordHash = newPassword;
  writeJsonFile(SCHOOL_DATA_PATH, schoolData);
  res.json({ success: true, message: "Password updated successfully" });
});
app.get("/api/content", (_req, res) => {
  const data = readJsonFile(SCHOOL_DATA_PATH, {});
  const sanitized = { ...data };
  if (sanitized.general) {
    const { adminPasswordHash, ...generalWithoutPassword } = sanitized.general;
    sanitized.general = generalWithoutPassword;
  }
  res.json(sanitized);
});
app.put("/api/content", requireAuth, (req, res) => {
  const incoming = req.body;
  const current = readJsonFile(SCHOOL_DATA_PATH, {});
  const currentPassword = current?.general?.adminPasswordHash || "ADMIN-2026";
  if (incoming.general) {
    incoming.general.adminPasswordHash = currentPassword;
  }
  const saved = writeJsonFile(SCHOOL_DATA_PATH, incoming);
  if (saved) {
    res.json({ success: true, message: "Content updated successfully" });
  } else {
    res.status(500).json({ error: "Failed to write content to storage" });
  }
});
app.post("/api/upload/facility", requireAuth, uploadGallery.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No image file uploaded" });
    return;
  }
  res.json({
    success: true,
    imageUrl: `/uploads/gallery/${req.file.filename}`,
    filename: req.file.filename
  });
});
app.post("/api/facilities", requireAuth, (req, res) => {
  const { name, category, description, imageUrl } = req.body;
  if (!name || !name.trim()) {
    res.status(400).json({ error: "Facility name is required" });
    return;
  }
  const data = readJsonFile(SCHOOL_DATA_PATH, {});
  if (!data.facilities) {
    data.facilities = [];
  }
  const newFacility = {
    name: name.trim(),
    category: category?.trim() || "General School",
    description: description?.trim() || "",
    imageUrl: imageUrl || ""
  };
  data.facilities.push(newFacility);
  writeJsonFile(SCHOOL_DATA_PATH, data);
  res.status(201).json({ success: true, facility: newFacility, facilities: data.facilities });
});
app.put("/api/facilities/:index", requireAuth, (req, res) => {
  const index = parseInt(req.params.index, 10);
  const { name, category, description, imageUrl } = req.body;
  const data = readJsonFile(SCHOOL_DATA_PATH, {});
  if (!data.facilities || index < 0 || index >= data.facilities.length) {
    res.status(404).json({ error: "Facility not found" });
    return;
  }
  data.facilities[index] = {
    name: name?.trim() || data.facilities[index].name,
    category: category?.trim() || data.facilities[index].category,
    description: description !== void 0 ? description.trim() : data.facilities[index].description,
    imageUrl: imageUrl !== void 0 ? imageUrl : data.facilities[index].imageUrl
  };
  writeJsonFile(SCHOOL_DATA_PATH, data);
  res.json({ success: true, facility: data.facilities[index], facilities: data.facilities });
});
app.delete("/api/facilities/:index", requireAuth, (req, res) => {
  const index = parseInt(req.params.index, 10);
  const data = readJsonFile(SCHOOL_DATA_PATH, {});
  if (!data.facilities || index < 0 || index >= data.facilities.length) {
    res.status(404).json({ error: "Facility not found" });
    return;
  }
  const removed = data.facilities.splice(index, 1);
  writeJsonFile(SCHOOL_DATA_PATH, data);
  res.json({ success: true, removed: removed[0], facilities: data.facilities });
});
app.get("/api/gallery", (req, res) => {
  const allItems = readJsonFile(GALLERY_PATH, []);
  const authHeader = req.headers.authorization;
  const isAdmin = authHeader && isSessionValid(authHeader.replace("Bearer ", ""));
  if (isAdmin) {
    res.json(allItems);
  } else {
    res.json(allItems.filter((item) => item.published !== false));
  }
});
app.post("/api/gallery", requireAuth, uploadGallery.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No image file uploaded" });
    return;
  }
  const { title, description, category, published } = req.body;
  const items = readJsonFile(GALLERY_PATH, []);
  const newItem = {
    id: `gal_${Date.now()}`,
    title: title?.trim() || "School Photograph",
    description: description?.trim() || "",
    category: category || "School Life",
    imageUrl: `/uploads/gallery/${req.file.filename}`,
    filename: req.file.filename,
    published: published === "true" || published === true,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  items.unshift(newItem);
  writeJsonFile(GALLERY_PATH, items);
  res.status(201).json(newItem);
});
app.patch("/api/gallery/:id/toggle", requireAuth, (req, res) => {
  const { id } = req.params;
  const items = readJsonFile(GALLERY_PATH, []);
  const item = items.find((i) => i.id === id);
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  item.published = !item.published;
  writeJsonFile(GALLERY_PATH, items);
  res.json(item);
});
app.delete("/api/gallery/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  let items = readJsonFile(GALLERY_PATH, []);
  const item = items.find((i) => i.id === id);
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  if (item.filename) {
    const filePath = path.resolve(GALLERY_UPLOADS_DIR, item.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }
  }
  items = items.filter((i) => i.id !== id);
  writeJsonFile(GALLERY_PATH, items);
  res.json({ success: true, message: "Gallery item deleted" });
});
app.get("/api/videos", (req, res) => {
  const allVideos = readJsonFile(VIDEOS_PATH, []);
  const authHeader = req.headers.authorization;
  const isAdmin = authHeader && isSessionValid(authHeader.replace("Bearer ", ""));
  if (isAdmin) {
    res.json(allVideos);
  } else {
    res.json(allVideos.filter((v) => v.published !== false));
  }
});
app.post("/api/videos", requireAuth, (req, res) => {
  const { title, url, description, thumbnail, published } = req.body;
  if (!title || !url) {
    res.status(400).json({ error: "Title and URL are required" });
    return;
  }
  const videos = readJsonFile(VIDEOS_PATH, []);
  const newVideo = {
    id: `vid_${Date.now()}`,
    title: title.trim(),
    url: url.trim(),
    description: description?.trim() || "",
    thumbnail: thumbnail?.trim() || "",
    published: published !== false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  videos.unshift(newVideo);
  writeJsonFile(VIDEOS_PATH, videos);
  res.status(201).json(newVideo);
});
app.patch("/api/videos/:id/toggle", requireAuth, (req, res) => {
  const { id } = req.params;
  const videos = readJsonFile(VIDEOS_PATH, []);
  const video = videos.find((v) => v.id === id);
  if (!video) {
    res.status(404).json({ error: "Video not found" });
    return;
  }
  video.published = !video.published;
  writeJsonFile(VIDEOS_PATH, videos);
  res.json(video);
});
app.delete("/api/videos/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  let videos = readJsonFile(VIDEOS_PATH, []);
  const exists = videos.some((v) => v.id === id);
  if (!exists) {
    res.status(404).json({ error: "Video not found" });
    return;
  }
  videos = videos.filter((v) => v.id !== id);
  writeJsonFile(VIDEOS_PATH, videos);
  res.json({ success: true, message: "Video deleted" });
});
app.post(
  "/api/upload/video",
  requireAuth,
  (req, res, next) => {
    uploadVideo.single("video")(req, res, (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE" || err.message && err.message.toLowerCase().includes("large")) {
          return res.status(400).json({
            error: "Video file exceeds the 60 MB limit. Videos larger than 60 MB cannot be uploaded. The system has rejected this file."
          });
        }
        return res.status(400).json({ error: err.message || "Video upload error" });
      }
      next();
    });
  },
  async (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No video file selected" });
      return;
    }
    const title = req.body.title || path.parse(req.file.originalname).name;
    const description = req.body.description || "";
    const published = req.body.published !== "false" && req.body.published !== false;
    const rawPath = req.file.path;
    const compressedFilename = `video-${Date.now()}-${Math.round(Math.random() * 1e6)}.mp4`;
    const compressedPath = path.resolve(VIDEOS_UPLOADS_DIR, compressedFilename);
    const thumbnailFilename = `thumb-${Date.now()}.jpg`;
    const thumbnailPath = path.resolve(THUMBNAILS_UPLOADS_DIR, thumbnailFilename);
    try {
      const compressionResult = await compressVideoWithFfmpeg(rawPath, compressedPath, thumbnailPath);
      const videoUrl = `/uploads/videos/${compressedFilename}`;
      const thumbnailUrl = fs.existsSync(thumbnailPath) ? `/uploads/thumbnails/${thumbnailFilename}` : "";
      const videos = readJsonFile(VIDEOS_PATH, []);
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
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      videos.unshift(newVideo);
      writeJsonFile(VIDEOS_PATH, videos);
      res.status(201).json({
        success: true,
        video: newVideo,
        message: compressionResult.compressed ? `Video uploaded and compressed maintaining 85-90% quality (Size: ${(compressionResult.compressedSize / (1024 * 1024)).toFixed(1)} MB).` : "Video uploaded successfully."
      });
    } catch (err) {
      console.error("Failed to process uploaded video:", err);
      res.status(500).json({ error: err.message || "Failed to process uploaded video" });
    }
  }
);
app.post("/api/upload/hero", requireAuth, uploadHero.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No image uploaded" });
    return;
  }
  const schoolData = readJsonFile(SCHOOL_DATA_PATH, {});
  const heroUrl = `/uploads/hero/${req.file.filename}`;
  if (!schoolData.hero) schoolData.hero = {};
  schoolData.hero.heroImageUrl = heroUrl;
  writeJsonFile(SCHOOL_DATA_PATH, schoolData);
  res.json({ success: true, heroImageUrl: heroUrl });
});
app.post("/api/admissions/apply", (req, res) => {
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
    additionalNotes
  } = req.body;
  if (!studentFullName || !parentFullName || !parentPhone || !sectionApplied) {
    res.status(400).json({ error: "Please provide all required fields" });
    return;
  }
  const applications = readJsonFile(APPLICATIONS_PATH, []);
  const newApp = {
    id: `app_${Date.now()}`,
    applicationNumber: `ALN-${(/* @__PURE__ */ new Date()).getFullYear()}-${Math.floor(1e3 + Math.random() * 9e3)}`,
    studentFullName: studentFullName.trim(),
    gender: gender || "Not Specified",
    dateOfBirth: dateOfBirth || "",
    sectionApplied,
    entryClass: entryClass || "",
    boardingPreference: boardingPreference || "Day",
    parentFullName: parentFullName.trim(),
    parentPhone: parentPhone.trim(),
    parentEmail: parentEmail?.trim() || "",
    residentialAddress: residentialAddress?.trim() || "",
    previousSchool: previousSchool?.trim() || "",
    additionalNotes: additionalNotes?.trim() || "",
    status: "Pending",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  applications.unshift(newApp);
  writeJsonFile(APPLICATIONS_PATH, applications);
  res.status(201).json({
    success: true,
    applicationNumber: newApp.applicationNumber,
    message: "Admission application received successfully"
  });
});
app.get("/api/admissions/applications", requireAuth, (_req, res) => {
  const applications = readJsonFile(APPLICATIONS_PATH, []);
  res.json(applications);
});
app.patch("/api/admissions/applications/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const applications = readJsonFile(APPLICATIONS_PATH, []);
  const application = applications.find((a) => a.id === id);
  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  if (status) application.status = status;
  if (remarks !== void 0) application.remarks = remarks;
  writeJsonFile(APPLICATIONS_PATH, applications);
  res.json(application);
});
app.post("/api/contact", (req, res) => {
  const { name, phone, email, subject, message } = req.body;
  if (!name || !phone || !message) {
    res.status(400).json({ error: "Name, phone number, and message are required" });
    return;
  }
  const messages = readJsonFile(MESSAGES_PATH, []);
  const newMsg = {
    id: `msg_${Date.now()}`,
    name: name.trim(),
    phone: phone.trim(),
    email: email?.trim() || "",
    subject: subject?.trim() || "General Inquiry",
    message: message.trim(),
    read: false,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  messages.unshift(newMsg);
  writeJsonFile(MESSAGES_PATH, messages);
  res.status(201).json({ success: true, message: "Message sent successfully" });
});
app.get("/api/contact/messages", requireAuth, (_req, res) => {
  const messages = readJsonFile(MESSAGES_PATH, []);
  res.json(messages);
});
app.patch("/api/contact/messages/:id/read", requireAuth, (req, res) => {
  const { id } = req.params;
  const messages = readJsonFile(MESSAGES_PATH, []);
  const msg = messages.find((m) => m.id === id);
  if (!msg) {
    res.status(404).json({ error: "Message not found" });
    return;
  }
  msg.read = true;
  writeJsonFile(MESSAGES_PATH, messages);
  res.json(msg);
});
app.delete("/api/contact/messages/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  let messages = readJsonFile(MESSAGES_PATH, []);
  messages = messages.filter((m) => m.id !== id);
  writeJsonFile(MESSAGES_PATH, messages);
  res.json({ success: true, message: "Message deleted" });
});
var geminiClient = process.env.GEMINI_API_KEY ? new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
}) : null;
function buildSchoolKnowledgeContext(schoolData) {
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
Official School Name: ${general.name || "Al-Niima Academy"}
Motto: "${general.motto || "Standard Education & Morals for World-Class Leadership"}"
Location: ${general.location || "Dutse, Jigawa State, Nigeria"}
Detailed Physical Address: ${general.address || "Behind Godiya Miyetti Housing Estate, Jigawar Tsada, Dutse, Jigawa State"}
Official Phone Numbers: ${(general.phoneNumbers || ["08038382557", "08021358445"]).join(", ")}
Official WhatsApp Numbers: +234 803 838 2557 and +234 802 135 8445
Official Email: ${general.email || "info@alniimaacademy.com.ng"}
Official Website: ${general.website || "www.alniimaacademy.com.ng"}

Mission: ${mission.mission || "We are firm in our commitment to provide standard and qualitative education to your child."}
Vision: ${mission.vision || "To develop in children the ability to integrate in larger society and meet worldwide educational challenges."}

Educational Sections:
${sections.map((s) => `- ${s.title} (${s.category}, Age/Class: ${s.ageRange}): ${s.description}`).join("\n")}

Boarding School Facilities:
- Boys and Girls: Strictly separate hostels for male and female students with caring house parents/matrons.
- Security: 24/7 dedicated security personnel and restricted entry.
- Water Supply: Constant running potable water throughout premises.
- Meals: Wholesome, balanced, and hygienic meals prepared daily by professional caterers.
- Study & Prep: Structured evening and morning prep sessions under teacher guidance.
${(boarding.features || []).map((f) => `- ${f.title}: ${f.detail}`).join("\n")}

Admissions & Application Process:
- Status: Admissions currently ongoing for the new academic session.
- Requirements:
${(admissions.requirements || []).map((r) => `  * ${r}`).join("\n")}
- 5-Step Admission Flow:
${(admissions.steps || []).map((s) => `  ${s.step}. ${s.title}: ${s.desc}`).join("\n")}
- Contact for admissions: 08038382557 or WhatsApp +234 803 838 2557.

Facilities & Infrastructure:
${facilities.map((f) => `- ${f.name} (${f.category}): ${f.description}`).join("\n")}

School Clubs & Co-Curricular Activities:
${clubs.map((c) => `- ${c.name} (${c.category}): ${c.description}`).join("\n")}

Core Ethos and Values:
${ethos.map((e) => `- ${e.title}: ${e.description}`).join("\n")}
`;
}
function isHausaText(query) {
  return query.includes("sannu") || query.includes("barka") || query.includes("ina ne") || query.includes("ina makaranta") || query.includes("wuri") || query.includes("adireshi") || query.includes("shiga") || query.includes("neman") || query.includes("daukar") || query.includes("dalibai") || query.includes("kudin") || query.includes("kudi") || query.includes("nawa") || query.includes("dakunan") || query.includes("kwana") || query.includes("karatu") || query.includes("darussa") || query.includes("malamai") || query.includes("yara") || query.includes("makaranta") || query.includes("hostel") || query.includes("abinci") || query.includes("aji") || query.includes("shekara") || query.includes("lamba") || query.includes("tsaro") || query.includes("yaya") || query.includes("ina") || query.includes("yaushe") || query.includes("godiya") || query.includes("nagode");
}
function isArabicText(query) {
  return /[\u0600-\u06FF]/.test(query) || query.includes("salam") || query.includes("marhaban") || query.includes("ahlan") || query.includes("shukran");
}
function isYorubaText(query) {
  return query.includes("bawo") || query.includes("ekaro") || query.includes("ekasan") || query.includes("nibo") || query.includes("adirese") || query.includes("owo ile-iwe") || query.includes("iforukosile") || query.includes("eko") || query.includes("e kaabo") || query.includes("se daadaa");
}
function isFrenchText(query) {
  return query.includes("bonjour") || query.includes("salut") || query.includes("comment") || query.includes("o\xF9") || query.includes("ou se") || query.includes("\xE9cole") || query.includes("ecole") || query.includes("adresse") || query.includes("frais") || query.includes("scolarit\xE9") || query.includes("scolarite") || query.includes("dortoir") || query.includes("internat") || query.includes("inscription") || query.includes("merci");
}
function generateInstantKnowledgeFallback(message, schoolData, language) {
  const rawText = message.trim();
  const query = rawText.toLowerCase();
  const general = schoolData?.general || {};
  const phone1 = general.phoneNumbers?.[0] || "08038382557";
  const phone2 = general.phoneNumbers?.[1] || "08021358445";
  const address = general.address || "Behind Godiya Miyetti Housing Estate, Jigawar Tsada, Dutse, Jigawa State";
  if (language === "ha" || isHausaText(query)) {
    if (query.includes("ina") || query.includes("wuri") || query.includes("adireshi") || query.includes("dutse") || query.includes("jigawa") || query.includes("where") || query.includes("location")) {
      return `**\u{1F4CD} Wurin Da Makarantar Al-Niima Academy Take:**
Makarantar tana garin **Dutse, Jihar Jigawa**.
**Cikakken Adireshi:** ${address} *(Bayan Godiya Miyetti Housing Estate, Jigawar Tsada, Dutse)*.

- Lokacin aiki da ziyara: Litinin zuwa Juma'a (8:00 na safe zuwa 4:00 na yamma).
- \u{1F4DE} Lambar Waya: **${phone1}** / **${phone2}**
- \u{1F4AC} WhatsApp Kai Tsaye: **+234 ${phone1.replace(/^0/, "")}**`;
    }
    if (query.includes("shiga") || query.includes("neman") || query.includes("rajista") || query.includes("form") || query.includes("fam") || query.includes("takarda") || query.includes("admission") || query.includes("dauka") || query.includes("apply") || query.includes("enroll")) {
      return `**\u{1F4DD} Shiga Makarantar Al-Niima Academy (Admissions):**
Ba a cika fom a intanet. Duk wanda ke son neman shiga ko sanya \u0257alibi a Al-Niima Academy:
1. **Ziyartar Harabar Makaranta:** Ziyarci ofishin makaranta a Jigawar Tsada, Dutse (Bayan Godiya Miyetti Housing Estate) don kar\u0253ar takardar neman shiga ta zahiri (Admission Form) da bayanan makaranta (Prospectus).
2. **Kiran Waya ko WhatsApp:** Kira ko turo sa\u0199o zuwa: **+234 ${phone1.replace(/^0/, "")}** ko **${phone2}**.
3. **Aika Imel:** Turo sa\u0199o zuwa: **info@alniimaacademy.com**.

Makarantar tana \u0257aukar sababbin \u0257alibai a dukkan matakai (Cr\xE8che, Nursery, Primary, JSS, SSS, da A-Levels).`;
    }
    if (query.includes("kwana") || query.includes("hostel") || query.includes("dakunan") || query.includes("daki") || query.includes("abinci") || query.includes("boarding") || query.includes("tsaro")) {
      return `**\u{1F3EB} Dakunan Kwanan \u018Aalibai (Boarding School):**
Makarantar Al-Niima Academy tana da ingantattun dakunan kwanan \u0257alibai na musamman:
- **Rarrabe:** Dakunan kwanan maza daban, na mata daban tare da kulawar iyayen daki (House Masters da Matrons).
- **Tsaro:** Jami'an tsaro na kula da makarantar sa'o'i 24 kowace rana.
- **Ruwa da Wuta:** Isasshen ruwan famfo mai tsabta da wutar lantarki.
- **Abinci:** Abinci mai gina jiki sau uku a rana wanda \u0199wararrun masu girki ke shiryawa.
- **Karatu da Tarbiyya:** Tsari mai kyau na bitar karatu (Prep) safe da yamma tare da kula da tarbiyyar addinin Musulunci da ladabi.`;
    }
    if (query.includes("kudi") || query.includes("kudin") || query.includes("nawa") || query.includes("fee") || query.includes("cost") || query.includes("biyan")) {
      return `**\u{1F4B3} Ku\u0257in Makaranta (School Fees):**
Ku\u0257in makarantar Al-Niima Academy mai sau\u0199i ne kuma yana tafiya daidai da ingancin ilimi, tarbiyya, da kayan aiki na zamani da ake bayarwa (na \u0257aliban kwana da na masu zuwa daga gida).

Domin samun cikakken jadawalin ku\u0257in aji da kake so don yaranka:
- \u{1F4AC} Tuntubi Akanta ta WhatsApp: **+234 ${phone1.replace(/^0/, "")}**
- \u{1F4DE} Kira kai tsaye: **${phone1}** ko **${phone2}**`;
    }
    if (query.includes("aji") || query.includes("matakai") || query.includes("class") || query.includes("section") || query.includes("primary") || query.includes("secondary")) {
      return `**\u{1F393} Matakan Karatu a Al-Niima Academy:**
1. **Cr\xE8che:** Kula da jarirai da \u0199ananan yara cikin tsafta.
2. **Kindergarten & Nursery:** Koyon karatu, rubutu, lambobi, da tarbiyya.
3. **Primary (1 \u2013 6):** Ingantaccen ilimin firamare, kimiyya da fasahar kwamfuta (ICT).
4. **Junior Secondary (JSS 1 \u2013 3):** Shirye-shiryen jarrabawar BECE.
5. **Senior Secondary (SSS 1 \u2013 3):** Fannonin Kimiyya (Science), Fasaha (Arts), da Kasuwanci (Commercial) don WAEC, NECO da JAMB.
6. **A-Levels & IJMB:** Karatun share fagen shiga jami'a kai tsaye mataki na biyu.`;
    }
    if (query.includes("lamba") || query.includes("waya") || query.includes("whatsapp") || query.includes("kira") || query.includes("contact")) {
      return `**\u{1F4DE} Lambobin Tuntubar Al-Niima Academy:**
- **Lambar WhatsApp:** **+234 ${phone1.replace(/^0/, "")}**
- **Layin Waya:** **${phone1}** ko **${phone2}**
- **Imel:** ${general.email || "info@alniimaacademy.com.ng"}
- **Adireshi:** ${address}, Dutse, Jihar Jigawa.
\u{1F4A1} Zaku iya danna koren madannin WhatsApp da ke kan fuskar shafin nan don magana kai tsaye!`;
    }
    return `**Barka da zuwa Al-Niima Academy AI Assistant!**
Ina nan don amsa tambayoyinku kai tsaye a **Harshen Hausa** game da makarantarmu da ke Dutse, Jihar Jigawa.

Kuna iya tambaya kan:
- \u{1F4DD} **Shiga makaranta (Admissions da Fam)**
- \u{1F3EB} **Dakunan kwanan \u0257alibai (Boarding na maza da mata)**
- \u{1F4B3} **Ku\u0257in makaranta**
- \u{1F4CD} **Wurin da makarantar take a Dutse**
- \u{1F4DE} **Lambar WhatsApp:** **+234 ${phone1.replace(/^0/, "")}**

Wace tambaya kuke da ita a yanzu?`;
  }
  if (language === "ar" || isArabicText(query)) {
    if (query.includes("\u0623\u064A\u0646") || query.includes("\u0645\u0648\u0642\u0639") || query.includes("\u0639\u0646\u0648\u0627\u0646") || query.includes("\u0645\u0643\u0627\u0646") || query.includes("location")) {
      return `**\u{1F4CD} \u0645\u0648\u0642\u0639 \u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u0627\u0644\u0646\u0639\u0645\u0629 (Al-Niima Academy):**
\u062A\u0642\u0639 \u0627\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u0641\u064A \u0645\u062F\u064A\u0646\u0629 **\u062F\u0648\u062A\u0633\u064A\u060C \u0648\u0644\u0627\u064A\u0629 \u062C\u064A\u063A\u0627\u0648\u0629\u060C \u0646\u064A\u062C\u064A\u0631\u064A\u0627**.
**\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062A\u0641\u0635\u064A\u0644\u064A:** ${address} *(\u062E\u0644\u0641 \u0645\u062C\u0645\u0639 \u063A\u0648\u062F\u064A\u0627 \u0645\u064A\u062A\u064A \u0627\u0644\u0633\u0643\u0646\u064A\u060C \u062C\u064A\u063A\u0627\u0648\u0627\u0631 \u062A\u0633\u0627\u062F\u0627\u060C \u062F\u0648\u062A\u0633\u064A)*.

- \u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0631\u0633\u0645\u064A\u0629: \u0645\u0646 \u0627\u0644\u0625\u062B\u0646\u064A\u0646 \u0625\u0644\u0649 \u0627\u0644\u062C\u0645\u0639\u0629 (8:00 \u0635\u0628\u0627\u062D\u0627\u064B \u2013 4:00 \u0645\u0633\u0627\u0621\u064B).
- \u{1F4DE} \u0627\u0644\u0647\u0627\u062A\u0641: **${phone1}** / **${phone2}**
- \u{1F4AC} \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628 \u0627\u0644\u0645\u0628\u0627\u0634\u0631: **+234 ${phone1.replace(/^0/, "")}**`;
    }
    if (query.includes("\u0642\u0628\u0648\u0644") || query.includes("\u062A\u0633\u062C\u064A\u0644") || query.includes("\u062A\u0642\u062F\u064A\u0645") || query.includes("\u0627\u0633\u062A\u0645\u0627\u0631\u0629") || query.includes("admission")) {
      return `**\u{1F4DD} \u0627\u0644\u0642\u0628\u0648\u0644 \u0648\u0627\u0644\u062A\u0633\u062C\u064A\u0644 \u0641\u064A \u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u0627\u0644\u0646\u0639\u0645\u0629:**
\u0628\u0627\u0628 \u0627\u0644\u0642\u0628\u0648\u0644 \u0645\u0641\u062A\u0648\u062D \u0627\u0644\u0622\u0646 \u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0631\u0627\u062D\u0644 \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629 (\u0627\u0644\u062D\u0636\u0627\u0646\u0629\u060C \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A\u0629\u060C \u0627\u0644\u0645\u062A\u0648\u0633\u0637\u0629\u060C \u0627\u0644\u062B\u0627\u0646\u0648\u064A\u0629\u060C \u0648\u062F\u0631\u0627\u0633\u0627\u062A A-Levels).

**\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0648\u0627\u0644\u062A\u0633\u062C\u064A\u0644:**
\u0644\u0627 \u064A\u062A\u0645 \u0627\u0644\u062A\u0642\u062F\u064A\u0645 \u0639\u0628\u0631 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A. \u0644\u0644\u062A\u0633\u062C\u064A\u0644 \u0623\u0648 \u0627\u0644\u062A\u0642\u062F\u064A\u0645:
1. **\u0632\u064A\u0627\u0631\u0629 \u0645\u0642\u0631 \u0627\u0644\u0645\u062F\u0631\u0633\u0629:** \u0627\u0644\u062A\u0648\u062C\u0647 \u0645\u0628\u0627\u0634\u0631\u0629 \u0644\u0645\u0643\u062A\u0628 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0641\u064A \u062F\u0648\u062A\u0633\u064A \u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0633\u062A\u0645\u0627\u0631\u0629 \u0627\u0644\u0642\u0628\u0648\u0644 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0648\u0627\u0644\u062F\u0644\u064A\u0644 \u0627\u0644\u062A\u0639\u0631\u064A\u0641\u064A.
2. **\u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u0647\u0627\u062A\u0641 / \u0648\u0627\u062A\u0633\u0627\u0628:** \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639 \u0645\u0643\u062A\u0628 \u0627\u0644\u0642\u0628\u0648\u0644 \u0639\u0628\u0631: **+234 ${phone1.replace(/^0/, "")}** \u0623\u0648 **${phone2}**.
3. **\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A:** **info@alniimaacademy.com**.`;
    }
    if (query.includes("\u0633\u0643\u0646") || query.includes("\u062F\u0627\u062E\u0644\u064A") || query.includes("\u0625\u0642\u0627\u0645\u0629") || query.includes("\u0648\u062C\u0628\u0627\u062A") || query.includes("hostel")) {
      return `**\u{1F3EB} \u0627\u0644\u0633\u0643\u0646 \u0627\u0644\u062F\u0627\u062E\u0644\u064A (\u0642\u0633\u0645 \u0627\u0644\u0628\u0646\u064A\u0646 \u0648\u0642\u0633\u0645 \u0627\u0644\u0628\u0646\u0627\u062A):**
\u062A\u0648\u0641\u0631 \u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u0627\u0644\u0646\u0639\u0645\u0629 \u0633\u0643\u0646\u0627\u064B \u062F\u0627\u062E\u0644\u064A\u0627\u064B \u0645\u062A\u0645\u064A\u0632\u0627\u064B:
- \u0645\u0633\u0627\u0643\u0646 \u0645\u0646\u0641\u0635\u0644\u0629 \u062A\u0645\u0627\u0645\u0627\u064B \u0644\u0644\u0628\u0646\u064A\u0646 \u0648\u0627\u0644\u0628\u0646\u0627\u062A \u062A\u062D\u062A \u0625\u0634\u0631\u0627\u0641 \u062A\u0631\u0628\u0648\u064A \u0639\u0644\u0649 \u0645\u062F\u0627\u0631 \u0627\u0644\u0633\u0627\u0639\u0629.
- \u062D\u0631\u0627\u0633\u0629 \u0648\u0623\u0645\u0646 \u0645\u0633\u062A\u0645\u0631 24/7.
- \u0645\u064A\u0627\u0647 \u0646\u0642\u064A\u0629 \u0635\u0627\u0644\u062D\u0629 \u0644\u0644\u0634\u0631\u0628 \u0648\u0643\u0647\u0631\u0628\u0627\u0621 \u0645\u0646\u062A\u0638\u0645\u0629.
- \u062B\u0644\u0627\u062B \u0648\u062C\u0628\u0627\u062A \u063A\u0630\u0627\u0626\u064A\u0629 \u0635\u062D\u064A\u0629 \u0648\u0645\u062A\u0643\u0627\u0645\u0644\u0629 \u064A\u0648\u0645\u064A\u0627\u064B.
- \u062D\u0644\u0642\u0627\u062A \u0644\u062A\u062D\u0641\u064A\u0638 \u0627\u0644\u0642\u0631\u0622\u0646 \u0627\u0644\u0643\u0631\u064A\u0645 \u0648\u0627\u0644\u0645\u0630\u0627\u0643\u0631\u0629 \u0627\u0644\u0635\u0628\u0627\u062D\u064A\u0629 \u0648\u0627\u0644\u0645\u0633\u0627\u0626\u064A\u0629.`;
    }
    if (query.includes("\u0631\u0633\u0648\u0645") || query.includes("\u062A\u0643\u0644\u0641\u0629") || query.includes("\u0643\u0645") || query.includes("\u0633\u0639\u0631") || query.includes("fees")) {
      return `**\u{1F4B3} \u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629:**
\u062A\u0642\u062F\u0645 \u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u0627\u0644\u0646\u0639\u0645\u0629 \u062A\u0639\u0644\u064A\u0645\u0627\u064B \u0645\u062A\u0645\u064A\u0632\u0627\u064B \u0628\u0623\u0633\u0639\u0627\u0631 \u0645\u0646\u0627\u0633\u0628\u0629 \u0648\u0645\u0639\u062A\u062F\u0644\u0629 \u062A\u0644\u0627\u0626\u0645 \u062C\u0648\u062F\u0629 \u0627\u0644\u062A\u0639\u0644\u064A\u0645 \u0648\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0645\u0642\u062F\u0645\u0629 (\u0644\u0644\u0637\u0644\u0627\u0628 \u0627\u0644\u0646\u0647\u0627\u0631\u064A\u064A\u0646 \u0648\u0627\u0644\u062F\u0627\u062E\u0644\u064A\u064A\u0646).
\u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u062C\u062F\u0648\u0644 \u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u062E\u0627\u0635 \u0628\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0627\u0628\u0646\u0643\u0645:
- \u062A\u0648\u0627\u0635\u0644 \u0639\u0628\u0631 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628 \u0645\u0639 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A: **+234 ${phone1.replace(/^0/, "")}**
- \u0623\u0648 \u0627\u062A\u0635\u0644 \u0639\u0644\u0649: **${phone1}**`;
    }
    return `**\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 \u0648\u0631\u062D\u0645\u0629 \u0627\u0644\u0644\u0647 \u0648\u0628\u0631\u0643\u0627\u062A\u0647! \u0645\u0631\u062D\u0628\u0627\u064B \u0628\u0643\u0645 \u0641\u064A \u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629 \u0627\u0644\u0646\u0639\u0645\u0629 (Al-Niima Academy)**
\u0623\u0646\u0627 \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0630\u0643\u064A \u0644\u0644\u0623\u0643\u0627\u062F\u064A\u0645\u064A\u0629\u060C \u0648\u064A\u0633\u0639\u062F\u0646\u064A \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0639\u0646 \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A\u0643\u0645 \u0628\u0627\u0644\u0644\u063A\u0629 **\u0627\u0644\u0639\u0631\u0628\u064A\u0629**:
- \u{1F4DD} \u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0642\u0628\u0648\u0644 \u0648\u0627\u0644\u062A\u0633\u062C\u064A\u0644
- \u{1F3EB} \u0627\u0644\u0633\u0643\u0646 \u0627\u0644\u062F\u0627\u062E\u0644\u064A \u0627\u0644\u0645\u0646\u0641\u0635\u0644 \u0644\u0644\u0628\u0646\u064A\u0646 \u0648\u0627\u0644\u0628\u0646\u0627\u062A
- \u{1F4B3} \u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629 \u0627\u0644\u0645\u0639\u062A\u062F\u0644\u0629
- \u{1F4CD} \u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u062F\u0631\u0633\u0629 \u0641\u064A \u062F\u0648\u062A\u0633\u064A\u060C \u0648\u0644\u0627\u064A\u0629 \u062C\u064A\u063A\u0627\u0648\u0629
- \u{1F4DE} \u0644\u0644\u062A\u0648\u0627\u0635\u0644 \u0627\u0644\u0641\u0648\u0631\u064A \u0639\u0628\u0631 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628: **+234 ${phone1.replace(/^0/, "")}**

\u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643\u0645 \u0627\u0644\u064A\u0648\u0645\u061F`;
  }
  if (language === "yo" || isYorubaText(query)) {
    if (query.includes("nibo") || query.includes("adirese") || query.includes("ibi") || query.includes("location")) {
      return `**\u{1F4CD} Ibi ti Al-Niima Academy wa:**
Ile-iwe naa wa ni ilu **Dutse, Ipinle Jigawa, Naijiria**.
**Adir\u1EB9si:** ${address} *(L\u1EB9hin Godiya Miyetti Housing Estate, Jigawar Tsada, Dutse)*.
- \u{1F4DE} WhatsApp tabi Ipe: **+234 ${phone1.replace(/^0/, "")}**`;
    }
    if (query.includes("iforukosile") || query.includes("admission") || query.includes("gba") || query.includes("foomu")) {
      return `**\u{1F4DD} Gbigba W\u1ECDle si Al-Niima Academy (Admissions):**
Gbigba w\u1ECDle \u1E63i wa ni sisi fun gbogbo aw\u1ECDn kilasi (Cr\xE8che, Nursery, Primary, JSS, SSS, ati A-Levels).
1. Gba f\u1ECD\u1ECDmu lori ayelujara tabi ni \u1ECDfiisi ile-iwe ni Dutse.
2. \u1ECCm\u1ECD yoo k\u1ECD idanwo igbelew\u1ECDn iw\u1ECDle.
3. San owo ile-iwe ki o b\u1EB9r\u1EB9 \u1EB9k\u1ECD.
Fun iranl\u1ECDw\u1ECD l\u1EB9s\u1EB9k\u1EB9s\u1EB9 lori WhatsApp: **+234 ${phone1.replace(/^0/, "")}**.`;
    }
    if (query.includes("owo") || query.includes("elo") || query.includes("fees")) {
      return `**\u{1F4B3} Owo Ile-iwe (School Fees):**
Owo ile-iwe Al-Niima Academy wa ni iw\u1ECDntunw\u1ECDnsi to baramu p\u1EB9lu \u1EB9k\u1ECD didara ati it\u1ECDju \u1ECDm\u1ECD.
Lati gba alaye kikun nipa owo kilasi ti \u1EB9 f\u1EB9:
- Kan si wa lori WhatsApp: **+234 ${phone1.replace(/^0/, "")}**`;
    }
    return `**\u1EB8 n l\u1EB9 o! Kaab\u1ECD si Al-Niima Academy AI Assistant.**
Mo wa nibi lati ran yin l\u1ECDw\u1ECD ni **\xC8d\xE8 Yor\xF9b\xE1**:
- \u{1F4DD} Gbigba w\u1ECDle (Admissions)
- \u{1F3EB} Ile gbigbe \u1ECDm\u1ECDkunrin ati \u1ECDm\u1ECDbinrin (Boarding)
- \u{1F4CD} Ibi ti ile-iwe wa ni Dutse, Jigawa
- \u{1F4DE} WhatsApp: **+234 ${phone1.replace(/^0/, "")}**

Kini \u1EB9 f\u1EB9 lati beere loni?`;
  }
  if (language === "fr" || isFrenchText(query)) {
    if (query.includes("o\xF9") || query.includes("adresse") || query.includes("localisation") || query.includes("location")) {
      return `**\u{1F4CD} Emplacement d'Al-Niima Academy:**
L'acad\xE9mie est situ\xE9e \xE0 **Dutse, \xC9tat de Jigawa, Nig\xE9ria**.
**Adresse:** ${address} *(Derri\xE8re le lotissement r\xE9sidentiel Godiya Miyetti, Jigawar Tsada, Dutse)*.
\u{1F4DE} Contact WhatsApp: **+234 ${phone1.replace(/^0/, "")}**`;
    }
    if (query.includes("admission") || query.includes("inscription") || query.includes("formulaire")) {
      return `**\u{1F4DD} Admissions \xE0 Al-Niima Academy:**
Les admissions sont actuellement ouvertes pour la nouvelle session acad\xE9mique (Cr\xE8che, Maternelle, Primaire, Coll\xE8ge, Lyc\xE9e et A-Levels).
1. Obtenez le formulaire en ligne ou \xE0 l'administration \xE0 Dutse.
2. L'\xE9l\xE8ve passe le test d'\xE9valuation d'entr\xE9e.
3. Finalisez l'inscription et le paiement des frais.
WhatsApp direct pour les admissions: **+234 ${phone1.replace(/^0/, "")}**.`;
    }
    if (query.includes("internat") || query.includes("logement") || query.includes("dortoir")) {
      return `**\u{1F3EB} Internat S\xE9par\xE9 Gar\xE7ons & Filles:**
Al-Niima Academy dispose d'un internat de haut niveau:
- Dortoirs strictement s\xE9par\xE9s pour filles et gar\xE7ons avec encadrement permanent.
- S\xE9curit\xE9 renforc\xE9e 24h/24.
- Eau potable continue et repas \xE9quilibr\xE9s trois fois par jour.`;
    }
    if (query.includes("frais") || query.includes("scolarit\xE9") || query.includes("prix") || query.includes("combien")) {
      return `**\u{1F4B3} Frais de Scolarit\xE9:**
Al-Niima Academy propose des tarifs tr\xE8s comp\xE9titifs et adapt\xE9s \xE0 la qualit\xE9 de l'enseignement.
Pour obtenir la grille tarifaire compl\xE8te:
- Contactez notre comptabilit\xE9 sur WhatsApp: **+234 ${phone1.replace(/^0/, "")}**`;
    }
    return `**Bonjour et bienvenue \xE0 l'Acad\xE9mie Al-Niima!**
Je suis votre assistant IA francophone. Je r\xE9ponds \xE0 vos questions sur:
- \u{1F4DD} Les admissions et inscriptions
- \u{1F3EB} L'internat gar\xE7ons et filles
- \u{1F4CD} L'adresse \xE0 Dutse, Jigawa
- \u{1F4DE} Ligne WhatsApp: **+234 ${phone1.replace(/^0/, "")}**

Comment puis-je vous aider aujourd'hui?`;
  }
  if (query.includes("admiss") || query.includes("apply") || query.includes("register") || query.includes("enroll") || query.includes("form") || query.includes("requirement") || query.includes("entrance")) {
    return `**\u{1F4DD} Admissions at Al-Niima Academy (Dutse, Jigawa State)**

Admissions are **open** for all levels (Cr\xE8che, Nursery, Primary, JSS, SSS, and A'Levels).

**How to Apply / Enroll:**
We do not use online forms. Anyone wishing to apply or enroll should:
1. **Visit the School Campus:** Obtain the official physical admission form and student prospectus at the administrative office in Dutse (Behind Godiya Miyetti Housing Estate, Jigawar Tsada).
2. **Contact via Telephone / WhatsApp:** Call or WhatsApp our admissions desk at **+234 ${phone1.replace(/^0/, "")}** or **${phone2}**.
3. **Email Inquiries:** Contact **info@alniimaacademy.com**.`;
  }
  if (query.includes("board") || query.includes("hostel") || query.includes("dorm") || query.includes("stay") || query.includes("food") || query.includes("catering")) {
    return `**\u{1F3EB} Boarding Facilities at Al-Niima Academy**

We offer comfortable, safe, and disciplined boarding for both male and female secondary students:
- **Strictly Separate Hostels:** Dedicated hostels for boys and girls with caring house parents and matrons.
- **Security:** 24/7 round-the-clock security surveillance and restricted access.
- **Amenities:** Constant clean potable water, reliable electricity, and medical first-aid.
- **Meals:** Three hygienic, wholesome, and balanced meals daily prepared by qualified caterers.
- **Supervised Prep:** Guided evening and morning study sessions.`;
  }
  if (query.includes("where") || query.includes("location") || query.includes("address") || query.includes("find") || query.includes("dutse") || query.includes("jigawa") || query.includes("direction")) {
    return `**\u{1F4CD} Campus Location & Address**

**Al-Niima Academy** is located in:
\u{1F3E2} **${address}**
\u{1F30D} **Dutse, Jigawa State, Nigeria**
*(Directly behind Godiya Miyetti Housing Estate, Jigawar Tsada)*

- \u{1F4DE} **Phone & WhatsApp:** **+234 ${phone1.replace(/^0/, "")}** / **${phone2}**
- \u2709\uFE0F **Email:** ${general.email || "info@alniimaacademy.com.ng"}
- \u23F0 **Office Visiting Hours:** Monday \u2013 Friday, 8:00 AM \u2013 4:00 PM`;
  }
  if (query.includes("section") || query.includes("class") || query.includes("creche") || query.includes("nursery") || query.includes("primary") || query.includes("secondary") || query.includes("jss") || query.includes("sss") || query.includes("alevel")) {
    return `**\u{1F393} Academic Sections at Al-Niima Academy:**
1. **Cr\xE8che (3 Mos \u2013 1.5 Yrs):** Safe, attentive infant care.
2. **Kindergarten (1.5 \u2013 3 Yrs):** Social discovery & foundational numeracy.
3. **Nursery (3 \u2013 5 Yrs):** Phonics, literacy & character grounding.
4. **Primary (Primary 1 \u2013 6):** Core academic curriculum & ICT.
5. **Junior Secondary (JSS 1 \u2013 3):** Prevocational, sciences, and BECE prep.
6. **Senior Secondary (SSS 1 \u2013 3):** Science, Arts & Commercial tracks for WAEC, NECO & JAMB.
7. **A'Level & Direct Entry:** Pre-university program.
8. **Boarding School:** Separate boys & girls hostels.`;
  }
  if (query.includes("fee") || query.includes("cost") || query.includes("tuition") || query.includes("price") || query.includes("how much") || query.includes("payment")) {
    return `**\u{1F4B3} Tuition & Fees Information**

Al-Niima Academy offers competitive, parent-friendly tuition covering qualitative instruction, modern science labs, ICT, and moral education (plus accommodation & catering for boarding students).

For the exact fee structure for your child's prospective grade (Day or Boarding):
- \u{1F4AC} **WhatsApp Accounts Desk:** **+234 ${phone1.replace(/^0/, "")}**
- \u{1F4DE} **Call:** **${phone1}** or **${phone2}**`;
  }
  if (query.includes("contact") || query.includes("phone") || query.includes("whatsapp") || query.includes("call") || query.includes("email")) {
    return `**\u{1F4DE} Contact Al-Niima Academy**

- **WhatsApp Desk:** **+234 ${phone1.replace(/^0/, "")}**
- **Phone Lines:** **${phone1}** / **${phone2}**
- **Address:** ${address}
- **Email:** ${general.email || "info@alniimaacademy.com.ng"}

\u{1F4A1} You can also tap the round green WhatsApp button right on this page to chat instantly with our admissions staff!`;
  }
  if (query.includes("hello") || query.includes("hi") || query.includes("good morning") || query.includes("good afternoon") || query.includes("good evening")) {
    return `**Hello and welcome to Al-Niima Academy!** 

I am your AI Assistant. I speak **English, Hausa, Yoruba, Arabic, and French**.

How can I help you today?
- \u{1F4DD} Admissions & registration
- \u{1F3EB} Boarding facilities (separate boys & girls)
- \u{1F4CD} Campus location in Dutse, Jigawa
- \u{1F4B3} School fees & contact lines`;
  }
  return `Thank you for reaching out to **Al-Niima Academy** (Dutse, Jigawa State).

I can answer questions in **Hausa, English, Yoruba, Arabic, and French** about:
- **Admissions & Entrance Requirements**
- **Male & Female Boarding Hostels**
- **Curriculum & Classes (Cr\xE8che to A'Levels)**
- **School Location & Visiting Hours**

\u{1F4AC} For direct personal assistance, tap the **WhatsApp button** on your screen or message **+234 ${phone1.replace(/^0/, "")}**!`;
}
app.post("/api/ai-assistant", async (req, res) => {
  const { message, history, language } = req.body;
  if (!message || typeof message !== "string" || !message.trim()) {
    res.status(400).json({ error: "A question or message is required" });
    return;
  }
  const schoolData = readJsonFile(SCHOOL_DATA_PATH, {});
  const userText = message.trim();
  const lowerUserText = userText.toLowerCase();
  if (geminiClient) {
    try {
      const knowledgeContext = buildSchoolKnowledgeContext(schoolData);
      let languageEnforcement = "";
      if (language === "ha" || isHausaText(lowerUserText)) {
        languageEnforcement = `
\u{1F6A8} MANDATORY HAUSA LANGUAGE RULE:
The user is communicating in or has selected HAUSA (Harshen Hausa).
You MUST respond 100% in natural, polite, direct HAUSA.
DO NOT use English words or English translations.
Key Hausa Terms:
- Admissions / Neman Shiga: "Shiga Makaranta" ko "\u018Aaukar Sababbin \u018Aalibai"
- Requirements / Sharu\u0257\u0257a: "Abubuwan da ake bu\u0199ata don neman shiga"
- Hostels / Boarding: "Dakunan kwanan \u0257alibai daban na maza da daban na mata"
- Location / Wuri: "Makarantar tana Dutse, Jihar Jigawa (Bayan Godiya Miyetti Housing Estate, Jigawar Tsada)"
- School Fees / Ku\u0257in Makaranta: "Ku\u0257in makaranta mai sau\u0199i ne kuma yana tafiya daidai da ingancin ilimi"
- Phone & WhatsApp: "Lambar waya da WhatsApp: +234 803 838 2557 / 08021358445"`;
      } else if (language === "ar" || isArabicText(lowerUserText)) {
        languageEnforcement = `
\u{1F6A8} MANDATORY ARABIC LANGUAGE RULE:
The user is communicating in or has selected ARABIC.
You MUST respond 100% in standard, polite, fluent ARABIC. DO NOT use English.
Begin with an Islamic greeting when appropriate (\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 \u0648\u0631\u062D\u0645\u0629 \u0627\u0644\u0644\u0647).`;
      } else if (language === "yo" || isYorubaText(lowerUserText)) {
        languageEnforcement = `
\u{1F6A8} MANDATORY YORUBA LANGUAGE RULE:
The user is communicating in or has selected YORUBA.
You MUST respond 100% in respectful, natural YORUBA. DO NOT use English.`;
      } else if (language === "fr" || isFrenchText(lowerUserText)) {
        languageEnforcement = `
\u{1F6A8} MANDATORY FRENCH LANGUAGE RULE:
The user is communicating in or has selected FRENCH.
You MUST respond 100% in polite, accurate FRENCH. DO NOT use English.`;
      } else {
        languageEnforcement = `
Respond in clear, professional English.`;
      }
      const systemInstruction = `You are the official Al-Niima Academy AI Assistant (Dutse, Jigawa State, Nigeria).
You have fluent command of 5 languages: English, Hausa (Harshen Hausa), Arabic (\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629), Yoruba (\xC8d\xE8 Yor\xF9b\xE1), and French (Fran\xE7ais).

${languageEnforcement}

CRITICAL RULES:
- Always answer the user's question directly and concisely with verified school facts.
- Avoid unnecessary conversational fluff, boilerplate preambles, or repetitive disclaimers.
- Always provide accurate facts from the verified school knowledge base below.
- Include the school lines (08038382557, 08021358445) and WhatsApp (+234 803 838 2557) when answering questions on admissions, fees, or location.

VERIFIED SCHOOL FACTS:
${knowledgeContext}`;
      const contents = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-6)) {
          if (item && item.content) {
            contents.push({
              role: item.role === "user" ? "user" : "model",
              parts: [{ text: String(item.content) }]
            });
          }
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: userText }]
      });
      const response = await geminiClient.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.6
        }
      });
      const generatedText = response.text?.trim();
      if (generatedText) {
        res.json({
          success: true,
          answer: generatedText,
          source: "gemini-3.8-flash",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
        return;
      }
    } catch (err) {
      console.warn("Gemini generateContent error, falling back to verified knowledge engine:", err?.message || err);
    }
  }
  const fallbackAnswer = generateInstantKnowledgeFallback(userText, schoolData, language);
  res.json({
    success: true,
    answer: fallbackAnswer,
    source: "alniima-knowledge-engine",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Al-Niima Academy server running at http://0.0.0.0:${PORT}`);
  });
}
if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
  });
}
var server_default = app;
export {
  server_default as default
};
