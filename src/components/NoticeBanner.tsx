import React from 'react';
import { Bell, ArrowRight, X } from 'lucide-react';
import { Announcement } from '../types/school';

interface NoticeBannerProps {
  announcement?: Announcement;
  onNavigate?: (page: string) => void;
}

export const NoticeBanner: React.FC<NoticeBannerProps> = () => {
  return null;
};
