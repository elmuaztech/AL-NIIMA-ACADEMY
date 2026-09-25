import React from 'react';
import { AdmissionsInfo, SchoolSection } from '../types/school';
import {
  Building2,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

interface AdmissionsPageProps {
  admissions: AdmissionsInfo;
  sections: SchoolSection[];
  onNavigate: (page: string) => void;
}

export const AdmissionsPage: React.FC<AdmissionsPageProps> = ({
  admissions,
  sections,
  onNavigate,
}) => {
  const primaryPhone = '08038382557';
  const secondaryPhone = '08021358445';
  const schoolEmail = 'info@alniimaacademy.com';

  const scrollToEnrollInfo = () => {
    const el = document.getElementById('enroll-contact-info');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 py-8">
      {/* 1. Page Header Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#093c20] text-white rounded-3xl p-6 sm:p-10 md:p-12 relative overflow-hidden border-b-4 border-yellow-400 shadow-xl">
          <div className="relative max-w-4xl space-y-4">
            <span className="text-xs uppercase font-poppins font-bold tracking-widest text-yellow-400 bg-[#062c17] px-3.5 py-1 rounded-full border border-yellow-400/30 inline-block">
              Enrolment Information
            </span>
            <h1 className="font-poppins font-black text-2xl sm:text-3xl md:text-5xl text-white tracking-tight leading-tight">
              Admissions at <span className="text-yellow-400 whitespace-nowrap">Al-Niima Academy</span>
            </h1>
            <p className="font-poppins text-stone-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl">
              We warmly welcome prospective parents and guardians seeking standard education and moral grounding from Early Years through Secondary, A’level, and Boarding in Dutse, Jigawa State.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={scrollToEnrollInfo}
                className="bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-poppins font-bold text-xs sm:text-sm px-8 py-3.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                How to Enroll / Contact Us
              </button>
              <a
                href={`tel:${primaryPhone}`}
                className="inline-flex items-center gap-2 bg-emerald-900/80 hover:bg-emerald-900 text-white border border-yellow-400/40 font-poppins font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-full transition-colors"
              >
                <Phone className="w-4 h-4 text-yellow-400" />
                <span>Call Admissions ({primaryPhone})</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW TO APPLY & ENROLL (Prominent Direct Notice) */}
      <section id="enroll-contact-info" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white border-2 border-[#093c20]/20 rounded-3xl p-6 sm:p-10 md:p-12 shadow-md space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#093c20] uppercase tracking-widest bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 inline-block">
              Direct Application Policy
            </span>
            <h2 className="font-poppins font-black text-2xl sm:text-4xl text-[#093c20]">
              How to Apply & Enroll
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              We do not use online forms. Parents and guardians wishing to apply or enroll their children are invited to either <strong className="text-stone-900">visit the school campus directly</strong> or <strong className="text-stone-900">contact the admissions desk via telephone or email</strong>.
            </p>
          </div>

          {/* 3 Clear Enrollment Channels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            {/* Channel 1: Walk-in Visit to Campus */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 flex flex-col justify-between hover:border-[#093c20]/50 transition-all hover:shadow-sm">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#093c20] text-yellow-400 flex items-center justify-center shadow-sm">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Option 1 • In Person
                  </span>
                  <h3 className="font-poppins font-bold text-lg text-stone-900 mt-1">
                    Visit School Campus
                  </h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Visit our Administrative Office to obtain the official printed Admission Form, collect the student prospectus, and tour our modern classrooms and hostels.
                </p>
                <div className="space-y-2 text-xs text-stone-700 bg-white p-3.5 rounded-xl border border-stone-200">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-[#093c20] shrink-0 mt-0.5" />
                    <span>Behind Godiya Miyetti Housing Estate, Jigawar Tsada, Dutse, Jigawa State</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Mon – Fri: 8:00 AM – 3:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href="https://maps.google.com/?q=Dutse+Jigawa+State+Nigeria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#093c20] hover:bg-emerald-900 text-yellow-400 font-poppins font-bold text-xs py-3 px-4 rounded-xl transition-colors shadow-xs"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Get Campus Directions</span>
                </a>
              </div>
            </div>

            {/* Channel 2: Telephone Helpline & WhatsApp */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-400 transition-all hover:shadow-sm">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Option 2 • Immediate Support
                  </span>
                  <h3 className="font-poppins font-bold text-lg text-stone-900 mt-1">
                    Contact via Phone / WhatsApp
                  </h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Speak directly with our Admissions Desk for entrance exam dates, available seats, fees, and requirements for day and boarding students.
                </p>
                <div className="space-y-2 text-xs text-stone-800 bg-white p-3.5 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-stone-500">Admissions Line:</span>
                    <a href={`tel:${primaryPhone}`} className="font-bold text-[#093c20] hover:underline font-mono">
                      {primaryPhone}
                    </a>
                  </div>
                  <div className="flex items-center justify-between border-t border-stone-100 pt-1.5">
                    <span className="font-medium text-stone-500">Admin Desk:</span>
                    <a href={`tel:${secondaryPhone}`} className="font-bold text-[#093c20] hover:underline font-mono">
                      {secondaryPhone}
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-2">
                <a
                  href={`tel:${primaryPhone}`}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#093c20] hover:bg-emerald-900 text-white font-poppins font-bold text-xs py-3 px-4 rounded-xl transition-colors shadow-xs"
                >
                  <Phone className="w-4 h-4 text-yellow-400" />
                  <span>Call Now ({primaryPhone})</span>
                </a>
                <a
                  href={`https://wa.me/234${primaryPhone.slice(1)}?text=${encodeURIComponent('Hello Al-Niima Academy, I would like to inquire about admissions and student enrollment.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-poppins font-bold text-xs py-2.5 px-4 rounded-xl transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Channel 3: Official Email Desk */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 flex flex-col justify-between hover:border-[#093c20]/50 transition-all hover:shadow-sm">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shadow-sm">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                    Option 3 • Written Inquiries
                  </span>
                  <h3 className="font-poppins font-bold text-lg text-stone-900 mt-1">
                    Contact via Email
                  </h3>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Send your prospective student’s details or inquiry letter via email. Our administrative office responds with the admission prospectus within 24 hours.
                </p>
                <div className="space-y-1.5 text-xs text-stone-700 bg-white p-3.5 rounded-xl border border-stone-200">
                  <p className="font-medium text-stone-500">Official Admissions Email:</p>
                  <a
                    href={`mailto:${schoolEmail}?subject=Admissions%20Inquiry%20-%20Al-Niima%20Academy`}
                    className="font-bold text-[#093c20] hover:underline break-all block font-mono text-xs"
                  >
                    {schoolEmail}
                  </a>
                </div>
              </div>

              <div className="pt-6">
                <a
                  href={`mailto:${schoolEmail}?subject=Admissions%20Inquiry%20-%20Al-Niima%20Academy`}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#093c20] hover:bg-emerald-900 text-yellow-400 font-poppins font-bold text-xs py-3 px-4 rounded-xl transition-colors shadow-xs"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Email to Admissions</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DOCUMENTED REQUIREMENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="max-w-3xl space-y-1">
            <span className="text-xs font-bold text-[#093c20] uppercase tracking-widest">
              Authoritative School Policy
            </span>
            <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#093c20]">
              Admission Requirements
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              As stated in the official Al-Niima Academy Admission Handbook, candidates must satisfy the following criteria:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {admissions.requirements.map((req, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl"
              >
                <div className="w-6 h-6 rounded-full bg-[#093c20] text-amber-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed">
                  {req}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Important Notice to Parents:</strong>
              <span>
                School fees must be settled prior to student resumption. Timely submission of the official acceptance form is strictly required to secure the offered admission slot.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STEP BY STEP PROCEDURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-[#093c20] uppercase tracking-widest">
            Simple 4-Step Process
          </span>
          <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-[#093c20]">
            Admissions Procedure
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Follow these simple steps to enroll your child into Al-Niima Academy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#093c20] text-yellow-400 flex items-center justify-center text-xs font-bold shadow-xs">
              1
            </div>
            <h3 className="font-poppins font-bold text-sm text-[#093c20]">
              Campus Visit or Call
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Visit our administrative office in Dutse to obtain the physical admission form, or call our admissions lines to request details.
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#093c20] text-yellow-400 flex items-center justify-center text-xs font-bold shadow-xs">
              2
            </div>
            <h3 className="font-poppins font-bold text-sm text-[#093c20]">
              Submit Documents
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Return the completed form along with passport photos, birth certificate, and previous academic records (for transfer students).
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#093c20] text-yellow-400 flex items-center justify-center text-xs font-bold shadow-xs">
              3
            </div>
            <h3 className="font-poppins font-bold text-sm text-[#093c20]">
              Assessment & Screening
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              The candidate undertakes an interactive entrance evaluation and placement test to determine academic readiness and proper stream placement.
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-full bg-[#093c20] text-yellow-400 flex items-center justify-center text-xs font-bold shadow-xs">
              4
            </div>
            <h3 className="font-poppins font-bold text-sm text-[#093c20]">
              Offer & Registration
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Successful applicants receive official admission letters, fee schedules, uniform sizing, and hostel allocations (for boarders).
            </p>
          </div>
        </div>
      </section>

      {/* 5. Inquiries Footer Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-[#093c20] to-[#0d5930] text-white rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-lg border-2 border-yellow-400/40">
          <GraduationCap className="w-10 h-10 text-yellow-400 mx-auto" />
          <h3 className="font-poppins font-bold text-xl sm:text-2xl text-white">
            Have Questions About Enrolling for the Upcoming Term?
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Our admissions counselors are readily available to guide you through fees, boarding hostel arrangements, and subject selections.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <a
              href={`tel:${primaryPhone}`}
              className="bg-yellow-400 hover:bg-yellow-300 text-stone-950 font-poppins font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition-transform hover:scale-105"
            >
              Call {primaryPhone}
            </a>
            <a
              href={`https://wa.me/234${primaryPhone.slice(1)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-poppins font-bold text-xs sm:text-sm px-6 py-3 rounded-full transition-transform hover:scale-105 inline-flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
