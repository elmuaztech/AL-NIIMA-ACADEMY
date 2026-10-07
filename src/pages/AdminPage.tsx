import React, { useState, useEffect } from 'react';
import {
  SchoolData,
  GalleryItem,
  VideoItem,
  AdmissionApplication,
  ContactMessage,
  FacilityItem,
} from '../types/school';
import { api, authStorage } from '../services/api';
import { SchoolBadge } from '../components/SchoolBadge';
import {
  Lock,
  LogOut,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Video,
  Inbox,
  Users,
  Settings,
  Bell,
  RefreshCw,
  Save,
  ShieldCheck,
  KeyRound,
  ExternalLink,
  Building2,
  Edit2,
  Search,
  X,
  Sparkles,
} from 'lucide-react';

interface AdminPageProps {
  data: SchoolData;
  onRefreshData: () => Promise<void>;
  onCloseAdmin: () => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (logged: boolean) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  data,
  onRefreshData,
  onCloseAdmin,
  isLoggedIn,
  setIsLoggedIn,
}) => {
  // Login state
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Tabs: 'overview' | 'content' | 'facilities' | 'gallery' | 'videos' | 'admissions' | 'messages' | 'security'
  const [activeTab, setActiveTab] = useState<
    'overview' | 'content' | 'facilities' | 'gallery' | 'videos' | 'admissions' | 'messages' | 'security'
  >('overview');

  // Dashboard Data
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Facility management state
  const [editingFacilityIndex, setEditingFacilityIndex] = useState<number | null>(null);
  const [facilityModalOpen, setFacilityModalOpen] = useState(false);
  const [facilityName, setFacilityName] = useState('');
  const [facilityCategory, setFacilityCategory] = useState('Sports & Recreation');
  const [facilityCustomCategory, setFacilityCustomCategory] = useState('');
  const [facilityDescription, setFacilityDescription] = useState('');
  const [facilityImageUrl, setFacilityImageUrl] = useState('');
  const [facilityImageFile, setFacilityImageFile] = useState<File | null>(null);
  const [facilityImagePreview, setFacilityImagePreview] = useState<string | null>(null);
  const [facilityImageUploading, setFacilityImageUploading] = useState(false);
  const [facilityImageUploadSuccess, setFacilityImageUploadSuccess] = useState<string | null>(null);
  const [facilityToDelete, setFacilityToDelete] = useState<{ index: number; name: string } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'gallery' | 'video' | 'message';
    id: string;
    title: string;
  } | null>(null);
  const [facilitySaving, setFacilitySaving] = useState(false);
  const [facilitySearch, setFacilitySearch] = useState('');
  const [facilityCategoryFilter, setFacilityCategoryFilter] = useState('All');

  // Action status feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Content form state
  const [contentForm, setContentForm] = useState<SchoolData>(data);
  const [contentSaving, setContentSaving] = useState(false);

  // Gallery upload form
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('School Life');
  const [galleryDescription, setGalleryDescription] = useState('');
  const [galleryPublished, setGalleryPublished] = useState(true);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Video form
  const [videoUploadMode, setVideoUploadMode] = useState<'upload' | 'link'>('upload');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFilePreview, setVideoFilePreview] = useState<string | null>(null);
  const [videoFileError, setVideoFileError] = useState<string | null>(null);
  const [uploadingVideoFile, setUploadingVideoFile] = useState(false);
  const [videoUploadProgressText, setVideoUploadProgressText] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [videoPublished, setVideoPublished] = useState(true);
  const [addingVideo, setAddingVideo] = useState(false);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    setContentForm(data);
  }, [data]);

  // Load admin data when logged in
  const loadAdminData = async () => {
    setLoadingItems(true);
    try {
      const [gal, vids, apps, msgs] = await Promise.all([
        api.getGallery(),
        api.getVideos(),
        api.getApplications(),
        api.getMessages(),
      ]);
      setGalleryItems(gal);
      setVideos(vids);
      setApplications(apps);
      setMessages(msgs);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Unauthorized')) {
        handleLogout();
      }
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadAdminData();
    }
  }, [isLoggedIn]);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      await api.login(passwordInput);
      setIsLoggedIn(true);
      setPasswordInput('');
    } catch (err: any) {
      setLoginError(err.message || 'Incorrect password');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setIsLoggedIn(false);
  };

  // Save Content Changes
  const handleSaveContent = async () => {
    setContentSaving(true);
    try {
      await api.updateContent(contentForm);
      await onRefreshData();
      showFeedback('success', 'School information updated successfully! Public website refreshed.');
    } catch (err: any) {
      if (err.message?.includes('expired') || err.message?.includes('Unauthorized')) {
        setIsLoggedIn(false);
      }
      showFeedback('error', err.message || 'Failed to update content');
    } finally {
      setContentSaving(false);
    }
  };

  // Image upload selection
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload Gallery Item
  const handleUploadGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      showFeedback('error', 'Please choose an image file to upload');
      return;
    }

    setUploadingGallery(true);
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('title', galleryTitle);
    formData.append('category', galleryCategory);
    formData.append('description', galleryDescription);
    formData.append('published', String(galleryPublished));

    try {
      const newItem = await api.uploadGalleryImage(formData);
      setGalleryItems([newItem, ...galleryItems]);
      await onRefreshData();
      setImageFile(null);
      setImagePreview(null);
      setGalleryTitle('');
      setGalleryDescription('');
      showFeedback('success', 'Photograph uploaded to school gallery!');
    } catch (err: any) {
      showFeedback('error', err.message || 'Upload failed');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleToggleGallery = async (id: string) => {
    try {
      const updated = await api.toggleGalleryPublish(id);
      setGalleryItems(galleryItems.map((item) => (item.id === id ? updated : item)));
      await onRefreshData();
      showFeedback('success', `Image ${updated.published ? 'published' : 'unpublished'}`);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update status');
    }
  };

  const handleDeleteGallery = (id: string) => {
    setItemToDelete({ type: 'gallery', id, title: 'photo' });
  };

  // Video Management
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setVideoFileError(null);
    setVideoFilePreview(null);

    if (!file) {
      setVideoFile(null);
      return;
    }

    // Strict 60 MB limit check
    const MAX_SIZE_BYTES = 60 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const errMsg = `❌ Video Rejected: The selected file is ${sizeMB} MB. Videos larger than 60 MB cannot be uploaded. Please choose a video under 60 MB.`;
      setVideoFileError(errMsg);
      setVideoFile(null);
      e.target.value = '';
      showFeedback('error', `Video rejected (${sizeMB} MB): Maximum allowed size is 60 MB.`);
      return;
    }

    setVideoFile(file);
    if (!videoTitle) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setVideoTitle(cleanTitle);
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      setVideoFilePreview(previewUrl);
    } catch {}
  };

  const handleUploadVideoFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      setVideoFileError('Please select a video file (max 60 MB)');
      return;
    }

    if (videoFile.size > 60 * 1024 * 1024) {
      setVideoFileError('Video file exceeds 60 MB limit and was rejected.');
      return;
    }

    setUploadingVideoFile(true);
    setVideoUploadProgressText('Uploading & applying 80-90% quality compression to optimize storage...');

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('title', videoTitle || videoFile.name);
    formData.append('description', videoDescription);
    formData.append('published', String(videoPublished));

    try {
      const res = await api.uploadVideoFile(formData);
      if (res && res.video) {
        setVideos([res.video, ...videos]);
        await onRefreshData();
        setVideoFile(null);
        setVideoFilePreview(null);
        setVideoTitle('');
        setVideoDescription('');
        setVideoFileError(null);
        showFeedback(
          'success',
          res.message || 'Video uploaded and compressed with 80-90% quality maintained!'
        );
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to upload video');
      setVideoFileError(err.message || 'Video upload failed');
    } finally {
      setUploadingVideoFile(false);
      setVideoUploadProgressText(null);
    }
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle || !videoUrl) return;

    setAddingVideo(true);
    try {
      const newVid = await api.addVideo({
        title: videoTitle,
        url: videoUrl,
        description: videoDescription,
        thumbnail: videoThumbnail,
        published: videoPublished,
      });
      setVideos([newVid, ...videos]);
      await onRefreshData();
      setVideoTitle('');
      setVideoUrl('');
      setVideoDescription('');
      setVideoThumbnail('');
      showFeedback('success', 'School video added successfully!');
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to add video');
    } finally {
      setAddingVideo(false);
    }
  };

  const handleToggleVideo = async (id: string) => {
    try {
      const updated = await api.toggleVideoPublish(id);
      setVideos(videos.map((v) => (v.id === id ? updated : v)));
      await onRefreshData();
      showFeedback('success', `Video ${updated.published ? 'published' : 'unpublished'}`);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update video');
    }
  };

  const handleDeleteVideo = (id: string) => {
    setItemToDelete({ type: 'video', id, title: 'video recording' });
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      showFeedback('error', 'New passwords do not match');
      return;
    }
    if (newPass.length < 6) {
      showFeedback('error', 'New password must be at least 6 characters');
      return;
    }

    setPassLoading(true);
    try {
      await api.changePassword(currentPass, newPass);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      showFeedback('success', 'Administrator password updated successfully!');
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  // Facility Management Handlers
  const handleOpenAddFacility = () => {
    setEditingFacilityIndex(null);
    setFacilityName('');
    setFacilityCategory('Sports & Recreation');
    setFacilityCustomCategory('');
    setFacilityDescription('');
    setFacilityImageUrl('');
    setFacilityImageFile(null);
    setFacilityImagePreview(null);
    setFacilityModalOpen(true);
  };

  const handleOpenEditFacility = (index: number) => {
    const fac = contentForm.facilities?.[index];
    if (!fac) return;
    setEditingFacilityIndex(index);
    setFacilityName(fac.name || '');
    const standardCats = [
      'Sports & Recreation',
      'Academic Learning',
      'Science & Practical',
      'Administrative',
      'Technology',
      'Creative Arts',
      'Student Welfare',
      'Vocational & Practical',
      'General School',
    ];
    if (standardCats.includes(fac.category)) {
      setFacilityCategory(fac.category);
      setFacilityCustomCategory('');
    } else {
      setFacilityCategory('Custom');
      setFacilityCustomCategory(fac.category || '');
    }
    setFacilityDescription(fac.description || '');
    setFacilityImageUrl(fac.imageUrl || '');
    setFacilityImageFile(null);
    setFacilityImagePreview(fac.imageUrl || null);
    setFacilityModalOpen(true);
  };

  const handleFacilityImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFacilityImageFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFacilityImagePreview(objectUrl);
    setFacilityImageUploading(true);
    setFacilityImageUploadSuccess(null);

    try {
      const uploadRes = await api.uploadFacilityImage(file);
      if (uploadRes && uploadRes.imageUrl) {
        setFacilityImageUrl(uploadRes.imageUrl);
        setFacilityImageUploadSuccess('Uploaded to server!');
        showFeedback('success', 'Image uploaded to server successfully!');
      }
    } catch (uploadErr: any) {
      console.warn('API upload error, using local data fallback:', uploadErr);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFacilityImageUrl(base64);
        setFacilityImageUploadSuccess('Image ready to save');
      };
      reader.readAsDataURL(file);
    } finally {
      setFacilityImageUploading(false);
    }
  };

  const handleCardImageUpload = async (index: number, file: File) => {
    try {
      showFeedback('success', 'Uploading new facility photo...');
      let newUrl = '';
      try {
        const uploadRes = await api.uploadFacilityImage(file);
        newUrl = uploadRes.imageUrl;
      } catch {
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onloadend = () => {
            newUrl = reader.result as string;
            resolve(true);
          };
          reader.readAsDataURL(file);
        });
      }

      const currentFacilities = [...(contentForm.facilities || [])];
      if (currentFacilities[index]) {
        currentFacilities[index] = {
          ...currentFacilities[index],
          imageUrl: newUrl,
        };
        const updatedData = { ...contentForm, facilities: currentFacilities };
        await api.updateContent(updatedData);
        setContentForm(updatedData);
        await onRefreshData();
        showFeedback('success', `Photo updated for "${currentFacilities[index].name}"!`);
      }
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update photo');
    }
  };

  const handleSaveFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facilityName.trim()) {
      showFeedback('error', 'Facility name is required');
      return;
    }

    const finalCategory =
      facilityCategory === 'Custom'
        ? (facilityCustomCategory.trim() || 'General School')
        : facilityCategory;

    setFacilitySaving(true);
    try {
      let finalImageUrl = facilityImageUrl.trim();

      // If a file was selected but not yet uploaded, ensure it is processed
      if (facilityImageFile && !finalImageUrl) {
        try {
          const uploadRes = await api.uploadFacilityImage(facilityImageFile);
          finalImageUrl = uploadRes.imageUrl;
        } catch {
          if (facilityImagePreview) {
            finalImageUrl = facilityImagePreview;
          }
        }
      }

      const currentFacilities = [...(contentForm.facilities || [])];
      const newFacilityItem: FacilityItem = {
        name: facilityName.trim(),
        category: finalCategory,
        description: facilityDescription.trim(),
        imageUrl: finalImageUrl,
      };

      if (editingFacilityIndex !== null) {
        currentFacilities[editingFacilityIndex] = newFacilityItem;
      } else {
        currentFacilities.unshift(newFacilityItem);
      }

      const updatedData: SchoolData = {
        ...contentForm,
        facilities: currentFacilities,
      };

      await api.updateContent(updatedData);
      setContentForm(updatedData);
      await onRefreshData();

      setFacilityModalOpen(false);
      showFeedback(
        'success',
        editingFacilityIndex !== null
          ? `Facility "${newFacilityItem.name}" updated successfully!`
          : `Facility "${newFacilityItem.name}" added successfully!`
      );
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save facility');
    } finally {
      setFacilitySaving(false);
    }
  };

  const handleDeleteFacility = (index: number) => {
    const fac = contentForm.facilities?.[index];
    if (!fac) return;
    // Set for in-app confirmation modal (avoids browser iframe window.confirm blocking)
    setFacilityToDelete({ index, name: fac.name });
  };

  const confirmDeleteFacility = async () => {
    if (!facilityToDelete) return;
    const { index, name } = facilityToDelete;
    setFacilityToDelete(null);

    try {
      const currentFacilities = [...(contentForm.facilities || [])];
      currentFacilities.splice(index, 1);

      const updatedData: SchoolData = {
        ...contentForm,
        facilities: currentFacilities,
      };

      await api.updateContent(updatedData);
      setContentForm(updatedData);
      await onRefreshData();
      showFeedback('success', `Facility "${name}" has been removed.`);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete facility');
    }
  };

  // Applications Status Update
  const handleUpdateApplicationStatus = async (
    id: string,
    status: AdmissionApplication['status']
  ) => {
    try {
      const updated = await api.updateApplicationStatus(id, status);
      setApplications(applications.map((a) => (a.id === id ? updated : a)));
      showFeedback('success', `Application status changed to ${status}`);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update application');
    }
  };

  // Contact Messages Update
  const handleMarkMessageRead = async (id: string) => {
    try {
      await api.markMessageRead(id);
      setMessages(messages.map((m) => (m.id === id ? { ...m, read: true } : m)));
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update message');
    }
  };

  const handleDeleteMessage = (id: string) => {
    setItemToDelete({ type: 'message', id, title: 'contact message' });
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    const { type, id, title } = itemToDelete;
    setItemToDelete(null);

    try {
      if (type === 'gallery') {
        await api.deleteGalleryImage(id);
        setGalleryItems((prev) => prev.filter((item) => item.id !== id));
        await onRefreshData();
        showFeedback('success', 'Photograph deleted from gallery');
      } else if (type === 'video') {
        await api.deleteVideo(id);
        setVideos((prev) => prev.filter((v) => v.id !== id));
        await onRefreshData();
        showFeedback('success', 'Video deleted');
      } else if (type === 'message') {
        await api.deleteMessage(id);
        setMessages((prev) => prev.filter((m) => m.id !== id));
        showFeedback('success', 'Message deleted');
      }
    } catch (err: any) {
      showFeedback('error', err.message || `Failed to delete ${title}`);
    }
  };

  // ----------------- RENDER: LOGIN FORM -----------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="bg-white border-2 border-emerald-900/20 rounded-xl p-6 sm:p-8 max-w-md w-full shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <SchoolBadge size="lg" className="mx-auto shadow-md" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Staff & Administrative Portal
            </span>
            <h2 className="font-serif font-bold text-2xl text-emerald-950">
              AL-NIIMA ACADEMY
            </h2>
            <p className="text-xs text-stone-500">
              Please enter your authorized administrative password to manage school website content and admissions.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="Enter administrator password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm py-2.5 rounded-md shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-stone-100">
            <button
              onClick={onCloseAdmin}
              className="text-xs text-stone-500 hover:text-stone-800 underline"
            >
              Return to public website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------- RENDER: AUTHENTICATED DASHBOARD -----------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-emerald-950 text-white rounded-xl p-5 sm:p-6 shadow-md border-b-4 border-amber-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SchoolBadge size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg sm:text-xl text-white">
                Admin Dashboard
              </span>
              <span className="text-[10px] font-bold bg-amber-400 text-emerald-950 px-2 py-0.5 rounded uppercase">
                Staff Only
              </span>
            </div>
            <p className="text-xs text-emerald-200">
              AL-NIIMA ACADEMY • Dutse, Jigawa State
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onCloseAdmin}
            className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium px-3.5 py-2 rounded border border-emerald-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Site</span>
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 bg-red-800 hover:bg-red-700 text-white text-xs font-semibold px-3.5 py-2 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-xs sm:text-sm animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-red-50 text-red-900 border border-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0" />
          )}
          <span className="font-medium">{feedback.message}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white border border-stone-200 rounded-xl p-1 shadow-2xs overflow-x-auto flex gap-1 text-xs sm:text-sm font-medium">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'content'
              ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>School Content</span>
        </button>

        <button
          onClick={() => setActiveTab('facilities')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'facilities'
              ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Facilities ({contentForm.facilities?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'gallery'
              ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Gallery ({galleryItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'videos'
              ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Videos ({videos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('admissions')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'admissions'
              ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Applications ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'messages'
              ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Messages ({messages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-emerald-800 text-white font-semibold shadow-2xs'
              : 'text-stone-700 hover:bg-stone-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Security</span>
        </button>
      </div>

      {/* ----------------- TAB: OVERVIEW ----------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-2xs space-y-1">
              <span className="text-xs text-stone-500">Admission Applications</span>
              <p className="font-serif font-bold text-2xl text-emerald-950">
                {applications.length}
              </p>
              <span className="text-[11px] text-amber-600 font-medium">
                {applications.filter((a) => a.status === 'Pending').length} pending review
              </span>
            </div>

            <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-2xs space-y-1">
              <span className="text-xs text-stone-500">Contact Inquiries</span>
              <p className="font-serif font-bold text-2xl text-emerald-950">
                {messages.length}
              </p>
              <span className="text-[11px] text-amber-600 font-medium">
                {messages.filter((m) => !m.read).length} unread
              </span>
            </div>

            <div
              onClick={() => setActiveTab('facilities')}
              className="bg-white border border-stone-200 p-5 rounded-xl shadow-2xs space-y-1 cursor-pointer hover:border-emerald-600 hover:shadow-xs transition-all"
            >
              <span className="text-xs text-stone-500">Documented Facilities</span>
              <p className="font-serif font-bold text-2xl text-emerald-950">
                {(contentForm.facilities || []).length}
              </p>
              <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                Manage Facilities &rarr;
              </span>
            </div>

            <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-2xs space-y-1">
              <span className="text-xs text-stone-500">Published Photos</span>
              <p className="font-serif font-bold text-2xl text-emerald-950">
                {galleryItems.filter((g) => g.published !== false).length}
              </p>
              <span className="text-[11px] text-stone-400">
                {galleryItems.length} total in storage
              </span>
            </div>

            <div className="bg-white border border-stone-200 p-5 rounded-xl shadow-2xs space-y-1">
              <span className="text-xs text-stone-500">School Videos</span>
              <p className="font-serif font-bold text-2xl text-emerald-950">
                {videos.length}
              </p>
              <span className="text-[11px] text-stone-400">Active media entries</span>
            </div>
          </div>

          {/* Quick Announcement Control */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <h3 className="font-serif font-bold text-lg text-emerald-950">
                  Website Notice Banner
                </h3>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={contentForm.announcement.enabled}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      announcement: {
                        ...contentForm.announcement,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-emerald-700 focus:ring-emerald-700"
                />
                <span>Banner Active on Website</span>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Announcement Text
                </label>
                <input
                  type="text"
                  value={contentForm.announcement.text}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      announcement: {
                        ...contentForm.announcement,
                        text: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveContent}
                  disabled={contentSaving}
                  className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded transition-colors cursor-pointer"
                >
                  {contentSaving ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>{contentSaving ? 'Saving...' : 'Save Notice Settings'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB: CONTENT ----------------- */}
      {activeTab === 'content' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 shadow-2xs space-y-8">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h3 className="font-serif font-bold text-xl text-emerald-950">
                School Website Content Management
              </h3>
              <p className="text-xs text-stone-500">
                Update school contact information, mission, vision, and hero text directly.
              </p>
            </div>
            <button
              onClick={handleSaveContent}
              disabled={contentSaving}
              className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-md shadow transition-all cursor-pointer"
            >
              {contentSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <Save className="w-4 h-4 text-amber-400" />
              )}
              <span>{contentSaving ? 'Saving Updates...' : 'Save All Changes'}</span>
            </button>
          </div>

          {/* Section: General Info */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-base text-emerald-950 border-b border-stone-100 pb-2">
              General Identity & Contact
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  value={contentForm.general.name}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      general: { ...contentForm.general, name: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  School Motto
                </label>
                <input
                  type="text"
                  value={contentForm.general.motto}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      general: { ...contentForm.general, motto: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  School Address (Dutse, Jigawa State)
                </label>
                <input
                  type="text"
                  value={contentForm.general.address}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      general: { ...contentForm.general, address: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Primary Contact Email (info@alniimaacademy.com.ng)
                </label>
                <input
                  type="email"
                  value={contentForm.general.email}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      general: { ...contentForm.general, email: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Phone Number 1
                </label>
                <input
                  type="text"
                  value={contentForm.general.phoneNumbers[0] || ''}
                  onChange={(e) => {
                    const phones = [...contentForm.general.phoneNumbers];
                    phones[0] = e.target.value;
                    setContentForm({
                      ...contentForm,
                      general: { ...contentForm.general, phoneNumbers: phones },
                    });
                  }}
                  className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Phone Number 2
                </label>
                <input
                  type="text"
                  value={contentForm.general.phoneNumbers[1] || ''}
                  onChange={(e) => {
                    const phones = [...contentForm.general.phoneNumbers];
                    phones[1] = e.target.value;
                    setContentForm({
                      ...contentForm,
                      general: { ...contentForm.general, phoneNumbers: phones },
                    });
                  }}
                  className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Section: Mission & Vision */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <h4 className="font-serif font-bold text-base text-emerald-950 border-b border-stone-100 pb-2">
              Mission & Vision
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  School Mission
                </label>
                <textarea
                  rows={2}
                  value={contentForm.missionVision.mission}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      missionVision: {
                        ...contentForm.missionVision,
                        mission: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  School Vision
                </label>
                <textarea
                  rows={2}
                  value={contentForm.missionVision.vision}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      missionVision: {
                        ...contentForm.missionVision,
                        vision: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Section: Hero & Welcome Message */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <h4 className="font-serif font-bold text-base text-emerald-950 border-b border-stone-100 pb-2">
              Homepage Welcome Message
            </h4>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Welcome Message
              </label>
              <textarea
                rows={3}
                value={contentForm.hero.welcomeMessage}
                onChange={(e) =>
                  setContentForm({
                    ...contentForm,
                    hero: { ...contentForm.hero, welcomeMessage: e.target.value },
                  })
                }
                className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Section: SSS & A'level Notes */}
          <div className="space-y-4 pt-4 border-t border-stone-200">
            <h4 className="font-serif font-bold text-base text-emerald-950 border-b border-stone-100 pb-2">
              SSS & A’level Academic Notes
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Senior Secondary School (SSS) Information
                </label>
                <textarea
                  rows={2}
                  value={contentForm.academics.sssInformation}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      academics: {
                        ...contentForm.academics,
                        sssInformation: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  A’level Programme Information
                </label>
                <textarea
                  rows={2}
                  value={contentForm.academics.aLevelInformation}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      academics: {
                        ...contentForm.academics,
                        aLevelInformation: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-end">
            <button
              onClick={handleSaveContent}
              disabled={contentSaving}
              className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-md shadow transition-all cursor-pointer"
            >
              {contentSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <Save className="w-4 h-4 text-amber-400" />
              )}
              <span>{contentSaving ? 'Saving Updates...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ----------------- TAB: FACILITIES ----------------- */}
      {activeTab === 'facilities' && (
        <div className="space-y-6">
          {/* Header & Add Button */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-800" />
                <h3 className="font-serif font-bold text-lg text-emerald-950">
                  Facilities Management
                </h3>
              </div>
              <p className="text-xs text-stone-500 max-w-xl">
                Add, edit, or remove documented school facilities (laboratories, ICT centers, classrooms, sports fields). Any updates are live on the website immediately.
              </p>
            </div>

            <button
              onClick={handleOpenAddFacility}
              className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add New Facility</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search facility name or description..."
                value={facilitySearch}
                onChange={(e) => setFacilitySearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-stone-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              {facilitySearch && (
                <button
                  onClick={() => setFacilitySearch('')}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-stone-600">Category:</span>
              <select
                value={facilityCategoryFilter}
                onChange={(e) => setFacilityCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
              >
                <option value="All">All Categories</option>
                {Array.from(new Set((contentForm.facilities || []).map((f) => f.category?.trim()).filter(Boolean))).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <span className="text-stone-400 text-xs ml-2">
                Showing{' '}
                {
                  (contentForm.facilities || []).filter((f) => {
                    const matchesSearch =
                      f.name?.toLowerCase().includes(facilitySearch.toLowerCase()) ||
                      f.description?.toLowerCase().includes(facilitySearch.toLowerCase());
                    const matchesCategory =
                      facilityCategoryFilter === 'All' ||
                      f.category?.toLowerCase() === facilityCategoryFilter.toLowerCase();
                    return matchesSearch && matchesCategory;
                  }).length
                }{' '}
                of {(contentForm.facilities || []).length} facilities
              </span>
            </div>
          </div>

          {/* Facilities Cards Grid */}
          {(() => {
            const filtered = (contentForm.facilities || []).filter((f) => {
              const matchesSearch =
                f.name?.toLowerCase().includes(facilitySearch.toLowerCase()) ||
                f.description?.toLowerCase().includes(facilitySearch.toLowerCase());
              const matchesCategory =
                facilityCategoryFilter === 'All' ||
                f.category?.toLowerCase() === facilityCategoryFilter.toLowerCase();
              return matchesSearch && matchesCategory;
            });

            if (filtered.length === 0) {
              return (
                <div className="bg-white border border-dashed border-stone-300 rounded-xl p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-bold text-stone-900 text-base">
                    No Facilities Found
                  </h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    {facilitySearch || facilityCategoryFilter !== 'All'
                      ? 'No facilities match your search filter criteria. Try clearing the filter.'
                      : 'No facilities have been created yet. Click below to add the first school facility.'}
                  </p>
                  <button
                    onClick={handleOpenAddFacility}
                    className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-400" />
                    <span>Add First Facility</span>
                  </button>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((fac) => {
                  const originalIndex = (contentForm.facilities || []).indexOf(fac);
                  return (
                    <div
                      key={originalIndex}
                      className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image Preview or Fallback */}
                        <div className="aspect-video bg-stone-100 relative overflow-hidden flex items-center justify-center border-b border-stone-100">
                          {fac.imageUrl ? (
                            <img
                              src={fac.imageUrl}
                              alt={fac.name}
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-4 text-stone-400 gap-1.5">
                              <Building2 className="w-8 h-8 text-emerald-800/40" />
                              <span className="text-[11px] font-medium text-stone-500 text-center">
                                {fac.name}
                              </span>
                            </div>
                          )}
                          <span className="absolute top-2.5 left-2.5 bg-emerald-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {fac.category}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-2">
                          <h4 className="font-serif font-bold text-base text-emerald-950 leading-snug">
                            {fac.name}
                          </h4>
                          <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                            {fac.description}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-900 text-xs font-medium transition-all cursor-pointer" title="Directly upload or change this facility's photograph">
                          <Upload className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleCardImageUpload(originalIndex, f);
                            }}
                          />
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditFacility(originalIndex)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-stone-300 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-stone-700 hover:text-emerald-900 text-xs font-medium transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteFacility(originalIndex)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-red-200 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 text-xs font-medium transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Add / Edit Facility Modal Dialog */}
          {facilityModalOpen && (
            <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
                <div className="bg-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b-2 border-amber-400">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-400" />
                    <h3 className="font-serif font-bold text-base">
                      {editingFacilityIndex !== null ? 'Edit Facility' : 'Add New Facility'}
                    </h3>
                  </div>
                  <button
                    onClick={() => setFacilityModalOpen(false)}
                    className="text-emerald-200 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveFacility} className="p-6 space-y-4">
                  {/* Facility Name */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Facility Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Physics & Chemistry Laboratory"
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={facilityCategory}
                      onChange={(e) => setFacilityCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                    >
                      <option value="Sports & Recreation">Sports & Recreation</option>
                      <option value="Academic Learning">Academic Learning</option>
                      <option value="Science & Practical">Science & Practical</option>
                      <option value="Administrative">Administrative</option>
                      <option value="Technology">Technology</option>
                      <option value="Creative Arts">Creative Arts</option>
                      <option value="Student Welfare">Student Welfare</option>
                      <option value="Vocational & Practical">Vocational & Practical</option>
                      <option value="General School">General School</option>
                      <option value="Custom">Custom Category...</option>
                    </select>

                    {facilityCategory === 'Custom' && (
                      <div className="mt-2">
                        <input
                          type="text"
                          required
                          placeholder="Type custom category name..."
                          value={facilityCustomCategory}
                          onChange={(e) => setFacilityCustomCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                        />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe the facility equipment, features, capacity, and student benefits..."
                      value={facilityDescription}
                      onChange={(e) => setFacilityDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  {/* Image Options */}
                  <div className="space-y-2 border-t border-stone-200 pt-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-stone-700">
                        Facility Photograph (Optional)
                      </label>
                      {facilityImageUploading && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading image...</span>
                        </div>
                      )}
                      {facilityImageUploadSuccess && !facilityImageUploading && (
                        <div className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{facilityImageUploadSuccess}</span>
                        </div>
                      )}
                    </div>

                    {/* Upload File */}
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Choose Photo from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFacilityImageChange}
                        />
                      </label>
                      <span className="text-xs text-stone-400">or enter image URL below:</span>
                    </div>

                    <input
                      type="text"
                      placeholder="https://... or /uploads/gallery/..."
                      value={facilityImageUrl}
                      onChange={(e) => {
                        setFacilityImageUrl(e.target.value);
                        if (!facilityImageFile) {
                          setFacilityImagePreview(e.target.value || null);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                    />

                    {/* Live Preview */}
                    {(facilityImagePreview || facilityImageUrl) && (
                      <div className="relative mt-2 rounded-lg overflow-hidden border border-stone-200 aspect-video bg-stone-100 max-h-40">
                        <img
                          src={facilityImagePreview || facilityImageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFacilityImageFile(null);
                            setFacilityImagePreview(null);
                            setFacilityImageUrl('');
                            setFacilityImageUploadSuccess(null);
                          }}
                          className="absolute top-2 right-2 bg-stone-900/80 hover:bg-stone-900 text-white text-xs px-2 py-1 rounded cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Form Action Buttons */}
                  <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setFacilityModalOpen(false)}
                      className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={facilitySaving}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold shadow transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {facilitySaving ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving Facility...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 text-amber-400" />
                          <span>{editingFacilityIndex !== null ? 'Save Changes' : 'Add Facility'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* In-App Delete Confirmation Modal (Prevents browser iframe window.confirm blocking) */}
          {facilityToDelete && (
            <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="text-center space-y-1.5">
                  <h3 className="font-serif font-bold text-lg text-stone-900">
                    Remove Facility?
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Are you sure you want to permanently remove <strong className="text-stone-900">"{facilityToDelete.name}"</strong>? It will immediately be removed from the school website and database.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFacilityToDelete(null)}
                    className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDeleteFacility}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Remove Facility</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB: GALLERY ----------------- */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {/* Upload Form */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs space-y-4">
            <h3 className="font-serif font-bold text-lg text-emerald-950 border-b border-stone-100 pb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-800" />
              <span>Upload Real School Photograph</span>
            </h3>

            <form onSubmit={handleUploadGallery} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Select Image File (JPEG, PNG, WEBP) *
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    required
                    onChange={handleImageFileChange}
                    className="w-full text-xs text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100 cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="mt-2 w-32 h-24 rounded-lg overflow-hidden border border-stone-300">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Photo Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science Laboratory Session"
                    value={galleryTitle}
                    onChange={(e) => setGalleryTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={galleryCategory}
                    onChange={(e) => setGalleryCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700 bg-white"
                  >
                    <option value="School Life">School Life</option>
                    <option value="Academics">Academics</option>
                    <option value="Sports">Sports</option>
                    <option value="Events">Events</option>
                    <option value="Boarding">Boarding</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Activities">Activities</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of the photograph..."
                    value={galleryDescription}
                    onChange={(e) => setGalleryDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={galleryPublished}
                    onChange={(e) => setGalleryPublished(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-700"
                  />
                  <span>Publish immediately to public website</span>
                </label>

                <button
                  type="submit"
                  disabled={uploadingGallery}
                  className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs px-5 py-2.5 rounded-md shadow transition-all disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>{uploadingGallery ? 'Uploading...' : 'Upload Image'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Gallery Table / Cards */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs space-y-4">
            <h3 className="font-serif font-bold text-lg text-emerald-950 border-b border-stone-100 pb-2">
              Manage Gallery Images ({galleryItems.length})
            </h3>

            {galleryItems.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">
                No gallery images uploaded yet. Uploaded images will appear here and on the public gallery.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-stone-200 rounded-lg overflow-hidden bg-white shadow-2xs flex flex-col justify-between"
                  >
                    <div className="aspect-video bg-stone-100 relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-bold bg-emerald-950/80 text-white px-2 py-0.5 rounded">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-3 space-y-1">
                      <h4 className="font-serif font-bold text-xs text-emerald-950 line-clamp-1">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-[11px] text-stone-500 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    <div className="p-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleToggleGallery(item.id)}
                        className={`inline-flex items-center gap-1 font-semibold ${
                          item.published
                            ? 'text-emerald-700 hover:text-emerald-900'
                            : 'text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        {item.published ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Unpublished</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteGallery(item.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB: VIDEOS ----------------- */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          {/* Add / Upload Video Form */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-emerald-950 flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-800" />
                <span>School Video Management</span>
              </h3>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg self-start sm:self-auto text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setVideoUploadMode('upload');
                    setVideoFileError(null);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    videoUploadMode === 'upload'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Video File (Max 60MB)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setVideoUploadMode('link');
                    setVideoFileError(null);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    videoUploadMode === 'link'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>External Video Link</span>
                </button>
              </div>
            </div>

            {/* Storage & Compression Info Banner */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Smart Storage Compression Policy (80% – 90% Quality Maintained)</span>
              </div>
              <p className="text-stone-600 leading-relaxed">
                Uploaded school videos are automatically compressed on upload to retain <strong>80% to 90% visual clarity</strong> while dramatically reducing file size to preserve storage.
                <strong className="text-red-700 ml-1">Maximum allowed video size is 60 MB</strong>; videos exceeding 60 MB will be rejected by the system.
              </p>
            </div>

            {/* MODE 1: Direct Video File Upload */}
            {videoUploadMode === 'upload' ? (
              <form onSubmit={handleUploadVideoFile} className="space-y-4">
                {videoFileError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">File Rejected</strong>
                      <span>{videoFileError}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Select Video File (MP4, WebM, MOV, MKV, 3GP • Max 60 MB) *
                    </label>
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,video/x-matroska,video/3gpp,video/*"
                      required
                      onChange={handleVideoFileChange}
                      disabled={uploadingVideoFile}
                      className="w-full text-xs text-stone-600 file:mr-3 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-800 file:text-white hover:file:bg-emerald-900 cursor-pointer border border-stone-200 rounded-lg p-2 bg-stone-50"
                    />

                    {videoFile && (
                      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold">{videoFile.name}</span>
                            <span className="text-stone-500 ml-2">
                              ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB of 60 MB limit)
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                          Ready for 85-90% compression
                        </span>
                      </div>
                    )}

                    {videoFilePreview && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-stone-300 bg-black max-w-md">
                        <video
                          src={videoFilePreview}
                          controls
                          className="w-full max-h-48 object-contain"
                        />
                        <div className="p-2 bg-stone-900 text-stone-300 text-[10px] text-center">
                          Preview of selected video file
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Video Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Science Fair Presentation 2026"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      disabled={uploadingVideoFile}
                      className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Brief note about the recording..."
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      disabled={uploadingVideoFile}
                      className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-100">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={videoPublished}
                      onChange={(e) => setVideoPublished(e.target.checked)}
                      disabled={uploadingVideoFile}
                      className="rounded text-emerald-700 focus:ring-emerald-700"
                    />
                    <span>Publish immediately to public website</span>
                  </label>

                  <button
                    type="submit"
                    disabled={uploadingVideoFile || !videoFile}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs px-6 py-2.5 rounded-md shadow transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {uploadingVideoFile ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>{videoUploadProgressText || 'Compressing & Uploading...'}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Upload & Compress Video (Max 60MB)</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* MODE 2: External Link */
              <form onSubmit={handleAddVideo} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Video Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Al-Niima Academy Speech & Prize Day"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Video Link / URL (YouTube, Vimeo, Web Video) *
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Video Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief description of the school video..."
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={videoPublished}
                      onChange={(e) => setVideoPublished(e.target.checked)}
                      className="rounded text-emerald-700 focus:ring-emerald-700"
                    />
                    <span>Publish immediately to public website</span>
                  </label>

                  <button
                    type="submit"
                    disabled={addingVideo}
                    className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs px-5 py-2.5 rounded-md shadow transition-all disabled:opacity-50"
                  >
                    <Video className="w-3.5 h-3.5 text-amber-400" />
                    <span>{addingVideo ? 'Saving...' : 'Save Video Link'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Videos List */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs space-y-4">
            <h3 className="font-serif font-bold text-lg text-emerald-950 border-b border-stone-100 pb-2">
              Existing School Videos ({videos.length})
            </h3>

            {videos.length === 0 ? (
              <p className="text-xs text-stone-500 py-4 text-center">
                No school videos added yet. Uploaded videos will appear here and on the public website.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {videos.map((vid) => {
                  const isUploadedFile =
                    vid.url.startsWith('/uploads/') || vid.url.match(/\.(mp4|webm|mov|mkv)$/i);

                  return (
                    <div
                      key={vid.id}
                      className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs flex flex-col justify-between"
                    >
                      {/* Video Player or Thumbnail */}
                      <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
                        {isUploadedFile ? (
                          <video
                            src={vid.url}
                            poster={vid.thumbnail}
                            controls
                            className="w-full h-full object-contain bg-black"
                          />
                        ) : vid.thumbnail ? (
                          <img
                            src={vid.thumbnail}
                            alt={vid.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4">
                            <Video className="w-10 h-10 text-amber-400 mx-auto mb-1" />
                            <span className="text-[11px] text-stone-300">External Video</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-serif font-bold text-sm text-emerald-950 line-clamp-1">
                            {vid.title}
                          </h4>
                          {vid.fileSize && (
                            <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded border border-stone-200 shrink-0">
                              {(vid.fileSize / (1024 * 1024)).toFixed(1)} MB
                            </span>
                          )}
                        </div>

                        {vid.description && (
                          <p className="text-xs text-stone-500 line-clamp-2">
                            {vid.description}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-800">
                          {isUploadedFile ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              <span>85-90% Quality Compressed</span>
                            </span>
                          ) : (
                            <a
                              href={vid.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 hover:underline break-all inline-flex items-center gap-1 font-medium"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span className="truncate max-w-[200px]">{vid.url}</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
                        <button
                          onClick={() => handleToggleVideo(vid.id)}
                          className={`inline-flex items-center gap-1 font-semibold ${
                            vid.published ? 'text-emerald-700' : 'text-stone-400'
                          }`}
                        >
                          {vid.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span>{vid.published ? 'Published' : 'Hidden'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteVideo(vid.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB: ADMISSIONS ----------------- */}
      {activeTab === 'admissions' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-emerald-950">
                Online Admission Applications ({applications.length})
              </h3>
              <p className="text-xs text-stone-500">
                Review submitted applications from prospective parents and update application status.
              </p>
            </div>
            <button
              onClick={loadAdminData}
              className="p-1.5 text-stone-500 hover:text-emerald-800 rounded"
              title="Refresh applications"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {applications.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">
              No online admission applications submitted yet.
            </p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="border border-stone-200 rounded-lg p-5 bg-stone-50/50 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded">
                        {app.applicationNumber}
                      </span>
                      <h4 className="font-serif font-bold text-base text-emerald-950 mt-1">
                        {app.studentFullName} ({app.gender})
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">Status:</span>
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleUpdateApplicationStatus(
                            app.id,
                            e.target.value as AdmissionApplication['status']
                          )
                        }
                        className={`text-xs font-bold px-2.5 py-1 rounded border ${
                          app.status === 'Accepted'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : app.status === 'Declined'
                            ? 'bg-red-100 text-red-900 border-red-300'
                            : app.status === 'Under Review'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-stone-200 text-stone-800 border-stone-300'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Declined">Declined</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-stone-700">
                    <div>
                      <strong className="block text-stone-900">Section Applied:</strong>
                      <span>{app.sectionApplied} {app.entryClass ? `(${app.entryClass})` : ''}</span>
                    </div>
                    <div>
                      <strong className="block text-stone-900">Boarding Preference:</strong>
                      <span className="text-emerald-800 font-semibold">{app.boardingPreference}</span>
                    </div>
                    <div>
                      <strong className="block text-stone-900">Parent / Guardian:</strong>
                      <span>{app.parentFullName}</span>
                    </div>
                    <div>
                      <strong className="block text-stone-900">Parent Contact:</strong>
                      <a href={`tel:${app.parentPhone}`} className="text-emerald-700 hover:underline">
                        {app.parentPhone}
                      </a>
                    </div>
                  </div>

                  {app.residentialAddress && (
                    <div className="text-xs text-stone-600 bg-white p-2.5 rounded border border-stone-200">
                      <strong className="text-stone-800">Address: </strong>
                      <span>{app.residentialAddress}</span>
                    </div>
                  )}

                  {app.additionalNotes && (
                    <div className="text-xs text-stone-600 bg-white p-2.5 rounded border border-stone-200">
                      <strong className="text-stone-800">Notes: </strong>
                      <span>{app.additionalNotes}</span>
                    </div>
                  )}

                  <div className="text-[11px] text-stone-400">
                    Submitted on: {new Date(app.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB: MESSAGES ----------------- */}
      {activeTab === 'messages' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-emerald-950">
                Contact Inquiries ({messages.length})
              </h3>
              <p className="text-xs text-stone-500">
                Messages submitted through the public Contact page form.
              </p>
            </div>
            <button
              onClick={loadAdminData}
              className="p-1.5 text-stone-500 hover:text-emerald-800 rounded"
              title="Refresh messages"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {messages.length === 0 ? (
            <p className="text-xs text-stone-500 py-6 text-center">
              No inquiries received yet.
            </p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`border rounded-lg p-4 space-y-2 transition-colors ${
                    msg.read ? 'bg-white border-stone-200' : 'bg-amber-50/60 border-amber-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-2">
                      {!msg.read && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                      )}
                      <h4 className="font-serif font-bold text-sm text-emerald-950">
                        {msg.name}
                      </h4>
                      <span className="text-xs text-stone-500">
                        • {msg.phone} {msg.email ? `• ${msg.email}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[11px] text-stone-400">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </span>
                      {!msg.read && (
                        <button
                          onClick={() => handleMarkMessageRead(msg.id)}
                          className="text-[11px] text-emerald-800 font-semibold hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete inquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-stone-700">
                    <strong className="block text-emerald-950 mb-0.5">
                      Subject: {msg.subject}
                    </strong>
                    <p className="leading-relaxed bg-stone-50 p-2.5 rounded border border-stone-200/60">
                      {msg.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB: SECURITY ----------------- */}
      {activeTab === 'security' && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 sm:p-8 max-w-xl shadow-2xs space-y-6">
          <div className="space-y-1 border-b border-stone-200 pb-3">
            <h3 className="font-serif font-bold text-lg text-emerald-950 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-800" />
              <span>Change Administrator Password</span>
            </h3>
            <p className="text-xs text-stone-500">
              Ensure you choose a strong password to safeguard administrative access.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                New Password (Minimum 6 characters) *
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3 py-2 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs px-5 py-2.5 rounded-md shadow transition-all disabled:opacity-50"
            >
              {passLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* In-App Delete Confirmation Modal for Gallery, Video, or Message */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-stone-200 shadow-xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Confirm Deletion
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Are you sure you want to permanently delete this {itemToDelete.title}? This action cannot be reversed.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteItem}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
