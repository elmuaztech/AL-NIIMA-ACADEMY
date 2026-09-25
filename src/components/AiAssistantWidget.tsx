import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Send,
  X,
  User,
  Copy,
  Check,
  RotateCcw,
  MessageCircle,
  Loader2,
  Mic,
  MicOff,
  Globe,
} from 'lucide-react';
import { api } from '../services/api';

// Dedicated, universally recognizable AI Symbol Icon
// Clean neural cyber-intelligence icon (antenna node, neural core, glowing ocular sensors, cyber grid)
export const AiSymbolIcon: React.FC<{ className?: string }> = ({
  className = 'w-8 h-8 sm:w-8.5 sm:h-8.5',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    {/* Top Antenna Beacon */}
    <circle cx="12" cy="2.5" r="1.5" />
    <path d="M12 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    {/* Left and Right Audio/Circuit Nodes */}
    <rect x="1.5" y="10.5" width="2" height="4" rx="1" />
    <rect x="20.5" y="10.5" width="2" height="4" rx="1" />
    {/* AI Cyber Head Body */}
    <path d="M5 8.5C5 7.12 6.12 6 7.5 6h9C17.88 6 19 7.12 19 8.5v8c0 1.38-1.12 2.5-2.5 2.5h-9C6.12 19 5 17.88 5 16.5v-8z" />
    {/* Eye Sensors and Neural Smile */}
    <circle cx="9" cy="11.5" r="1.6" fill="#093c20" />
    <circle cx="15" cy="11.5" r="1.6" fill="#093c20" />
    <circle cx="9.4" cy="11.1" r="0.6" fill="#ffffff" />
    <circle cx="15.4" cy="11.1" r="0.6" fill="#ffffff" />
    {/* Digital Expression Bar */}
    <path
      d="M9 15.5h6"
      stroke="#093c20"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  source?: string;
}

interface AiAssistantWidgetProps {
  schoolPhone?: string;
}

type SupportedLanguage = 'ha' | 'en' | 'ar' | 'yo' | 'fr';

interface LangOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
  placeholder: string;
  sampleQuestions: string[];
}

const LANGUAGES: LangOption[] = [
  {
    code: 'ha',
    label: 'Hausa',
    nativeLabel: 'Hausa',
    flag: '🇳🇬',
    placeholder: 'Rubuta tambayarku a Hausa a nan...',
    sampleQuestions: [
      '📝 Yaya ake neman shiga makaranta?',
      '🏫 Dakunan kwanan dalibai (Boarding)',
      '💳 Nawa ne kudin makaranta?',
      '📍 Ina ne makarantar take a Dutse?',
      '📞 Lambar WhatsApp ta makaranta',
    ],
  },
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    flag: '🇬🇧',
    placeholder: 'Ask about admissions, fees, boarding...',
    sampleQuestions: [
      '📝 How do I apply for admission?',
      '🏫 Tell me about boarding facilities',
      '💳 What are the school fees?',
      '📍 Where is the school located in Dutse?',
    ],
  },
  {
    code: 'ar',
    label: 'Arabic',
    nativeLabel: 'العربية',
    flag: '🇸🇦',
    placeholder: 'اكتب سؤالك بالعربية هنا...',
    sampleQuestions: [
      '📝 ما هي شروط القبول والتسجيل؟',
      '🏫 تفاصيل السكن الداخلي للبنين والبنات',
      '💳 ما هي الرسوم الدراسية؟',
      '📍 أين تقع المدرسة في دوتسي؟',
    ],
  },
  {
    code: 'yo',
    label: 'Yorùbá',
    nativeLabel: 'Yorùbá',
    flag: '🇳🇬',
    placeholder: 'Beere ibeere ni ede Yorùbá...',
    sampleQuestions: [
      '📝 Bawo ni a se n gba wọle?',
      '🏫 So nipa ile gbigbe (boarding)',
      '💳 Elo ni owo ile-iwe?',
      '📍 Nibo ni ile-iwe wa ni Dutse?',
    ],
  },
  {
    code: 'fr',
    label: 'French',
    nativeLabel: 'Français',
    flag: '🇫🇷',
    placeholder: 'Posez votre question en français...',
    sampleQuestions: [
      '📝 Comment s’inscrire à l’académie?',
      '🏫 Infos sur l’internat garçons et filles',
      '💳 Quels sont les frais de scolarité?',
      '📍 Où se trouve l’école à Dutse?',
    ],
  },
];

const WELCOME_MESSAGES: Record<SupportedLanguage, string> = {
  ha: `**Barka da zuwa Al-Niima Academy AI Assistant!**
Ina nan don taimaka muku da amsoshin tambayoyi a **Harshen Hausa** game da:
- 📝 **Shiga makaranta (Admissions)**
- 🏫 **Dakunan kwanan ɗalibai (Boarding na maza da mata)**
- 💳 **Kuɗin makaranta**
- 📍 **Wurin da makarantar take a Dutse, Jihar Jigawa**
- 📞 **Lambar WhatsApp:** **+234 803 838 2557**

Wace tambaya kuke da ita a yau?`,
  en: `**Welcome to Al-Niima Academy AI Assistant!**
I can help answer your questions in **Hausa, English, Arabic, Yoruba, and French** about:
- 📝 **Admissions & Entrance Requirements**
- 🏫 **Separate Boys & Girls Boarding Hostels**
- 💳 **Tuition & School Fees**
- 📍 **Campus Location in Dutse, Jigawa State**
- 📞 **Official WhatsApp Desk:** **+234 803 838 2557**

How can I assist you today?`,
  ar: `**السلام عليكم ورحمة الله وبركاته! أهلاً بكم في أكاديمية النعمة**
أنا المساعد الذكي للأكاديمية، ويسعدني الإجابة عن استفساراتكم باللغة **العربية**:
- 📝 **إجراءات القبول والتسجيل**
- 🏫 **السكن الداخلي المنفصل للبنين والبنات**
- 💳 **الرسوم الدراسية المعتدلة**
- 📍 **موقع المدرسة في دوتسي، ولاية جيغاوة**
- 📞 **للتواصل الفوري عبر الواتساب:** **+234 803 838 2557**

كيف يمكنني مساعدتكم اليوم؟`,
  yo: `**Ẹ n lẹ o! Kaabọ si Al-Niima Academy AI Assistant.**
Mo wa nibi lati ran yin lọwọ ni **Èdè Yorùbá**:
- 📝 **Gbigba wọle (Admissions)**
- 🏫 **Ile gbigbe ọmọkunrin ati ọmọbinrin (Boarding)**
- 📍 **Ibi ti ile-iwe wa ni Dutse, Jigawa**
- 📞 **WhatsApp:** **+234 803 838 2557**

Kini ẹ fẹ lati beere loni?`,
  fr: `**Bonjour et bienvenue à l'Académie Al-Niima!**
Je suis votre assistant IA instantané. Je réponds à vos questions en **Français**:
- 📝 **Les admissions et inscriptions**
- 🏫 **L'internat séparé pour filles et garçons**
- 📍 **L'adresse à Dutse, Jigawa**
- 📞 **Ligne WhatsApp directe:** **+234 803 838 2557**

Comment puis-je vous aider aujourd'hui?`,
};

export const AiAssistantWidget: React.FC<AiAssistantWidgetProps> = ({
  schoolPhone = '08038382557',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('ha');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Initial welcome message in Hausa / selected language
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'model',
      content: WELCOME_MESSAGES.ha,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input and listen for Escape key to close
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const currentLangConfig =
    LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];

  // Handle language switch
  const handleSelectLanguage = (code: SupportedLanguage) => {
    setSelectedLang(code);
    // If only welcome message is present, swap it to the newly selected language greeting
    setMessages((prev) => {
      if (prev.length <= 1 && prev[0]?.id === 'welcome') {
        return [
          {
            id: 'welcome',
            role: 'model',
            content: WELCOME_MESSAGES[code],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      return prev;
    });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Pass selected language to ensure direct native answer
      const res = await api.askAiAssistant(text, history, selectedLang);

      const botMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        content:
          res.answer ||
          (selectedLang === 'ha'
            ? `Mun gode da sakonku. Don karin bayani, tuntubi ofishin makaranta ta WhatsApp a **+234 ${schoolPhone.replace(/^0/, '')}**.`
            : `Thank you. For direct assistance, please contact our admissions office on WhatsApp at **+234 ${schoolPhone.replace(/^0/, '')}**.`),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: res.source,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        content:
          selectedLang === 'ha'
            ? `Mun gode da tambayarku. Kuna iya samun amsa kai tsaye daga Ofishin Makaranta ta WhatsApp: **+234 ${schoolPhone.replace(/^0/, '')}** ko kiran **${schoolPhone}**.`
            : `Thank you for your question. You can reach our Admissions Office directly on WhatsApp at **+234 ${schoolPhone.replace(/^0/, '')}** or phone **${schoolPhone}**.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `reset_${Date.now()}`,
        role: 'model',
        content: WELCOME_MESSAGES[selectedLang],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Optional Voice Input
  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your question.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang =
        selectedLang === 'ar'
          ? 'ar-SA'
          : selectedLang === 'fr'
          ? 'fr-FR'
          : selectedLang === 'ha'
          ? 'ha-NG'
          : selectedLang === 'yo'
          ? 'yo-NG'
          : 'en-NG';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Check if string contains Arabic characters
  const isArabicContent = (text: string) => /[\u0600-\u06FF]/.test(text);

  // Clean inline markdown formatter
  const formatInlineMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-950">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">$1</code>');
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    const isArabic = isArabicContent(content);

    return (
      <div
        className={`space-y-1.5 text-xs sm:text-sm leading-relaxed text-gray-800 ${
          isArabic ? 'text-right font-arabic' : 'text-left'
        }`}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
            return (
              <h4 key={idx} className="font-bold text-[#093c20] text-xs sm:text-sm mt-1 mb-0.5">
                {trimmed.replace(/^#+\s+/, '')}
              </h4>
            );
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletText = trimmed.replace(/^[-*]\s+/, '');
            return (
              <div key={idx} className="flex items-start space-x-2 rtl:space-x-reverse pl-1">
                <span className="text-emerald-600 font-bold leading-5">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(bulletText) }} />
              </div>
            );
          }

          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start space-x-2 rtl:space-x-reverse pl-1">
                <span className="font-bold text-emerald-700 min-w-[16px] text-xs leading-5">
                  {numMatch[1]}.
                </span>
                <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(numMatch[2]) }} />
              </div>
            );
          }

          return (
            <p
              key={idx}
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }}
            />
          );
        })}
      </div>
    );
  };

  const getWhatsAppUrl = () => {
    const cleanNum = schoolPhone.replace(/[^0-9]/g, '');
    const intlNum = cleanNum.startsWith('0') ? `234${cleanNum.slice(1)}` : cleanNum;
    return `https://wa.me/${intlNum}?text=${encodeURIComponent('Hello Al-Niima Academy, I would like to inquire about admissions.')}`;
  };

  return (
    <>
      {/* 
        1. RECOGNIZABLE ROUND AI ICON BUTTON
        - EXACT SAME SIZE as the WhatsApp button (w-12 h-12 = 48px)
        - Perfectly aligned on the exact same vertical center axis
        - Uses the universal AI intelligence symbol (antenna, cyber head, ocular sensors)
      */}
      <div className="relative inline-flex items-center justify-center w-12 h-12">
        {/* Hover Tooltip (matching WhatsApp style) */}
        {!isOpen && isHovered && (
          <div className="absolute right-full bottom-1/2 translate-y-1/2 mr-3 pointer-events-none hidden md:flex items-center z-50">
            <div className="bg-gray-900 text-amber-300 text-xs font-medium py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap flex items-center space-x-2 animate-in fade-in slide-in-from-right-2 duration-150 border border-amber-400/30">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Al-Niima AI (Hausa, English, Arabic...)</span>
            </div>
            <div className="w-2 h-2 bg-gray-900 rotate-45 -ml-1 border-r border-b border-amber-400/30" />
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#093c20] via-[#0b4827] to-[#041a0d] hover:from-[#0d5930] hover:to-[#093c20] text-amber-400 shadow-lg hover:shadow-xl shadow-emerald-950/40 border-2 border-amber-400/80 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-amber-400/40 group"
          aria-label="Open Al-Niima AI Assistant"
          title="Al-Niima AI Assistant (Hausa, Arabic, English, Yoruba, French)"
        >
          {/* Subtle Outer Radar Wave Ring */}
          <span className="absolute -inset-1 rounded-full bg-amber-400 opacity-25 animate-ping pointer-events-none" />

          {/* Universal AI Vector Icon (matching WhatsApp proportion) */}
          <div className="relative z-10 flex items-center justify-center">
            <AiSymbolIcon className="w-6 h-6 text-amber-400 transition-transform duration-200 group-hover:scale-110 drop-shadow-sm" />
          </div>

          {/* Quick status badge */}
          <span className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full p-0.5 shadow-xs border border-emerald-500 z-20">
            <span className="block w-full h-full rounded-full bg-emerald-500 animate-pulse" />
          </span>
        </button>
      </div>

      {/* 
        2. POP-UP PAGE APPEARS COMPLETELY ON SCREEN (PORTALED TO DOCUMENT.BODY)
        - Rendered via createPortal to body with z-[9999]: NEVER hidden behind website header!
        - Clamped height: max-h-[calc(100dvh-5.5rem)] guarantees 5.5rem clearance at top!
        - Everything at the top (title, language pills, close button) is 100% visible and accessible.
        - Direct Hausa, Arabic, Yoruba, French, and English responses.
      */}
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-label="Al-Niima Academy AI Assistant"
            className="fixed z-[9999] bottom-3 right-3 sm:bottom-6 sm:right-6 md:right-8 w-[calc(100vw-1.5rem)] sm:w-[410px] max-w-[420px] h-[min(560px,calc(100dvh-5.5rem))] max-h-[calc(100dvh-5.5rem)] bg-white rounded-2xl shadow-2xl border border-emerald-900/25 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/15"
          >
            {/* Streamlined Header */}
            <div className="bg-gradient-to-r from-[#093c20] via-[#0b4827] to-[#041d0f] text-white px-3.5 py-2.5 border-b border-amber-400/30 shrink-0 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
                  <AiSymbolIcon className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-bold text-xs sm:text-sm text-amber-400">Al-Niima AI</h3>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-emerald-100/80 leading-tight">
                    Hausa • English • العربية • Yorùbá • Français
                  </p>
                </div>
              </div>

              {/* Quick Actions (Reset & Close) */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={clearChat}
                  className="p-1.5 text-gray-300 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
                  title="Fara sabon hira / Clear chat"
                  aria-label="Clear chat"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-300 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
                  title="Rufe / Close Assistant"
                  aria-label="Close Assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Multilingual Selector Strip (Hausa, English, Arabic, Yoruba, French) */}
            <div className="bg-gray-50 px-2.5 py-1.5 border-b border-gray-200 shrink-0 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1 text-[11px] font-medium text-gray-600 shrink-0">
                <Globe className="w-3 h-3 text-[#093c20] shrink-0" />
                <span className="hidden xs:inline">Harshe / Lang:</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                      selectedLang === lang.code
                        ? 'bg-[#093c20] text-amber-300 shadow-xs border border-amber-400/40'
                        : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                    title={`Zaɓi ${lang.label}`}
                  >
                    <span className="mr-0.5">{lang.flag}</span> {lang.nativeLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50 min-h-0">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`flex items-start space-x-1.5 max-w-[92%] sm:max-w-[88%] ${
                        isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                          isUser
                            ? 'bg-slate-900 text-amber-400'
                            : 'bg-[#093c20] text-amber-400 border border-amber-400/30'
                        }`}
                      >
                        {isUser ? (
                          <User className="w-3 h-3" />
                        ) : (
                          <AiSymbolIcon className="w-3.5 h-3.5" />
                        )}
                      </div>

                      {/* Chat Bubble */}
                      <div
                        className={`rounded-2xl px-3 py-2.5 text-xs sm:text-sm shadow-xs ${
                          isUser
                            ? 'bg-[#093c20] text-white rounded-tr-none'
                            : 'bg-white text-gray-800 border border-gray-200/90 rounded-tl-none'
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          renderContent(msg.content)
                        )}

                        {/* Footer actions for AI response */}
                        {!isUser && (
                          <div className="mt-2 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                            <span>{msg.timestamp}</span>
                            <button
                              onClick={() => copyToClipboard(msg.content, msg.id)}
                              className="hover:text-emerald-700 flex items-center space-x-1 text-[10px] transition-colors cursor-pointer"
                              title="Kwafi / Copy"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-600">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-start space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#093c20] text-amber-400 flex items-center justify-center shrink-0">
                    <AiSymbolIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-3 py-2 text-xs text-gray-500 flex items-center space-x-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                    <span>
                      {selectedLang === 'ha'
                        ? 'Ana binciken amsa...'
                        : selectedLang === 'ar'
                        ? 'جاري التفكير...'
                        : 'Thinking...'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions for selected language */}
            {messages.length <= 4 && !isLoading && (
              <div className="px-2.5 py-1.5 bg-white border-t border-gray-100 shrink-0">
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
                  {currentLangConfig.sampleQuestions.map((question, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(question)}
                      className="whitespace-nowrap px-2.5 py-1 bg-emerald-50/70 hover:bg-emerald-100/70 text-[#093c20] font-medium rounded-full border border-emerald-200 transition-colors cursor-pointer shrink-0"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Streamlined Input Bar */}
            <div className="p-2.5 bg-white border-t border-gray-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-1.5"
              >
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={currentLangConfig.placeholder}
                    dir={selectedLang === 'ar' ? 'rtl' : 'ltr'}
                    className="w-full pl-3 pr-8 py-2 text-xs sm:text-sm bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all placeholder:text-gray-400"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-emerald-700 transition-colors ${
                      isListening ? 'text-red-500 animate-pulse' : ''
                    }`}
                    title={isListening ? 'Listening...' : 'Voice input'}
                    aria-label="Voice input"
                  >
                    {isListening ? (
                      <MicOff className="w-3.5 h-3.5" />
                    ) : (
                      <Mic className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#093c20] hover:bg-[#062916] text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95 shrink-0 cursor-pointer"
                  title="Aika / Send"
                  aria-label="Send"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </form>

              {/* Direct WhatsApp link */}
              <div className="flex items-center justify-between mt-1.5 px-0.5 text-[10px] text-gray-400">
                <span>5 Languages Supported</span>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#128C7E] font-medium hover:underline flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3 text-[#25D366]" />
                  WhatsApp Help Desk
                </a>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
