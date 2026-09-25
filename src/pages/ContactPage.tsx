import React, { useState } from 'react';
import { GeneralInfo } from '../types/school';
import { api } from '../services/api';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Send,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';

interface ContactPageProps {
  general: GeneralInfo;
}

export const ContactPage: React.FC<ContactPageProps> = ({ general }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSubmitSuccess(false);

    try {
      await api.submitContact(formData);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: 'General Inquiry',
        message: '',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 py-8">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#093c20] text-white rounded-2xl p-6 sm:p-10 md:p-12 relative overflow-hidden border-b-4 border-yellow-400 shadow-md">
          <div className="relative max-w-4xl space-y-3">
            <span className="text-xs uppercase font-poppins font-bold tracking-widest text-yellow-400 bg-[#062c17] px-3 py-1 rounded-full border border-yellow-400/30 inline-block">
              Get in Touch
            </span>
            <h1 className="font-poppins font-black text-xl sm:text-3xl md:text-4xl text-white tracking-tight leading-tight">
              Contact <span className="text-yellow-400 whitespace-nowrap">Al-Niima Academy</span>
            </h1>
            <p className="font-poppins text-stone-200 text-xs sm:text-sm leading-relaxed max-w-2xl">
              We are pleased to assist you with inquiries regarding admissions, academics, and boarding facilities in Dutse, Jigawa State.
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid: Details & Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Information (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border-2 border-emerald-900/10 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="space-y-1 border-b border-stone-200 pb-4">
                <span className="text-xs font-bold text-[#093c20] uppercase tracking-widest font-poppins">
                  Direct School Contacts
                </span>
                <h2 className="font-poppins font-bold text-xl sm:text-2xl text-[#093c20] whitespace-nowrap">
                  AL-NIIMA ACADEMY
                </h2>
                <p className="font-poppins italic text-xs text-yellow-700">
                  “{general.motto}”
                </p>
              </div>

              <div className="space-y-5 text-xs sm:text-sm text-stone-700">
                {/* Address */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                    <MapPin className="w-5 h-5 text-emerald-800" />
                  </div>
                  <div className="space-y-0.5">
                    <strong className="block text-emerald-950 font-bold text-xs">
                      School Address
                    </strong>
                    <p className="text-stone-600 leading-relaxed">
                      Behind Godiya Miyetti Housing Estate, Jigawar Tsada, Dutse, Jigawa State, Nigeria.
                    </p>
                  </div>
                </div>

                {/* Telephone */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Phone className="w-5 h-5 text-emerald-800" />
                  </div>
                  <div className="space-y-1">
                    <strong className="block text-emerald-950 font-bold text-xs">
                      Phone Numbers
                    </strong>
                    <div className="flex flex-col gap-0.5 font-medium text-emerald-900">
                      <a href="tel:08038382557" className="hover:underline">
                        08038382557
                      </a>
                      <a href="tel:08021358445" className="hover:underline">
                        08021358445
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Mail className="w-5 h-5 text-emerald-800" />
                  </div>
                  <div className="space-y-1">
                    <strong className="block text-emerald-950 font-bold text-xs">
                      Official Email
                    </strong>
                    <div className="flex flex-col gap-0.5">
                      <a href={`mailto:${general.email}`} className="text-emerald-900 font-medium hover:underline">
                        {general.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Website */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Globe className="w-5 h-5 text-emerald-800" />
                  </div>
                  <div className="space-y-0.5">
                    <strong className="block text-emerald-950 font-bold text-xs">
                      Official Website
                    </strong>
                    <p className="text-emerald-900 font-medium">{general.website}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Reference Card */}
            <div className="bg-stone-100 border border-stone-300 rounded-xl p-6 space-y-3">
              <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-sm">
                <Building className="w-4 h-4 text-emerald-800" />
                <span>Finding the School in Dutse</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Al-Niima Academy is situated in Jigawar Tsada, situated directly behind the Godiya Miyetti Housing Estate in Dutse, the capital of Jigawa State. Visitors should report to the Main Security Gate upon arrival for visitor clearance.
              </p>
            </div>
          </div>

          {/* Contact Form (Right) */}
          <div className="lg:col-span-7">
            <div className="bg-white border-2 border-emerald-800/20 rounded-xl p-6 sm:p-8 shadow-md space-y-6">
              <div className="border-b border-stone-200 pb-3 space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                  Direct Inquiries
                </span>
                <h3 className="font-serif font-bold text-2xl text-emerald-950">
                  Send a Message to the School
                </h3>
                <p className="text-xs sm:text-sm text-stone-600">
                  Leave a message for the school administration. We respond promptly to all parental and educational inquiries.
                </p>
              </div>

              {submitSuccess && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-5 flex items-center gap-3 text-xs sm:text-sm text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <strong className="block font-bold">Thank you for contacting Al-Niima Academy!</strong>
                    <span>Your message has been received by the administration. We will get back to you shortly.</span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hajiya Maryam Bello"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0803XXXXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Inquiry Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700 bg-white"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Admissions & Entrance Exam">Admissions & Entrance Exam</option>
                      <option value="Boarding Hostels (Male / Female)">Boarding Hostels (Male / Female)</option>
                      <option value="Early Years / Primary">Early Years / Primary</option>
                      <option value="Secondary / A’level">Secondary / A’level</option>
                      <option value="School Fees & Acceptance">School Fees & Acceptance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write your questions or message here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-md border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm px-7 py-3 rounded-md shadow transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Sending Message...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-amber-400" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
