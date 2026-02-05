"use client";

/**
 * AgriVoxInterface - Smart Agriculture Voice Platform
 * 
 * A modern, dark-themed voice-first interface:
 * - Emerald green & blue color scheme
 * - Glassmorphism design elements
 * - Multi-language support (12+ Indian languages)
 * - IoT-ready smart agriculture focus
 * 
 * @module AgriVoxInterface
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    startConversationAction,
    processVoiceAction,
    broadcastFromVoiceAction,
} from "@/app/voice-actions";
import {
    type ConversationState,
    type LanguageConfig,
    type VoiceResponse,
    SUPPORTED_LANGUAGES
} from "@/lib/voice-conversation-agent";

// ============================================================================
// Web Speech API Type Declarations
// ============================================================================

interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}

interface ISpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
    onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
    onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

interface ISpeechRecognitionConstructor {
    new(): ISpeechRecognition;
}

// ============================================================================
// Types
// ============================================================================

type AppStage =
    | "idle"
    | "language_select"
    | "listening"
    | "processing"
    | "speaking"
    | "broadcasting"
    | "success"
    | "error";

// ============================================================================
// Component
// ============================================================================

export function AgriVoxInterface() {
    // App state
    const [stage, setStage] = useState<AppStage>("idle");
    const [selectedLanguage, setSelectedLanguage] = useState<LanguageConfig | null>(null);
    const [conversationState, setConversationState] = useState<ConversationState | null>(null);
    const [currentMessage, setCurrentMessage] = useState<string>("");
    const [lastResponse, setLastResponse] = useState<VoiceResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showDebug, setShowDebug] = useState(false);

    // Broadcast result for summary screen
    const [broadcastResult, setBroadcastResult] = useState<{
        catalogId: string;
        catalogItem: any;
        buyerName: string;
        bidAmount: number;
        timestamp: string;
    } | null>(null);

    // Demo scenarios
    const demoScenarios = [
        {
            name: "Rice Demo",
            catalogItem: {
                id: `demo_rice_${Date.now()}`,
                descriptor: { name: "चावल (Rice)", code: "rice" },
                quantity: { available: { count: 200 }, unit: "kg" },
                price: { value: 42, currency: "INR" },
                tags: { grade: "Premium", freshness: "Fresh", organic: true }
            },
            buyerName: "AgriCorp India",
            bidAmount: 40.50
        },
        {
            name: "Cotton Demo",
            catalogItem: {
                id: `demo_cotton_${Date.now()}`,
                descriptor: { name: "कपास (Cotton)", code: "cotton" },
                quantity: { available: { count: 300 }, unit: "kg" },
                price: { value: 65, currency: "INR" },
                tags: { grade: "A", freshness: "Dried", organic: false }
            },
            buyerName: "TextileMart",
            bidAmount: 63.00
        }
    ];

    const runDemoScenario = (index: number) => {
        const scenario = demoScenarios[index];
        if (!scenario) return;

        setSelectedLanguage(SUPPORTED_LANGUAGES[0]);
        setBroadcastResult({
            catalogId: scenario.catalogItem.id,
            catalogItem: scenario.catalogItem,
            buyerName: scenario.buyerName,
            bidAmount: scenario.bidAmount,
            timestamp: new Date().toISOString()
        });
        setStage("success");
    };

    // Refs for real-time access
    const recognitionRef = useRef<ISpeechRecognition | null>(null);
    const autoListenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const conversationStateRef = useRef<ConversationState | null>(null);
    const selectedLanguageRef = useRef<LanguageConfig | null>(null);
    const retryCountRef = useRef(0);

    useEffect(() => {
        conversationStateRef.current = conversationState;
    }, [conversationState]);

    useEffect(() => {
        selectedLanguageRef.current = selectedLanguage;
    }, [selectedLanguage]);

    // UI Strings
    const ui = {
        broadcast_msg: {
            hi: "मार्केट नेटवर्क पर प्रसारित हो रहा है...",
            en: "Broadcasting to market network...",
            mr: "बाजारावर प्रसारित होत आहे...",
            ta: "சந்தை நெட்வொர்க்கில் ஒளிபரப்பு...",
            te: "మార్కెట్ నెట్‌వర్క్‌కు ప్రసారం చేస్తోంది...",
        },
        success_title: {
            hi: "सफलतापूर्वक प्रकाशित!",
            en: "Successfully Published!",
            mr: "यशस्वीरित्या प्रकाशित!",
            ta: "வெற்றிகரமாக வெளியிடப்பட்டது!",
            te: "విజయవంతంగా ప్రచురించబడింది!",
        },
        crop: { hi: "फसल", en: "Crop", mr: "पीक", ta: "பயிர்", te: "పంట" },
        quantity: { hi: "मात्रा", en: "Quantity", mr: "प्रमाण", ta: "அளவு", te: "పరిమాణం" },
        quality: { hi: "गुणवत्ता", en: "Quality", mr: "दर्जा", ta: "தரம்", te: "నాణ్యత" },
        your_price: { hi: "आपका मूल्य", en: "Your Price", mr: "तुमचा भाव", ta: "உங்கள் விலை", te: "మీ ధర" },
        buyer_offer: { hi: "खरीदार का प्रस्ताव", en: "Buyer's Offer", mr: "खरेदीदाराची ऑफर", ta: "வாங்குபவரின் சலுகை", te: "కొనుగోలుదారు ఆఫర్" },
        new_listing: { hi: "नई लिस्टिंग बनाएं", en: "Create New Listing", mr: "नवीन लिस्टिंग तयार करा", ta: "புதிய பட்டியலை உருவாக்கு", te: "కొత్త జాబితాను సృష్టించండి" },
    };

    const getText = (key: keyof typeof ui) => {
        const code = selectedLanguage?.code;
        return (code && (ui[key] as any)[code]) || (ui[key] as any)["en"];
    };

    // ============================================================================
    // Speech Synthesis
    // ============================================================================

    const speak = useCallback((text: string, lang: string = "hi-IN"): Promise<void> => {
        return new Promise((resolve) => {
            if (typeof window === "undefined" || !window.speechSynthesis) {
                resolve();
                return;
            }

            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();

            let selectedVoice = voices.find(v => v.lang === lang);
            if (!selectedVoice) {
                const langCode = lang.split('-')[0];
                selectedVoice = voices.find(v => v.lang.startsWith(langCode));
            }
            if (!selectedVoice) {
                selectedVoice = voices.find(v => v.lang.includes('IN'));
            }
            if (!selectedVoice) {
                selectedVoice = voices.find(v => v.lang.startsWith('en'));
            }
            if (!selectedVoice && voices.length > 0) {
                selectedVoice = voices[0];
            }

            if (selectedVoice) {
                utterance.voice = selectedVoice;
                utterance.lang = selectedVoice.lang;
            } else {
                utterance.lang = lang;
            }

            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();

            setStage("speaking");
            setCurrentMessage(text);

            if (voices.length === 0) {
                const handleVoicesChanged = () => {
                    window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
                    window.speechSynthesis.speak(utterance);
                };
                window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
                setTimeout(() => {
                    if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
                        window.speechSynthesis.speak(utterance);
                    }
                }, 100);
            } else {
                window.speechSynthesis.speak(utterance);
            }
        });
    }, []);

    // ============================================================================
    // Broadcast Handler
    // ============================================================================

    const handleBroadcast = useCallback(async (catalogItem: any) => {
        const currentLanguage = selectedLanguageRef.current;
        if (!currentLanguage) return;

        setStage("broadcasting");
        setCurrentMessage(getText("broadcast_msg"));

        try {
            const result = await broadcastFromVoiceAction(catalogItem, currentLanguage);

            if (!result.success) {
                throw new Error(result.error || "Broadcast failed");
            }

            setBroadcastResult({
                catalogId: result.catalogId || '',
                catalogItem: catalogItem,
                buyerName: result.bid?.buyerName || 'Buyer',
                bidAmount: result.bid?.bidAmount || 0,
                timestamp: new Date().toISOString()
            });

            if (result.successMessage) {
                await speak(result.successMessage, currentLanguage.speechCode);
            }

            setStage("success");

        } catch (err) {
            console.error("Broadcast error:", err);
            setError(err instanceof Error ? err.message : "Broadcast failed");
            setStage("error");
        }
    }, [speak]);

    // ============================================================================
    // Voice Input Handler
    // ============================================================================

    const processTranscript = useCallback(async (transcript: string) => {
        const currentState = conversationStateRef.current;
        const currentLanguage = selectedLanguageRef.current;

        if (!currentState || !currentLanguage) {
            return null;
        }

        setStage("processing");
        setCurrentMessage(transcript);

        try {
            const result = await processVoiceAction(currentState, transcript);

            if (!result.success || !result.response || !result.newState) {
                throw new Error(result.error || "Processing failed");
            }

            setLastResponse(result.response);
            setConversationState(result.newState);

            await speak(result.response.text, currentLanguage.speechCode);

            return result.response;

        } catch (err) {
            console.error("Voice processing error:", err);
            setError(err instanceof Error ? err.message : "Processing failed");
            setStage("error");
            return null;
        }
    }, [speak]);

    // ============================================================================
    // Speech Recognition
    // ============================================================================

    const startListening = useCallback(() => {
        if (typeof window === "undefined") return;

        const SpeechRecognitionAPI =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            setError("Speech recognition not supported. Please use Chrome or Edge.");
            setStage("error");
            return;
        }

        try {
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch (e) { }
            }

            const recognition: ISpeechRecognition = new SpeechRecognitionAPI();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;
            recognition.lang = selectedLanguage?.speechCode || "en-IN";

            recognition.onstart = () => {
                setStage("listening");
                setError(null);
                setCurrentMessage("Listening... Speak now");
            };

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const lastResultIndex = event.results.length - 1;
                const result = event.results[lastResultIndex];
                const transcript = result[0].transcript;
                const isFinal = result.isFinal;

                setCurrentMessage(transcript);

                if (isFinal && transcript.trim()) {
                    retryCountRef.current = 0;
                    try { recognition.stop(); } catch (e) { }

                    processTranscript(transcript).then((response) => {
                        if (response) {
                            if (response.stage === "broadcasting" && response.catalogItem) {
                                handleBroadcast(response.catalogItem);
                            } else if (response.expectsResponse) {
                                autoListenTimeoutRef.current = setTimeout(() => {
                                    startListening();
                                }, 800);
                            } else {
                                setStage("idle");
                            }
                        }
                    });
                }
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                switch (event.error) {
                    case "no-speech":
                        retryCountRef.current += 1;
                        if (retryCountRef.current >= 3) {
                            setError("No voice detected. Please check your microphone.");
                            setStage("error");
                            retryCountRef.current = 0;
                        } else {
                            setTimeout(() => startListening(), 1500);
                        }
                        break;
                    case "not-allowed":
                    case "service-not-allowed":
                        setError("Microphone permission denied. Please allow microphone access.");
                        setStage("error");
                        break;
                    case "network":
                        setError("Network error. Please check your internet connection.");
                        setStage("error");
                        break;
                    default:
                        setTimeout(() => startListening(), 2000);
                        break;
                }
            };

            recognition.onend = () => { };

            recognitionRef.current = recognition;
            recognition.start();

        } catch (err) {
            setError("Could not start voice recognition. Please try again.");
            setStage("error");
        }
    }, [selectedLanguage, processTranscript, handleBroadcast]);

    // ============================================================================
    // Language Selection Handler
    // ============================================================================

    const handleLanguageSelect = async (language: LanguageConfig) => {
        setSelectedLanguage(language);
        selectedLanguageRef.current = language;
        setStage("processing");

        try {
            const result = await startConversationAction(language.code);

            if (!result.success) {
                throw new Error(result.error || "Failed to start conversation");
            }

            const initialState: ConversationState = {
                stage: "asking_commodity",
                language,
                collectedData: {}
            };

            setConversationState(initialState);
            conversationStateRef.current = initialState;

            await speak(result.greeting, language.speechCode);

            const firstQuestion = language.code === "hi"
                ? "आप कौन सी फसल बेचना चाहते हैं?"
                : language.code === "mr"
                    ? "तुम्हाला कोणते पीक विकायचे आहे?"
                    : "What crop do you want to sell?";

            await speak(firstQuestion, language.speechCode);
            await new Promise(resolve => setTimeout(resolve, 100));
            startListening();

        } catch (err) {
            console.error("Start conversation error:", err);
            setError(err instanceof Error ? err.message : "Failed to start");
            setStage("error");
        }
    };

    // ============================================================================
    // Cleanup
    // ============================================================================

    useEffect(() => {
        return () => {
            if (recognitionRef.current) recognitionRef.current.abort();
            if (autoListenTimeoutRef.current) clearTimeout(autoListenTimeoutRef.current);
            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <div className="agrivox-container" role="application" aria-label="AgriVox Smart Agriculture Platform">
            <AnimatePresence mode="wait">

                {/* IDLE STATE - Modern Dark UI */}
                {stage === "idle" && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-lg mx-auto text-center px-4"
                    >
                        {/* Header */}
                        <header className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">🌱</span>
                                <span className="text-xl font-bold text-white">
                                    Agri<span className="text-emerald-400">Vox</span>
                                </span>
                            </div>
                            <div className="status-badge">
                                <span className="status-dot" />
                                <span>Market Live</span>
                            </div>
                        </header>

                        {/* Hero */}
                        <div className="hero-section mb-12">
                            <h1 className="hero-title">
                                <span className="gradient-text">Smart Agriculture</span>
                                <span className="block text-white mt-2">Voice Platform</span>
                            </h1>
                            <p className="hero-subtitle mt-4">
                                Access real-time market prices, list your produce, <br />
                                and connect with buyers — all through voice.
                            </p>
                        </div>

                        {/* Voice Button */}
                        <div className="flex flex-col items-center gap-6 mb-12">
                            <button
                                onClick={() => setStage("language_select")}
                                className="voice-button"
                                type="button"
                                aria-label="Start voice interaction"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="mic-icon">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                </svg>
                                <div className="pulse-rings" />
                            </button>
                            <p className="text-gray-400 text-lg font-medium">Tap to Speak</p>
                        </div>

                        {/* Feature Pills */}
                        <div className="feature-pills mb-8">
                            <div className="feature-pill">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                                <span>12+ Languages</span>
                            </div>
                            <div className="feature-pill">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                                <span>Real-time Prices</span>
                            </div>
                            <div className="feature-pill">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                </svg>
                                <span>Instant Connect</span>
                            </div>
                        </div>

                        {/* Demo Buttons */}
                        <div className="flex justify-center gap-4 pt-4 border-t border-gray-800">
                            <button
                                onClick={() => runDemoScenario(0)}
                                className="text-sm text-gray-500 hover:text-emerald-400 transition-colors"
                                type="button"
                            >
                                Demo: Rice
                            </button>
                            <button
                                onClick={() => runDemoScenario(1)}
                                className="text-sm text-gray-500 hover:text-emerald-400 transition-colors"
                                type="button"
                            >
                                Demo: Cotton
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* LANGUAGE SELECT */}
                {stage === "language_select" && (
                    <motion.div
                        key="language"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="w-full max-w-xl mx-auto px-4 py-8"
                    >
                        <h2 className="text-2xl font-bold text-white text-center mb-2">
                            Select Your Language
                        </h2>
                        <p className="text-gray-400 text-center mb-8">
                            अपनी भाषा चुनें
                        </p>

                        <div className="language-grid">
                            {SUPPORTED_LANGUAGES.map((lang) => (
                                <motion.button
                                    key={lang.code}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleLanguageSelect(lang)}
                                    className="language-btn"
                                    type="button"
                                >
                                    <span className="native-name">{lang.name}</span>
                                    <span className="english-name">{lang.region}</span>
                                </motion.button>
                            ))}
                        </div>

                        <button
                            onClick={() => setStage("idle")}
                            className="mt-8 px-6 py-3 w-full bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
                            type="button"
                        >
                            ← Back
                        </button>
                    </motion.div>
                )}

                {/* LISTENING STATE */}
                {stage === "listening" && (
                    <motion.div
                        key="listening"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center min-h-[60vh] px-4"
                    >
                        <div className="relative">
                            <div className="voice-button listening">
                                <div className="audio-visualizer">
                                    <div className="audio-bar" />
                                    <div className="audio-bar" />
                                    <div className="audio-bar" />
                                    <div className="audio-bar" />
                                    <div className="audio-bar" />
                                </div>
                                <div className="pulse-rings" />
                            </div>
                        </div>
                        <p className="text-xl text-white mt-8 text-center max-w-md">
                            {currentMessage}
                        </p>
                    </motion.div>
                )}

                {/* PROCESSING STATE */}
                {stage === "processing" && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center min-h-[60vh] px-4"
                    >
                        <div className="voice-button processing">
                            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-rotate" />
                        </div>
                        <p className="text-xl text-white mt-8 text-center max-w-md">
                            {currentMessage || "Processing..."}
                        </p>
                    </motion.div>
                )}

                {/* SPEAKING STATE */}
                {stage === "speaking" && (
                    <motion.div
                        key="speaking"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center min-h-[60vh] px-4"
                    >
                        <div className="voice-button" style={{ background: 'linear-gradient(145deg, #3B82F6, #2563EB)' }}>
                            <span className="text-4xl">🔊</span>
                            <div className="pulse-rings" style={{ borderColor: 'rgba(59, 130, 246, 0.5)' }} />
                        </div>
                        <p className="text-xl text-white mt-8 text-center max-w-md font-medium">
                            {currentMessage}
                        </p>
                    </motion.div>
                )}

                {/* BROADCASTING STATE */}
                {stage === "broadcasting" && (
                    <motion.div
                        key="broadcasting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center min-h-[60vh] px-4"
                    >
                        <div className="relative">
                            <div className="voice-button" style={{ background: 'linear-gradient(145deg, #8B5CF6, #7C3AED)' }}>
                                <span className="text-4xl">📡</span>
                            </div>
                            <div className="absolute inset-0 -m-4">
                                <div className="absolute inset-0 border-2 border-purple-500/50 rounded-full animate-pulse-ring" />
                                <div className="absolute inset-0 border-2 border-purple-500/30 rounded-full animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
                            </div>
                        </div>
                        <p className="text-xl text-white mt-8 text-center max-w-md">
                            {currentMessage}
                        </p>
                    </motion.div>
                )}

                {/* SUCCESS STATE */}
                {stage === "success" && broadcastResult && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="w-full max-w-md mx-auto px-4 py-8"
                    >
                        <div className="success-card">
                            <div className="success-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold text-white text-center mb-6">
                                {getText("success_title")}
                            </h2>

                            <div className="info-grid">
                                <div className="info-card">
                                    <span className="label">{getText("crop")}</span>
                                    <span className="value">{broadcastResult.catalogItem?.descriptor?.name || 'N/A'}</span>
                                </div>
                                <div className="info-card">
                                    <span className="label">{getText("quantity")}</span>
                                    <span className="value">
                                        {broadcastResult.catalogItem?.quantity?.available?.count || 0} {broadcastResult.catalogItem?.quantity?.unit || 'kg'}
                                    </span>
                                </div>
                                <div className="info-card">
                                    <span className="label">{getText("your_price")}</span>
                                    <span className="value text-emerald-400">
                                        ₹{broadcastResult.catalogItem?.price?.value || 0}/kg
                                    </span>
                                </div>
                                <div className="info-card">
                                    <span className="label">{getText("quality")}</span>
                                    <span className="value">{broadcastResult.catalogItem?.tags?.grade || 'Standard'}</span>
                                </div>
                            </div>

                            {/* Buyer Offer */}
                            <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                <p className="text-sm text-emerald-400 mb-2">{getText("buyer_offer")}</p>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-white font-semibold">{broadcastResult.buyerName}</p>
                                        <p className="text-xs text-gray-400">Verified Buyer</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-emerald-400">
                                            ₹{broadcastResult.bidAmount}
                                        </p>
                                        <p className="text-xs text-gray-400">per kg</p>
                                    </div>
                                </div>
                            </div>

                            {/* Protocol Section */}
                            <button
                                onClick={() => setShowDebug(!showDebug)}
                                className="mt-4 w-full text-sm text-gray-500 hover:text-gray-400 py-2"
                            >
                                {showDebug ? "▼ Hide Protocol Details" : "▶ Show Protocol Details"}
                            </button>

                            {showDebug && (
                                <div className="mt-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800 text-xs font-mono text-gray-400 overflow-x-auto">
                                    <pre className="whitespace-pre-wrap">
                                        {JSON.stringify({
                                            protocol: "ONDC Beckn v1.2.0",
                                            transaction_id: broadcastResult.catalogId,
                                            timestamp: broadcastResult.timestamp,
                                            status: "ACK",
                                            network: "AgriVox-Gateway"
                                        }, null, 2)}
                                    </pre>
                                </div>
                            )}

                            <p className="text-xs text-gray-500 text-center mt-4">
                                {new Date(broadcastResult.timestamp).toLocaleString()}
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                setStage("idle");
                                setConversationState(null);
                                setLastResponse(null);
                                setBroadcastResult(null);
                            }}
                            className="mt-6 w-full btn-primary-gradient py-4 rounded-xl text-white font-semibold text-lg"
                            type="button"
                        >
                            {getText("new_listing")}
                        </button>
                    </motion.div>
                )}

                {/* ERROR STATE */}
                {stage === "error" && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                            <svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" className="w-10 h-10">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M15 9l-6 6M9 9l6 6" strokeLinecap="round" />
                            </svg>
                        </div>
                        <p className="text-xl text-red-400 max-w-md mb-8">
                            {error || "Something went wrong"}
                        </p>
                        <button
                            onClick={() => setStage("idle")}
                            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
                            type="button"
                        >
                            Try Again
                        </button>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
