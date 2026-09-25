export interface GeneralInfo {
  name: string;
  motto: string;
  location: string;
  address: string;
  phoneNumbers: string[];
  email: string;
  documentEmail?: string;
  website: string;
  workingHours?: string;
}

export interface HeroInfo {
  title: string;
  subtitle: string;
  welcomeMessage: string;
  badgeText: string;
  heroImageUrl: string;
}

export interface MissionVision {
  mission: string;
  vision: string;
}

export interface EthosValue {
  title: string;
  description: string;
}

export interface Announcement {
  enabled: boolean;
  text: string;
  date: string;
  actionUrl: string;
}

export interface SchoolSection {
  id: string;
  category: string;
  title: string;
  ageRange: string;
  description: string;
}

export interface SubjectItem {
  name: string;
  description: string;
}

export interface AcademicsInfo {
  jssSubjects: SubjectItem[];
  sssInformation: string;
  aLevelInformation: string;
}

export interface ClubItem {
  name: string;
  category: string;
  description: string;
}

export interface BoardingFeature {
  title: string;
  detail: string;
}

export interface BoardingInfo {
  title: string;
  description: string;
  maleFemaleSeparate: boolean;
  features: BoardingFeature[];
}

export interface FacilityItem {
  name: string;
  category: string;
  description: string;
  imageUrl?: string;
}

export interface AdmissionsInfo {
  requirements: string[];
  steps: { step: number; title: string; desc: string }[];
  notes: string;
}

export interface SchoolData {
  general: GeneralInfo;
  hero: HeroInfo;
  missionVision: MissionVision;
  ethosAndValues: EthosValue[];
  announcement: Announcement;
  sections: SchoolSection[];
  academics: AcademicsInfo;
  clubs: ClubItem[];
  boarding: BoardingInfo;
  facilities: FacilityItem[];
  admissions: AdmissionsInfo;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  filename: string;
  published: boolean;
  createdAt: string;
}

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  description: string;
  thumbnail: string;
  published: boolean;
  fileSize?: number;
  originalSize?: number;
  compressed?: boolean;
  createdAt: string;
}

export interface AdmissionApplication {
  id: string;
  applicationNumber: string;
  studentFullName: string;
  gender: string;
  dateOfBirth: string;
  sectionApplied: string;
  entryClass: string;
  boardingPreference: 'Day' | 'Boarding (Male Hostel)' | 'Boarding (Female Hostel)';
  parentFullName: string;
  parentPhone: string;
  parentEmail?: string;
  residentialAddress: string;
  previousSchool?: string;
  additionalNotes?: string;
  status: 'Pending' | 'Under Review' | 'Accepted' | 'Declined';
  remarks?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}
