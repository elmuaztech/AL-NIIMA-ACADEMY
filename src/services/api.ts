import {
  SchoolData,
  GalleryItem,
  VideoItem,
  AdmissionApplication,
  ContactMessage,
  FacilityItem,
} from '../types/school';

const AUTH_TOKEN_KEY = 'alniima_admin_token';

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

export const api = {
  // Authentication
  async login(password: string): Promise<{ success: boolean; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error || 'Authentication failed');
    }
    const data = await res.json();
    authStorage.setToken(data.token);
    return data;
  },

  async verifyAuth(): Promise<boolean> {
    const token = authStorage.getToken();
    if (!token) return false;
    try {
      const res = await fetch('/api/auth/verify', {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      return !!data.valid;
    } catch {
      return false;
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (e) {
      console.error(e);
    }
    authStorage.clearToken();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to change password' }));
      throw new Error(err.error || 'Failed to change password');
    }
  },

  // Content
  async getContent(): Promise<SchoolData> {
    const res = await fetch('/api/content');
    if (!res.ok) throw new Error('Failed to fetch school content');
    return res.json();
  },

  async updateContent(data: SchoolData): Promise<void> {
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update content');
  },

  // Gallery
  async getGallery(): Promise<GalleryItem[]> {
    const res = await fetch('/api/gallery', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch gallery');
    return res.json();
  },

  async uploadGalleryImage(formData: FormData): Promise<GalleryItem> {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Upload failed');
    }
    return res.json();
  },

  async toggleGalleryPublish(id: string): Promise<GalleryItem> {
    const res = await fetch(`/api/gallery/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle gallery item status');
    return res.json();
  },

  async deleteGalleryImage(id: string): Promise<void> {
    const res = await fetch(`/api/gallery/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete gallery image');
  },

  // Videos
  async getVideos(): Promise<VideoItem[]> {
    const res = await fetch('/api/videos', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch videos');
    return res.json();
  },

  async addVideo(data: {
    title: string;
    url: string;
    description: string;
    thumbnail?: string;
    published?: boolean;
  }): Promise<VideoItem> {
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to add video' }));
      throw new Error(err.error || 'Failed to add video');
    }
    return res.json();
  },

  async uploadVideoFile(formData: FormData): Promise<{ success: boolean; video: VideoItem; message?: string }> {
    const res = await fetch('/api/upload/video', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Failed to upload video');
    }
    return res.json();
  },

  async toggleVideoPublish(id: string): Promise<VideoItem> {
    const res = await fetch(`/api/videos/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to toggle video status');
    return res.json();
  },

  async deleteVideo(id: string): Promise<void> {
    const res = await fetch(`/api/videos/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete video');
  },

  // Admissions
  async submitAdmission(data: Partial<AdmissionApplication>): Promise<{ success: boolean; applicationNumber: string }> {
    const res = await fetch('/api/admissions/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to submit application' }));
      throw new Error(err.error || 'Failed to submit application');
    }
    return res.json();
  },

  async getApplications(): Promise<AdmissionApplication[]> {
    const res = await fetch('/api/admissions/applications', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
  },

  async updateApplicationStatus(
    id: string,
    status: AdmissionApplication['status'],
    remarks?: string
  ): Promise<AdmissionApplication> {
    const res = await fetch(`/api/admissions/applications/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status, remarks }),
    });
    if (!res.ok) throw new Error('Failed to update application');
    return res.json();
  },

  // Contact
  async submitContact(data: {
    name: string;
    phone: string;
    email?: string;
    subject?: string;
    message: string;
  }): Promise<{ success: boolean }> {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to send message' }));
      throw new Error(err.error || 'Failed to send message');
    }
    return res.json();
  },

  async getMessages(): Promise<ContactMessage[]> {
    const res = await fetch('/api/contact/messages', {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  async markMessageRead(id: string): Promise<void> {
    const res = await fetch(`/api/contact/messages/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to update message');
  },

  async deleteMessage(id: string): Promise<void> {
    const res = await fetch(`/api/contact/messages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete message');
  },

  // Facilities Management
  async uploadFacilityImage(file: File): Promise<{ imageUrl: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/upload/facility', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(err.error || 'Failed to upload facility image');
    }
    return res.json();
  },

  async addFacility(facility: FacilityItem): Promise<{ facility: FacilityItem; facilities: FacilityItem[] }> {
    const res = await fetch('/api/facilities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(facility),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to add facility' }));
      throw new Error(err.error || 'Failed to add facility');
    }
    return res.json();
  },

  async updateFacility(index: number, facility: FacilityItem): Promise<{ facility: FacilityItem; facilities: FacilityItem[] }> {
    const res = await fetch(`/api/facilities/${index}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(facility),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to update facility' }));
      throw new Error(err.error || 'Failed to update facility');
    }
    return res.json();
  },

  async deleteFacility(index: number): Promise<{ facilities: FacilityItem[] }> {
    const res = await fetch(`/api/facilities/${index}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to delete facility' }));
      throw new Error(err.error || 'Failed to delete facility');
    }
    return res.json();
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
