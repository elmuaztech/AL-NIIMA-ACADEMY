/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SchoolData, GalleryItem, VideoItem } from './types/school';
import { defaultSchoolData } from './data/defaultData';
import { api, authStorage } from './services/api';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingActions } from './components/FloatingActions';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { SectionsPage } from './pages/SectionsPage';
import { AcademicsPage } from './pages/AcademicsPage';
import { BoardingPage } from './pages/BoardingPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { GalleryPage } from './pages/GalleryPage';
import { AdmissionsPage } from './pages/AdmissionsPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { useScrollSpy } from './hooks/useScrollSpy';

const SECTION_IDS = [
  'home',
  'about',
  'sections',
  'gallery',
  'academics',
  'boarding',
  'facilities',
  'admissions',
  'contact',
];

export default function App() {
  const [data, setData] = useState<SchoolData>(defaultSchoolData);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Active scroll-spied section on the homepage
  const activeSection = useScrollSpy(SECTION_IDS, 110);

  // Smoothly scroll to a section on the page
  const scrollToTarget = useCallback((targetId: string) => {
    if (targetId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.replaceState(null, '', ' ');
      return;
    }

    const el = document.getElementById(targetId);
    if (el) {
      const headerOffset = 72;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      history.replaceState(null, '', `#${targetId}`);
    }
  }, []);

  // Central navigation handler
  const navigateTo = useCallback((target: string) => {
    if (target === 'admin') {
      setCurrentPage('admin');
      window.location.hash = 'admin';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // If currently on admin page, switch to home first then scroll
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        scrollToTarget(target);
      }, 60);
      return;
    }

    // Already on homepage, smooth-scroll to section
    scrollToTarget(target);
  }, [currentPage, scrollToTarget]);

  // Sync with browser hash on initial load and back/forward
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash === 'admin') {
        setCurrentPage('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (SECTION_IDS.includes(hash)) {
        if (currentPage !== 'home') {
          setCurrentPage('home');
          setTimeout(() => scrollToTarget(hash), 150);
        } else {
          scrollToTarget(hash);
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [currentPage, scrollToTarget]);

  // Fetch school content from API
  const loadSchoolData = async () => {
    try {
      const serverData = await api.getContent();
      if (serverData && serverData.general) {
        setData(serverData);
      }
    } catch (err) {
      console.warn('Using default school data fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch public media
  const loadMedia = async () => {
    try {
      const [gal, vids] = await Promise.all([api.getGallery(), api.getVideos()]);
      setGalleryItems(gal);
      setVideos(vids);
    } catch (err) {
      console.warn('Could not load gallery/videos:', err);
    }
  };

  // Check admin auth status
  const checkAuth = async () => {
    if (authStorage.getToken()) {
      try {
        const valid = await api.verifyAuth();
        setIsAdminLoggedIn(valid);
      } catch {
        setIsAdminLoggedIn(false);
      }
    }
  };

  useEffect(() => {
    loadSchoolData();
    loadMedia();
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-emerald-800 selection:text-white">
      {/* Primary Navigation Header with Scroll-Spy Integration */}
      <Header
        currentPage={currentPage}
        activeSection={activeSection}
        onNavigate={navigateTo}
        general={data.general}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Page Content Body */}
      <main className="flex-1 pb-16">
        <div key={currentPage} className="animate-fade-in">
          {currentPage === 'home' && (
            <HomePage
              data={data}
              galleryItems={galleryItems}
              videos={videos}
              onNavigate={navigateTo}
            />
          )}

          {/* Standalone Deep-Dive Pages if accessed directly */}
          {currentPage === 'about' && (
            <AboutPage data={data} onNavigate={navigateTo} />
          )}

          {currentPage === 'sections' && (
            <SectionsPage sections={data.sections} onNavigate={navigateTo} />
          )}

          {currentPage === 'academics' && (
            <AcademicsPage
              academics={data.academics}
              clubs={data.clubs}
              onNavigate={navigateTo}
            />
          )}

          {currentPage === 'boarding' && (
            <BoardingPage boarding={data.boarding} onNavigate={navigateTo} />
          )}

          {currentPage === 'facilities' && (
            <FacilitiesPage facilities={data.facilities} onNavigate={navigateTo} />
          )}

          {currentPage === 'gallery' && (
            <GalleryPage
              galleryItems={galleryItems}
              videos={videos}
              onNavigate={navigateTo}
            />
          )}

          {currentPage === 'admissions' && (
            <AdmissionsPage
              admissions={data.admissions}
              sections={data.sections}
              onNavigate={navigateTo}
            />
          )}

          {currentPage === 'contact' && <ContactPage general={data.general} />}

          {/* Secure Admin Portal */}
          {currentPage === 'admin' && (
            <AdminPage
              data={data}
              onRefreshData={async () => {
                await loadSchoolData();
                await loadMedia();
              }}
              onCloseAdmin={() => navigateTo('home')}
              isLoggedIn={isAdminLoggedIn}
              setIsLoggedIn={setIsAdminLoggedIn}
            />
          )}
        </div>
      </main>

      {/* Institutional Footer */}
      <Footer
        general={data.general}
        onNavigate={navigateTo}
        onOpenAdmin={() => navigateTo('admin')}
      />

      {/* Floating Real WhatsApp Button & AI Assistant (stacked vertically) */}
      {currentPage !== 'admin' && (
        <FloatingActions
          primaryPhone={data.general?.phoneNumbers?.[0] || '08038382557'}
          secondaryPhone={data.general?.phoneNumbers?.[1] || '08021358445'}
        />
      )}
    </div>
  );
}
