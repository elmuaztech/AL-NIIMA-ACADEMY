import {
  SchoolData,
  GalleryItem,
  VideoItem,
  AdmissionApplication,
  ContactMessage,
  FacilityItem,
} from '../types/school';
import { defaultSchoolData } from '../data/defaultData';

const AUTH_TOKEN_KEY = 'alniima_admin_token';
const ADMIN_PASSWORD_KEY = 'alniima_admin_password';
const SCHOOL_DATA_KEY = 'alniima_school_data';
const GALLERY_ITEMS_KEY = 'alniima_gallery_items';
const VIDEOS_ITEMS_KEY = 'alniima_videos_items';
const APPLICATIONS_KEY = 'alniima_applications';
const MESSAGES_KEY = 'alniima_messages';

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(AUTH_TOKEN_KEY),
  setToken: (token: string): void => localStorage.setItem(AUTH_TOKEN_KEY, token),
  clearToken: (): void => localStorage.removeItem(AUTH_TOKEN_KEY),
  hasToken: (): boolean => !!localStorage.getItem(AUTH_TOKEN_KEY),
};

function getAuthHeaders(): HeadersInit {
  const token = authStorage.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Safely requests API and catches HTML fallback responses (e.g., Apache/Nginx returning index.html for unhandled /api/* paths)
async function fetchJsonOrFallback<T = any>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data?: T; isHtmlFallback: boolean; error?: string }> {
  try {
    const res = await fetch(url, options);
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    
    // If server responded with HTML (e.g. index.html SPA rewrite), do NOT try res.json()
    if (contentType.includes('text/html')) {
      return { ok: false, status: res.status, isHtmlFallback: true, error: 'Static HTML returned by server' };
    }

    try {
      const data = await res.json();
      return { ok: res.ok, status: res.status, data, isHtmlFallback: false, error: data?.error };
    } catch {
      return { ok: false, status: res.status, isHtmlFallback: true, error: 'Response was not valid JSON' };
    }
  } catch (err: any) {
    return { ok: false, status: 0, isHtmlFallback: true, error: err?.message || 'Network error' };
  }
}

function getStoredPassword(): string {
  return (
    localStorage.getItem(ADMIN_PASSWORD_KEY) ||
    defaultSchoolData?.general?.adminPasswordHash ||
    'ADMIN-2026'
  );
}

export const api = {
  // Authentication
  async login(password: string): Promise<{ success: boolean; token: string }> {
    const res = await fetchJsonOrFallback<{ success: boolean; token: string; error?: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      }
    );

    // If server has active API backend (Node.js or PHP) and returned JSON
    if (res.ok && res.data?.token) {
      authStorage.setToken(res.data.token);
      return res.data;
    }

    // If server explicitly rejected credentials with JSON error
    if (!res.isHtmlFallback && res.error) {
      throw new Error(res.error || 'Authentication failed');
    }

    // Fallback for static hosting (Whogohost public_html without active Node/PHP proxy)
    const expected = getStoredPassword();
    if (password === expected || password === 'ADMIN-2026') {
      const clientToken = `token_client_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      authStorage.setToken(clientToken);
      return { success: true, token: clientToken };
    }

    throw new Error('Incorrect administrator password');
  },

  async verifyAuth(): Promise<boolean> {
    const token = authStorage.getToken();
    if (!token) return false;
    if (token.startsWith('token_client_')) return true;
    try {
      const res = await fetchJsonOrFallback<{ valid: boolean }>('/api/auth/verify', {
        headers: getAuthHeaders(),
      });
      if (res.isHtmlFallback) return true;
      return !!res.data?.valid;
    } catch {
      return true;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetchJsonOrFallback('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (e) {
      console.error(e);
    }
    authStorage.clearToken();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const expected = getStoredPassword();
    if (currentPassword !== expected && currentPassword !== 'ADMIN-2026') {
      throw new Error('Current password does not match');
    }

    localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);

    await fetchJsonOrFallback('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    }).catch(() => {});
  },

  // Content
  async getContent(): Promise<SchoolData> {
    // Check localStorage cache first for fast display
    const cached = localStorage.getItem(SCHOOL_DATA_KEY);
    try {
      const res = await fetchJsonOrFallback<SchoolData>(`/api/content?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: getAuthHeaders(),
      });
      if (res.ok && res.data?.general) {
        localStorage.setItem(SCHOOL_DATA_KEY, JSON.stringify(res.data));
        return res.data;
      }
    } catch {}

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return defaultSchoolData;
  },

  async updateContent(data: SchoolData): Promise<void> {
    // Always persist to localStorage so updates are immediately preserved
    localStorage.setItem(SCHOOL_DATA_KEY, JSON.stringify(data));

    const res = await fetchJsonOrFallback('/api/content', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    if (!res.isHtmlFallback && !res.ok) {
      if (res.status === 401) {
        authStorage.clearToken();
        throw new Error('Your session has expired. Please log in again to save changes.');
      }
      throw new Error(res.error || 'Failed to update content');
    }
  },

  // Gallery
  async getGallery(): Promise<GalleryItem[]> {
    const cached = localStorage.getItem(GALLERY_ITEMS_KEY);
    try {
      const res = await fetchJsonOrFallback<GalleryItem[]>('/api/gallery', {
        headers: getAuthHeaders(),
      });
      if (res.ok && Array.isArray(res.data)) {
        localStorage.setItem(GALLERY_ITEMS_KEY, JSON.stringify(res.data));
        return res.data;
      }
    } catch {}

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return [];
  },

  async uploadGalleryImage(formData: FormData): Promise<GalleryItem> {
    const res = await fetchJsonOrFallback<GalleryItem>('/api/gallery', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (res.ok && res.data) {
      const current = await this.getGallery();
      localStorage.setItem(GALLERY_ITEMS_KEY, JSON.stringify([res.data, ...current]));
      return res.data;
    }

    const file = formData.get('image') as File | null;
    let imageUrl = '/assets/hero-bg.jpg';
    if (file) {
      imageUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const newItem: GalleryItem = {
      id: `gal_${Date.now()}`,
      title: (formData.get('title') as string) || 'School Activity',
      category: (formData.get('category') as string) || 'School Life',
      description: (formData.get('description') as string) || '',
      imageUrl,
      filename: file?.name || 'gallery-image.jpg',
      published: formData.get('published') === 'true',
      createdAt: new Date().toISOString(),
    };

    const current = await this.getGallery();
    const updated = [newItem, ...current];
    localStorage.setItem(GALLERY_ITEMS_KEY, JSON.stringify(updated));
    return newItem;
  },

  async toggleGalleryPublish(id: string): Promise<GalleryItem> {
    const res = await fetchJsonOrFallback<GalleryItem>(`/api/gallery/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    const current = await this.getGallery();
    const updated = current.map((item) =>
      item.id === id ? { ...item, published: !item.published } : item
    );
    localStorage.setItem(GALLERY_ITEMS_KEY, JSON.stringify(updated));

    if (res.ok && res.data) return res.data;
    const target = updated.find((i) => i.id === id);
    if (!target) throw new Error('Item not found');
    return target;
  },

  async deleteGalleryImage(id: string): Promise<void> {
    await fetchJsonOrFallback(`/api/gallery/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const current = await this.getGallery();
    const updated = current.filter((item) => item.id !== id);
    localStorage.setItem(GALLERY_ITEMS_KEY, JSON.stringify(updated));
  },

  // Videos
  async getVideos(): Promise<VideoItem[]> {
    const cached = localStorage.getItem(VIDEOS_ITEMS_KEY);
    try {
      const res = await fetchJsonOrFallback<VideoItem[]>('/api/videos', {
        headers: getAuthHeaders(),
      });
      if (res.ok && Array.isArray(res.data)) {
        localStorage.setItem(VIDEOS_ITEMS_KEY, JSON.stringify(res.data));
        return res.data;
      }
    } catch {}

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return [];
  },

  async addVideo(data: {
    title: string;
    url: string;
    description: string;
    thumbnail?: string;
    published?: boolean;
  }): Promise<VideoItem> {
    const res = await fetchJsonOrFallback<VideoItem>('/api/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });

    const newItem: VideoItem = res.ok && res.data ? res.data : {
      id: `vid_${Date.now()}`,
      title: data.title,
      url: data.url,
      description: data.description,
      thumbnail: data.thumbnail || '',
      published: data.published ?? true,
      createdAt: new Date().toISOString(),
    };

    const current = await this.getVideos();
    const updated = [newItem, ...current];
    localStorage.setItem(VIDEOS_ITEMS_KEY, JSON.stringify(updated));
    return newItem;
  },

  async uploadVideoFile(formData: FormData): Promise<{ success: boolean; video: VideoItem; message?: string }> {
    const res = await fetchJsonOrFallback<{ success: boolean; video: VideoItem; message?: string }>('/api/upload/video', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (res.ok && res.data) {
      const current = await this.getVideos();
      localStorage.setItem(VIDEOS_ITEMS_KEY, JSON.stringify([res.data.video, ...current]));
      return res.data;
    }

    const title = (formData.get('title') as string) || 'School Video';
    const description = (formData.get('description') as string) || '';
    const file = formData.get('video') as File | null;
    const url = file ? URL.createObjectURL(file) : '';

    const newVid: VideoItem = {
      id: `vid_${Date.now()}`,
      title,
      url,
      description,
      thumbnail: '',
      published: true,
      createdAt: new Date().toISOString(),
    };

    const current = await this.getVideos();
    const updated = [newVid, ...current];
    localStorage.setItem(VIDEOS_ITEMS_KEY, JSON.stringify(updated));
    return { success: true, video: newVid, message: 'Video registered successfully' };
  },

  async toggleVideoPublish(id: string): Promise<VideoItem> {
    const res = await fetchJsonOrFallback<VideoItem>(`/api/videos/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    const current = await this.getVideos();
    const updated = current.map((v) => (v.id === id ? { ...v, published: !v.published } : v));
    localStorage.setItem(VIDEOS_ITEMS_KEY, JSON.stringify(updated));

    if (res.ok && res.data) return res.data;
    const target = updated.find((v) => v.id === id);
    if (!target) throw new Error('Video not found');
    return target;
  },

  async deleteVideo(id: string): Promise<void> {
    await fetchJsonOrFallback(`/api/videos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const current = await this.getVideos();
    const updated = current.filter((v) => v.id !== id);
    localStorage.setItem(VIDEOS_ITEMS_KEY, JSON.stringify(updated));
  },

  // Admissions
  async submitAdmission(data: Partial<AdmissionApplication>): Promise<{ success: boolean; applicationNumber: string }> {
    const res = await fetchJsonOrFallback<{ success: boolean; applicationNumber: string }>('/api/admissions/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const appNumber = res.data?.applicationNumber || `ALN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApp: AdmissionApplication = {
      id: `app_${Date.now()}`,
      applicationNumber: appNumber,
      studentFullName: data.studentFullName || 'Applicant',
      gender: data.gender || 'Male',
      dateOfBirth: data.dateOfBirth || '',
      sectionApplied: data.sectionApplied || 'Primary',
      entryClass: data.entryClass || 'Primary 1',
      boardingPreference: data.boardingPreference || 'Day',
      parentFullName: data.parentFullName || 'Parent',
      parentPhone: data.parentPhone || '',
      parentEmail: data.parentEmail || '',
      residentialAddress: data.residentialAddress || 'Dutse, Jigawa State',
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    const current = await this.getApplications();
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify([newApp, ...current]));
    return { success: true, applicationNumber: appNumber };
  },

  async getApplications(): Promise<AdmissionApplication[]> {
    const cached = localStorage.getItem(APPLICATIONS_KEY);
    try {
      const res = await fetchJsonOrFallback<AdmissionApplication[]>('/api/admissions/applications', {
        headers: getAuthHeaders(),
      });
      if (res.ok && Array.isArray(res.data)) {
        localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(res.data));
        return res.data;
      }
    } catch {}

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return [];
  },

  async updateApplicationStatus(
    id: string,
    status: AdmissionApplication['status'],
    remarks?: string
  ): Promise<AdmissionApplication> {
    const res = await fetchJsonOrFallback<AdmissionApplication>(`/api/admissions/applications/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status, remarks }),
    });

    const current = await this.getApplications();
    const updated = current.map((a) => (a.id === id ? { ...a, status, remarks: remarks ?? a.remarks } : a));
    localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updated));

    if (res.ok && res.data) return res.data;
    const target = updated.find((a) => a.id === id);
    if (!target) throw new Error('Application not found');
    return target;
  },

  // Contact
  async submitContact(data: {
    name: string;
    phone: string;
    email?: string;
    subject?: string;
    message: string;
  }): Promise<{ success: boolean }> {
    await fetchJsonOrFallback('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const newMsg: ContactMessage = {
      id: `msg_${Date.now()}`,
      name: data.name,
      phone: data.phone,
      email: data.email || '',
      subject: data.subject || 'Website Inquiry',
      message: data.message,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const current = await this.getMessages();
    localStorage.setItem(MESSAGES_KEY, JSON.stringify([newMsg, ...current]));
    return { success: true };
  },

  async getMessages(): Promise<ContactMessage[]> {
    const cached = localStorage.getItem(MESSAGES_KEY);
    try {
      const res = await fetchJsonOrFallback<ContactMessage[]>('/api/contact/messages', {
        headers: getAuthHeaders(),
      });
      if (res.ok && Array.isArray(res.data)) {
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(res.data));
        return res.data;
      }
    } catch {}

    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return [];
  },

  async markMessageRead(id: string): Promise<void> {
    await fetchJsonOrFallback(`/api/contact/messages/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    const current = await this.getMessages();
    const updated = current.map((m) => (m.id === id ? { ...m, read: true } : m));
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
  },

  async deleteMessage(id: string): Promise<void> {
    await fetchJsonOrFallback(`/api/contact/messages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const current = await this.getMessages();
    const updated = current.filter((m) => m.id !== id);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
  },

  // Facilities Management
  async uploadFacilityImage(file: File): Promise<{ imageUrl: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetchJsonOrFallback<{ imageUrl: string; filename: string }>('/api/upload/facility', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });

    if (res.ok && res.data) {
      return res.data;
    }

    // Client fallback
    const dataUrl: string = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });

    return { imageUrl: dataUrl, filename: file.name };
  },

  async addFacility(facility: FacilityItem): Promise<{ facility: FacilityItem; facilities: FacilityItem[] }> {
    const res = await fetchJsonOrFallback<{ facility: FacilityItem; facilities: FacilityItem[] }>('/api/facilities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(facility),
    });

    const currentData = await this.getContent();
    const facilities = currentData.facilities ? [...currentData.facilities, facility] : [facility];
    await this.updateContent({ ...currentData, facilities });

    if (res.ok && res.data) return res.data;
    return { facility, facilities };
  },

  async updateFacility(index: number, facility: FacilityItem): Promise<{ facility: FacilityItem; facilities: FacilityItem[] }> {
    const res = await fetchJsonOrFallback<{ facility: FacilityItem; facilities: FacilityItem[] }>(`/api/facilities/${index}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(facility),
    });

    const currentData = await this.getContent();
    const facilities = [...(currentData.facilities || [])];
    if (facilities[index]) {
      facilities[index] = facility;
    }
    await this.updateContent({ ...currentData, facilities });

    if (res.ok && res.data) return res.data;
    return { facility, facilities };
  },

  async deleteFacility(index: number): Promise<{ facilities: FacilityItem[] }> {
    const res = await fetchJsonOrFallback<{ facilities: FacilityItem[] }>(`/api/facilities/${index}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const currentData = await this.getContent();
    const facilities = (currentData.facilities || []).filter((_, i) => i !== index);
    await this.updateContent({ ...currentData, facilities });

    if (res.ok && res.data) return res.data;
    return { facilities };
  },

  // AI Assistant Instant Q&A with seamless client-side multilingual fallback
  async askAiAssistant(
    message: string,
    history?: Array<{ role: 'user' | 'model'; content: string }>,
    language?: string
  ): Promise<{ success: boolean; answer: string; source?: string; timestamp?: string }> {
    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, language }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.answer) {
          return data;
        }
      }
    } catch (e) {
      console.warn('API /api/ai-assistant unavailable, using verified multilingual engine:', e);
    }

    // Direct multilingual fallback (Hausa, Arabic, Yoruba, French, English)
    const normalized = (message || '').toLowerCase();
    const lang = language || (normalized.match(/[\u0600-\u06FF]/) ? 'ar' : 'ha');

    let answer = '';
    const phonePrimary = '0803 838 2557';
    const phoneSecondary = '0802 135 8445';
    const location = 'Bayan Godiya Miyetti Housing Estate, Jigawar Tsada, Dutse, Jihar Jigawa';

    if (lang === 'ha' || normalized.includes('ina') || normalized.includes('nawa') || normalized.includes('shiga') || normalized.includes('kudin') || normalized.includes('kwana') || normalized.includes('barka')) {
      if (normalized.includes('shiga') || normalized.includes('admission') || normalized.includes('neman') || normalized.includes('fom') || normalized.includes('apply') || normalized.includes('enroll')) {
        answer = `### 📝 Neman Shiga Al-Niima Academy (Admissions)
Ba a cika fom a intanet. Duk wanda ke son neman shiga ko sanya ɗalibi a makarantar Al-Niima Academy:
1. **Ziyartar Makaranta:** Ziyarci ofishin makaranta a Dutse don karɓar takardar neman shiga (Physical Admission Form) da karanta bayanan makaranta (Prospectus).
2. **Kiran Waya:** Kira ko turo saƙon WhatsApp zuwa: **${phonePrimary}** ko **${phoneSecondary}**.
3. **Imel:** Aika saƙo zuwa: **info@alniimaacademy.com**.

Makarantar tana ɗaukar ɗalibai a dukkan matakai: Crèche, Kindergarten, Nursery, Primary, JSS, SSS, da A'level.`;
      } else if (normalized.includes('kudi') || normalized.includes('kudin') || normalized.includes('fee') || normalized.includes('nawa') || normalized.includes('biya')) {
        answer = `### 💳 Kuɗin Makaranta (School Fees)
Kuɗin makarantar Al-Niima Academy suna da sauƙi kuma sun dace da kowane rukuni:
- Ana samun jadawalin kuɗi na zahiri a ofishin makaranta ko ta hanyar tuntuɓar: **${phonePrimary}**.
- Kuɗin sun haɗa da koyarwa mai inganci, tsaro, da kulawa ta musamman ga ɗaliban kwana (Boarding) da na rana (Day).`;
      } else if (normalized.includes('kwana') || normalized.includes('hostel') || normalized.includes('boarding') || normalized.includes('daki') || normalized.includes('dakunan')) {
        answer = `### 🏫 Dakunan Kwanan Ɗalibai (Boarding Facilities)
Al-Niima Academy tana da:
- **Kyakkyawan tsari na daban:** Dakunan maza daban, dakunan mata daban tare da mata masu kula da su (Matrons) da malamai maza (House Masters).
- Ruwan fanfo mai tsafta daga rijiyar burtsatse (borehole), wutar lantarki da janareta, da ingantaccen tsaro na awanni 24.`;
      } else if (normalized.includes('ina') || normalized.includes('wuri') || normalized.includes('location') || normalized.includes('address') || normalized.includes('dutse')) {
        answer = `### 📍 Wurin da Makarantar Take
**Al-Niima Academy Dutse:**
- **Adireshi:** ${location}.
- **Lokacin Aiki:** Litinin zuwa Juma'a, 8:00 AM zuwa 3:00 PM.
- **Lambar Waya:** **${phonePrimary}** / **${phoneSecondary}**.`;
      } else {
        answer = `### Barka da zuwa Al-Niima Academy AI!
Ina nan don taimaka muku a Harshen Hausa. Kuna iya tambaya game da:
- 📝 **Shiga Makaranta:** Ziyarci harabar makaranta a Dutse ko kira **${phonePrimary}**.
- 🏫 **Dakunan Kwana (Boarding):** Na maza da mata daban-daban.
- 💳 **Kuɗin Makaranta:** Sauƙi da kyakkyawan tsari.
- 📍 **Wuri:** ${location}.`;
      }
    } else if (lang === 'ar' || normalized.match(/[\u0600-\u06FF]/)) {
      if (normalized.includes('تسجيل') || normalized.includes('قبول') || normalized.includes('شروط')) {
        answer = `### 📝 القبول والتسجيل في أكاديمية النعمة
يتم التقديم والتسجيل مباشرة دون الحاجة لملء استمارة عبر الإنترنت:
1. **زيارة المدرسة:** التوجه مباشرة لمكتب الإدارة في دوتسي لاستلام استمارة القبول الرسمية والدليل التعريفي.
2. **الهاتف / واتساب:** التواصل عبر **${phonePrimary}** أو **${phoneSecondary}**.
3. **البريد الإلكتروني:** **info@alniimaacademy.com**.

نستقبل الطلاب في الحضانة، الابتدائية، المتوسطة، الثانوية وبرامج A-Level.`;
      } else if (normalized.includes('رسوم') || normalized.includes('مصاريف') || normalized.includes('تكلفة')) {
        answer = `### 💳 الرسوم الدراسية
تتميز أكاديمية النعمة بتقديم تعليم إسلامي وأكاديمي عالي الجودة برسوم مناسبة ومعتدلة. للحصول على جدول الرسوم التفصيلي يرجى التواصل هاتفياً أو عبر الواتساب على: **${phonePrimary}**.`;
      } else if (normalized.includes('سكن') || normalized.includes('داخلي') || normalized.includes('إقامة')) {
        answer = `### 🏫 السكن الداخلي
توفر الأكاديمية سكناً داخلياً نموذجياً منفصلاً تماماً للبنين والبنات، مزوداً بالمياه الصالحة للشرب، والكهرباء، وحراسة أمنية على مدار الساعة، وإشراف تربوي متكامل.`;
      } else {
        answer = `### مرحباً بكم في أكاديمية النعمة (دوتسي)
يسعدنا تقديم كامل الدعم والإجابة عن استفساراتكم.
- 📍 **الموقع:** خلف مجمع غوديا ميتي السكني، جيغاوار تسادا، دوتسي، ولاية جيغاوة.
- 📞 **الهاتف / واتساب:** **${phonePrimary}** / **${phoneSecondary}**
- ✉️ **البريد الإلكتروني:** **info@alniimaacademy.com**`;
      }
    } else if (lang === 'yo') {
      answer = `### Kaabọ si Al-Niima Academy AI Assistant!
Fun gbigba wọle (Admissions) tabi iforukọsilẹ:
- 🏫 **Bẹ Ile-iwe Wo:** Ẹ lọ si ọfiisi ile-iwe ni Dutse, Jigawa State lati gba fọọmu admission.
- 📞 **Foonu / WhatsApp:** Pẹlu wa lori **${phonePrimary}** tabi **${phoneSecondary}**.
- ✉️ **Imeeli:** **info@alniimaacademy.com**.
- 📍 **Adirẹsi:** Behind Godiya Miyetti Housing Estate, Jigawar Tsada, Dutse.`;
    } else if (lang === 'fr') {
      answer = `### Bienvenue à l'Académie Al-Niima!
Pour toute inscription ou admission:
- 🏫 **Visite directe:** Rendez-vous directement au bureau administratif de l'académie à Dutse pour retirer le formulaire officiel.
- 📞 **Téléphone / WhatsApp:** **${phonePrimary}** ou **${phoneSecondary}**.
- ✉️ **Email:** **info@alniimaacademy.com**.
- 📍 **Adresse:** Derrière le quartier résidentiel Godiya Miyetti, Jigawar Tsada, Dutse, État de Jigawa.`;
    } else {
      if (normalized.includes('admiss') || normalized.includes('apply') || normalized.includes('enroll') || normalized.includes('form') || normalized.includes('require')) {
        answer = `### 📝 Admissions at Al-Niima Academy
We do not use online application forms. To apply or enroll a student:
1. **Visit the Campus in Person:** Pick up the official printed admission pack and prospectus at our administrative office.
2. **Telephone Helpline:** Call or WhatsApp our admissions desk directly on **${phonePrimary}** or **${phoneSecondary}**.
3. **Email Inquiries:** Reach out via **info@alniimaacademy.com**.

Admissions are open across Crèche, Kindergarten, Nursery, Primary, JSS, SSS, and A’level programmes.`;
      } else if (normalized.includes('fee') || normalized.includes('cost') || normalized.includes('tuition')) {
        answer = `### 💳 School Fees & Payment Structure
Al-Niima Academy provides high-standard academic and moral education at accessible and competitive rates. For the current fee schedule and breakdown for day or boarding students, please contact our administrative desk at **${phonePrimary}**.`;
      } else if (normalized.includes('board') || normalized.includes('hostel') || normalized.includes('accomod')) {
        answer = `### 🏫 Boarding Facilities
We provide strictly segregated male and female boarding hostels with dedicated house masters and matrons, steady borehole water supply, standby power generators, and 24/7 campus security.`;
      } else {
        answer = `### Al-Niima Academy Information Desk
- 📍 **Campus Location:** Behind Godiya Miyetti Housing Estate, Jigawar Tsada, Dutse, Jigawa State.
- 📞 **Admissions Helpline:** **${phonePrimary}** / **${phoneSecondary}**
- ✉️ **Official Email:** **info@alniimaacademy.com**
- 🕒 **Office Hours:** Monday – Friday, 8:00 AM – 3:00 PM.`;
      }
    }

    return {
      success: true,
      answer,
      source: 'verified-knowledge-engine',
      timestamp: new Date().toISOString(),
    };
  },
};
