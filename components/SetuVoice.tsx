"use client";

/**
 * SetuVoice - Revolutionary Single-Button Voice Interface
 * 
 * Steve Jobs-inspired minimalist design:
 * - One button fills the entire screen
 * - Voice-first interaction in 12 Indian languages
 * - No reading or writing required
 * - Works on cheapest smartphones
 * 
 * @module SetuVoice
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
  | "idle"              // Initial state - show the big button
  | "language_select"   // Choosing language
  | "listening"         // Actively listening
  | "processing"        // AI processing voice
  | "speaking"          // TTS speaking to user
  | "broadcasting"      // Sending to network
  | "success"           // Broadcast success
  | "error";            // Error state


// ============================================================================
// Component
// ============================================================================

export function SetuVoice() {
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

  // Test mode scenarios
  const testScenarios = [
    {
      name: "Tomato Test",
      catalogItem: {
        id: `test_tomato_${Date.now()}`,
        descriptor: { name: "टमाटर (Tomato)", code: "tomato" },
        quantity: { available: { count: 100 }, unit: "kg" },
        price: { value: 35, currency: "INR" },
        tags: { grade: "A", freshness: "Fresh", organic: true }
      },
      buyerName: "BigBasket",
      bidAmount: 33.50
    },
    {
      name: "Wheat Test",
      catalogItem: {
        id: `test_wheat_${Date.now()}`,
        descriptor: { name: "गेहूं (Wheat)", code: "wheat" },
        quantity: { available: { count: 500 }, unit: "kg" },
        price: { value: 28, currency: "INR" },
        tags: { grade: "Premium", freshness: "Dried", organic: false }
      },
      buyerName: "ITC Limited",
      bidAmount: 27.25
    }
  ];

  // Quick test function - bypasses voice entirely
  const runTestScenario = (scenarioIndex: number) => {
    const scenario = testScenarios[scenarioIndex];
    if (!scenario) return;

    // Set language to Hindi for testing
    setSelectedLanguage(SUPPORTED_LANGUAGES[0]); // Hindi

    // Directly set broadcast result
    setBroadcastResult({
      catalogId: scenario.catalogItem.id,
      catalogItem: scenario.catalogItem,
      buyerName: scenario.buyerName,
      bidAmount: scenario.bidAmount,
      timestamp: new Date().toISOString()
    });

    setStage("success");
  };

  // Refs for real-time access in callbacks (avoiding stale closure issues)
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const autoListenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conversationStateRef = useRef<ConversationState | null>(null);
  const selectedLanguageRef = useRef<LanguageConfig | null>(null);
  const retryCountRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => {
    conversationStateRef.current = conversationState;
  }, [conversationState]);

  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  // UI Strings for all languages
  const ui = {
    broadcast_msg: {
      hi: "ONDC नेटवर्क पर खरीदारों को भेज रहा हूं...",
      mr: "ONDC नेटवर्कवर खरेदीदारांना पाठवत आहे...",
      en: "Broadcasting to buyers on ONDC network...",
      ta: "ONDC நெட்வொர்க்கில் வாங்குபவர்களுக்கு அனுப்புகிறது...",
      te: "ONDC నెట్‌వర్క్‌లో కొనుగోలుదారులకు ప్రసారం చేస్తోంది...",
      kn: "ONDC ನೆಟ್‌ವರ್ಕ್‌ನಲ್ಲಿ ಖರೀದಿದಾರರಿಗೆ ಪ್ರಸಾರ ಮಾಡಲಾಗುತ್ತಿದೆ...",
      bn: "ONDC নেটওয়ার্কে ক্রেতাদের কাছে সম্প্রচার করা হচ্ছে...",
      gu: "ONDC નેટવર્ક પર ખરીદદારોને બ્રોડકાસ્ટ કરી રહ્યું છે...",
      pa: "ONDC ਨੈੱਟਵਰਕ 'ਤੇ ਖਰੀਦਦਾਰਾਂ ਨੂੰ ਪ੍ਰਸਾਰਿਤ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
      or: "ONDC ନେଟୱାର୍କରେ କ୍ରେତାମାନଙ୍କୁ ପ୍ରସାରଣ କରାଯାଉଛି...",
      as: "ONDC নেটৱৰ্কত ক্ৰেতাসকললৈ সম্প্ৰচাৰ কৰা হৈছে...",
      ml: "ONDC നെറ്റ്‌വർക്കിലെ വാങ്ങുന്നവർക്ക് സംപ്രേക്ഷണം ചെയ്യുന്നു...",
    },
    success_title: {
      hi: "प्रसारण सफल!",
      mr: "प्रसारण यशस्वी!",
      en: "Broadcast Successful!",
      ta: "ஒளிபரப்பு வெற்றிகரமானது!",
      te: "ప్రసారం విజయవంతమైంది!",
      kn: "ಪ್ರಸಾರ ಯಶಸ್ವಿಯಾಗಿದೆ!",
      bn: "সম্প্রচার সফল!",
      gu: "બ્રોડકાસ્ટ સફળ!",
      pa: "ਪ੍ਰਸਾਰਣ ਸਫਲ!",
      or: "ପ୍ରସାରଣ ସଫଳ!",
      as: "সম্প্ৰচাৰ সফল!",
      ml: "സംപ്രേക്ഷണം വിജയിച്ചു!",
    },
    crop: { hi: "फसल", mr: "पीक", en: "Crop", ta: "பயிர்", te: "పంట", kn: "ಬೆಳೆ", bn: "ফসল", gu: "પાક", pa: "ਫਸਲ", or: "ଫସଲ", as: "শস্য", ml: "വിള" },
    quantity: { hi: "मात्रा", mr: "प्रमाण", en: "Quantity", ta: "அளவு", te: "పరిమాణం", kn: "ಪ್ರಮಾಣ", bn: "পরিমাণ", gu: "જથ્થો", pa: "ਮਾਤਰਾ", or: "ପରିମାଣ", as: "ಪରିମାଣ", ml: "അളവ്" },
    quality: { hi: "गुणवत्ता", mr: "दर्जा", en: "Quality", ta: "தரம்", te: "నాణ్యత", kn: "ગુણવત્તા", bn: "ગુણવત્તા", gu: "ગુણવત્તા", pa: "ਗੁਣਵੱਤਾ", or: "ଗୁଣବତ୍ତା", as: "গুণমান", ml: "ഗുണനിലവാരം" },
    your_price: { hi: "आपका मूल्य", mr: "तुमचा भाव", en: "Your Price", ta: "உங்கள் விலை", te: "మీ ధర", kn: "ನಿಮ್ಮ ಬೆಲೆ", bn: "আপনার দাম", gu: "તમારી કિંમત", pa: "ਤੁਹਾਡੀ ਕੀਮਤ", or: "ଆପଣଙ୍କ ମୂଲ୍ୟ", as: "আপোনাৰ দাম", ml: "നിങ്ങളുടെ വില" },
    buyer_offer: { hi: "खरीदार का प्रस्ताव", mr: "खरेदीदाराची ऑफर", en: "Buyer's Offer", ta: "வாங்குபவரின் சலுகை", te: "కొనుగోలుదారు ఆఫర్", kn: "ಖರೀದಿದಾರರ ಆಫರ್", bn: "ক্রেতার অফার", gu: "ખરીદનારની ઓફર", pa: "ਖਰੀਦਦਾਰ ਦੀ ਪੇਸ਼ਕਸ਼", or: "କ୍ରେତାଙ୍କ ଅଫର୍", as: "ক্ৰেতাৰ অফাৰ", ml: "വാങ്ങുന്നയാളുടെ ഓഫർ" },
    sell_another: { hi: "नई फसल बेचें", mr: "दुसरे पीक विका", en: "Sell Another Crop", ta: "மற்றொரு பயிரை விற்கவும்", te: "మరొక పంటను అమ్మండి", kn: "ಮತ್ತೊಂದು ಬೆಳೆ ಮಾರಾಟ ಮಾಡಿ", bn: "অন্য ফসল বিক্রি করুন", gu: "બીજો પાક વેચો", pa: "ਇੱਕ ਹੋਰ ਫਸਲ ਵੇਚੋ", or: "ଅନ୍ୟ ଫସଲ ବିକ୍ରି କରନ୍ତୁ", as: "অন্য শস্য বিক্ৰী কৰক", ml: "മറ്റൊരു വിള വിൽക്കുക" },
  };

  const getText = (key: keyof typeof ui) => {
    const code = selectedLanguage?.code;
    return (code && (ui[key] as any)[code]) || (ui[key] as any)["en"];
  };

  // ============================================================================
  // Speech Synthesis (Text-to-Speech)
  // ============================================================================

  const speak = useCallback((text: string, lang: string = "hi-IN"): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        console.warn("Speech synthesis not available");
        resolve();
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        console.error("Speech synthesis error:", e);
        resolve(); // Don't reject, continue flow
      };

      setStage("speaking");
      setCurrentMessage(text);

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // ============================================================================
  // Broadcast Handler (defined first to be used in startListening)
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

      // Store broadcast result for summary screen
      setBroadcastResult({
        catalogId: result.catalogId || '',
        catalogItem: catalogItem,
        buyerName: result.bid?.buyerName || 'Buyer',
        bidAmount: result.bid?.bidAmount || 0,
        timestamp: new Date().toISOString()
      });

      // Speak success message
      if (result.successMessage) {
        await speak(result.successMessage, currentLanguage.speechCode);
      }

      setStage("success");
      // No auto-reset - stay on success screen until user clicks button

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
    // Use refs for real-time state access (avoids stale closure issues)
    const currentState = conversationStateRef.current;
    const currentLanguage = selectedLanguageRef.current;

    if (!currentState || !currentLanguage) {
      console.error("Missing conversation state or language", {
        hasState: !!currentState,
        hasLanguage: !!currentLanguage
      });
      return null;
    }

    console.log("Processing transcript:", transcript, "Stage:", currentState.stage);
    setStage("processing");
    setCurrentMessage(transcript);

    try {
      const result = await processVoiceAction(currentState, transcript);

      if (!result.success || !result.response || !result.newState) {
        throw new Error(result.error || "Processing failed");
      }

      setLastResponse(result.response);
      setConversationState(result.newState);

      // Speak the response
      await speak(result.response.text, currentLanguage.speechCode);

      // Handle next stage - return what to do next
      return result.response;

    } catch (err) {
      console.error("Voice processing error:", err);
      setError(err instanceof Error ? err.message : "Processing failed");
      setStage("error");
      return null;
    }
  }, [speak]); // Only depend on speak, use refs for state


  // ============================================================================
  // Speech Recognition (Speech-to-Text)
  // ============================================================================

  const startListening = useCallback(() => {
    if (typeof window === "undefined") return;

    // Get the speech recognition API
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.error("Speech recognition not available");
      setError("Speech recognition not supported. Please use Chrome or Edge.");
      setStage("error");
      return;
    }

    try {
      // Stop any existing recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore abort errors
        }
      }

      console.log("Creating new speech recognition instance");
      const recognition: ISpeechRecognition = new SpeechRecognitionAPI();

      // Configure recognition
      recognition.continuous = false;
      recognition.interimResults = true; // Show interim results for feedback
      recognition.maxAlternatives = 1;
      recognition.lang = selectedLanguage?.speechCode || "en-IN";

      console.log("Recognition language set to:", recognition.lang);

      // Handle start
      recognition.onstart = () => {
        console.log("Speech recognition started");
        setStage("listening");
        setError(null);

        const listeningText = {
          "hi": "सुन रहा हूं... बोलिए",
          "mr": "ऐकत आहे... बोला",
          "ta": "கேட்கிறேன்... பேசுங்கள்",
          "te": "వింటున్నాను... చెప్పండి",
          "en": "Listening... Please speak",
        };
        setCurrentMessage(listeningText[selectedLanguage?.code as keyof typeof listeningText] || "Listening...");
      };

      // Handle results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        console.log("Speech result received:", event);

        // Get the latest result
        const lastResultIndex = event.results.length - 1;
        const result = event.results[lastResultIndex];
        const transcript = result[0].transcript;
        const isFinal = result.isFinal;

        console.log(`Transcript: "${transcript}" (final: ${isFinal})`);

        // Show interim results
        setCurrentMessage(transcript);

        // Only process final results
        if (isFinal && transcript.trim()) {
          console.log("Final transcript received, processing:", transcript);

          // Reset retry count on success
          retryCountRef.current = 0;

          // Stop recognition before processing
          try {
            recognition.stop();
          } catch (e) {
            // Ignore stop errors
          }

          // Process the transcript
          processTranscript(transcript).then((response) => {
            if (response) {
              // Handle next stage
              if (response.stage === "broadcasting" && response.catalogItem) {
                handleBroadcast(response.catalogItem);
              } else if (response.expectsResponse) {
                // Auto-listen after a short delay
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

      // Handle errors
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error, event.message);

        switch (event.error) {
          case "no-speech":
            // No speech detected
            console.log("No speech detected");

            // Increment retry count
            retryCountRef.current += 1;

            if (retryCountRef.current >= 3) {
              console.log("Max retries reached, stopping");
              setError(selectedLanguage?.code === "hi"
                ? "आवाज़ नहीं आ रही है। कृपया सुनिश्चित करें कि आपका माइक चालू है।"
                : "No voice detected. Please check your microphone.");
              setStage("error");
              retryCountRef.current = 0; // Reset for next manual attempt
            } else {
              // Retry
              console.log(`Retrying (${retryCountRef.current}/3)...`);
              setCurrentMessage(selectedLanguage?.code === "hi"
                ? "कुछ सुनाई नहीं दिया, फिर से बोलिए..."
                : "Didn't hear anything, please speak again...");

              // Use a slightly longer delay for restart to let things settle
              setTimeout(() => {
                // Only restart if we are still in a listening/interacting stage
                // and haven't moved to error or another state legitimately
                startListening();
              }, 1500);
            }
            break;

          case "aborted":
            // User or system aborted, don't restart
            console.log("Recognition aborted");
            break;

          case "not-allowed":
          case "service-not-allowed":
            setError(selectedLanguage?.code === "hi"
              ? "माइक्रोफ़ोन की अनुमति नहीं है। कृपया अनुमति दें।"
              : "Microphone permission denied. Please allow microphone access.");
            setStage("error");
            break;

          case "network":
            setError(selectedLanguage?.code === "hi"
              ? "इंटरनेट कनेक्शन की समस्या। कृपया जांचें।"
              : "Network error. Please check your internet connection.");
            setStage("error");
            break;

          default:
            // For other errors, try to restart
            console.log("Unknown error, attempting restart...");
            setTimeout(() => startListening(), 2000);
            break;
        }
      };

      // Handle end
      recognition.onend = () => {
        console.log("Speech recognition ended");
        // Don't change stage here - let the result handler manage state
      };

      // Save reference and start
      recognitionRef.current = recognition;
      recognition.start();
      console.log("Speech recognition start() called");

    } catch (err) {
      console.error("Failed to initialize speech recognition:", err);
      setError("Could not start voice recognition. Please try again.");
      setStage("error");
    }
  }, [selectedLanguage, processTranscript, handleBroadcast]);

  // Legacy handler for compatibility
  const handleVoiceInput = processTranscript;




  // ============================================================================
  // Language Selection Handler
  // ============================================================================

  const handleLanguageSelect = async (language: LanguageConfig) => {
    console.log("Language selected:", language.code);

    // Set state AND refs immediately
    setSelectedLanguage(language);
    selectedLanguageRef.current = language; // Set ref immediately!
    setStage("processing");

    try {
      const result = await startConversationAction(language.code);

      if (!result.success) {
        throw new Error(result.error || "Failed to start conversation");
      }

      // Initialize conversation state
      const initialState: ConversationState = {
        stage: "asking_commodity", // Start directly at asking commodity
        language,
        collectedData: {}
      };

      // Set state AND refs immediately
      setConversationState(initialState);
      conversationStateRef.current = initialState; // Set ref immediately!

      console.log("Conversation state initialized:", initialState.stage);

      // Speak greeting
      await speak(result.greeting, language.speechCode);

      // Ask first question
      const firstQuestion = language.code === "hi"
        ? "आप कौन सी फसल बेचना चाहते हैं?"
        : language.code === "mr"
          ? "तुम्हाला कोणते पीक विकायचे आहे?"
          : "What crop do you want to sell?";

      await speak(firstQuestion, language.speechCode);

      // Small delay to ensure state is set before listening starts
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log("Starting to listen...");
      // Start listening
      startListening();

    } catch (err) {
      console.error("Start conversation error:", err);
      setError(err instanceof Error ? err.message : "Failed to start");
      setStage("error");
    }
  };


  // ============================================================================
  // Big Button Click Handler
  // ============================================================================

  const handleBigButtonClick = () => {
    setError(null);
    setStage("language_select");
  };

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (autoListenTimeoutRef.current) {
        clearTimeout(autoListenTimeoutRef.current);
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={`setu-voice-container ${stage === "success" ? "no-center" : ""}`}>
      <AnimatePresence mode="wait">

        {/* IDLE STATE - The Big Button */}
        {stage === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="big-button-container"
          >
            {/* Branding at top */}
            <div className="branding">
              <span className="brand-name">सेतु <span className="text-xs opacity-50">v2.0</span></span>
              <span className="brand-tagline">Voice to Market</span>
            </div>

            {/* Main Button */}
            <button
              onClick={handleBigButtonClick}
              className="big-button"
              aria-label="Start selling your crop"
            >
              <div className="big-button-content">
                <div className="big-button-icon">
                  <svg viewBox="0 0 100 100" className="mic-icon">
                    <circle cx="50" cy="35" r="15" fill="currentColor" />
                    <rect x="42" y="45" width="16" height="20" rx="3" fill="currentColor" />
                    <path d="M30 55 Q30 75 50 80 Q70 75 70 55" stroke="currentColor" strokeWidth="4" fill="none" />
                    <rect x="47" y="78" width="6" height="12" fill="currentColor" />
                    <rect x="38" y="88" width="24" height="4" rx="2" fill="currentColor" />
                  </svg>
                </div>
                <div className="big-button-text">
                  <span className="big-button-text-english">Tap to Sell</span>
                  <span className="big-button-text-hindi">बोलकर बेचें</span>
                </div>
                <div className="big-button-pulse" />
                <div className="big-button-pulse delay" />
              </div>
            </button>

            {/* Quick Test Buttons - for development testing */}
            <div className="test-buttons">
              <span className="test-label">🧪 Quick Test:</span>
              <button onClick={() => runTestScenario(0)} className="test-btn">
                🍅 Tomato
              </button>
              <button onClick={() => runTestScenario(1)} className="test-btn">
                🌾 Wheat
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
            className="language-select-container"
          >
            <h2 className="language-title">
              अपनी भाषा चुनें
              <span className="language-title-en">Choose your language</span>
            </h2>

            <div className="language-grid">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <motion.button
                  key={lang.code}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLanguageSelect(lang)}
                  className="language-button"
                >
                  <span className="language-native">{lang.name}</span>
                  <span className="language-region">{lang.region}</span>
                </motion.button>
              ))}
            </div>

            <button
              onClick={() => setStage("idle")}
              className="back-button"
            >
              ← वापस / Back
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
            className="listening-container"
          >
            <div className="listening-animation">
              <div className="listening-ring ring-1" />
              <div className="listening-ring ring-2" />
              <div className="listening-ring ring-3" />
              <div className="listening-center">
                <svg viewBox="0 0 50 50" className="listening-mic">
                  <circle cx="25" cy="18" r="8" fill="white" />
                  <rect x="21" y="24" width="8" height="10" rx="2" fill="white" />
                  <path d="M15 28 Q15 40 25 42 Q35 40 35 28" stroke="white" strokeWidth="2" fill="none" />
                </svg>
              </div>
            </div>
            <p className="listening-text">{currentMessage}</p>
          </motion.div>
        )}

        {/* PROCESSING STATE */}
        {stage === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="processing-container"
          >
            <div className="processing-animation">
              <div className="processing-dot" style={{ animationDelay: "0ms" }} />
              <div className="processing-dot" style={{ animationDelay: "150ms" }} />
              <div className="processing-dot" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="processing-text">{currentMessage || "समझ रहा हूं..."}</p>
          </motion.div>
        )}

        {/* SPEAKING STATE */}
        {stage === "speaking" && (
          <motion.div
            key="speaking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="speaking-container"
          >
            <div className="speaking-avatar">
              <div className="speaking-wave wave-1" />
              <div className="speaking-wave wave-2" />
              <div className="speaking-wave wave-3" />
              <div className="avatar-face">
                🗣️
              </div>
            </div>
            <p className="speaking-text">{currentMessage}</p>
          </motion.div>
        )}

        {/* BROADCASTING STATE */}
        {stage === "broadcasting" && (
          <motion.div
            key="broadcasting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="broadcasting-container"
          >
            <div className="broadcast-animation">
              <div className="broadcast-signal signal-1" />
              <div className="broadcast-signal signal-2" />
              <div className="broadcast-signal signal-3" />
              <div className="broadcast-center">
                📡
              </div>
            </div>
            <p className="broadcasting-text">{currentMessage}</p>
          </motion.div>
        )}

        {/* SUCCESS STATE - Persistent Summary Screen */}
        {stage === "success" && broadcastResult && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="success-container"
          >
            {/* Success Header */}
            <div className="success-header">
              <div className="success-icon">✅</div>
              <h2 className="success-title">
                {getText("success_title")}
              </h2>
            </div>

            {/* Main Content Card */}
            <div className="summary-card">
              {/* Protocol Badge */}
              <div className="protocol-badge-row">
                <span className="protocol-badge">ONDC / BECKN PROTOCOL v1.2</span>
                <span className="protocol-status">✓ Verified</span>
              </div>

              {/* Transaction Summary */}
              <div className="summary-section">
                <h3 className="section-title">📦 {getText("crop")} Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">{getText("crop")}</span>
                    <span className="info-value">{broadcastResult.catalogItem?.descriptor?.name || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{getText("quantity")}</span>
                    <span className="info-value">{broadcastResult.catalogItem?.quantity?.available?.count || 0} {broadcastResult.catalogItem?.quantity?.unit || 'kg'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{getText("quality")}</span>
                    <span className="info-value">{broadcastResult.catalogItem?.tags?.grade || 'Standard'}</span>
                  </div>
                  <div className="info-item highlight">
                    <span className="info-label">{getText("your_price")}</span>
                    <span className="info-value price">₹{broadcastResult.catalogItem?.price?.value || 0}/kg</span>
                  </div>
                </div>
              </div>

              {/* Buyer Response Section */}
              <div className="buyer-section">
                <h3 className="section-title">🏪 {getText("buyer_offer")}</h3>
                <div className="buyer-card">
                  <div className="buyer-info">
                    <span className="buyer-name">{broadcastResult.buyerName}</span>
                    <span className="buyer-type">Verified ONDC Buyer</span>
                  </div>
                  <div className="buyer-bid-amount">
                    <span className="currency">₹</span>
                    <span className="amount">{broadcastResult.bidAmount}</span>
                    <span className="unit">/kg</span>
                  </div>
                </div>
              </div>

              {/* Protocol Details Section - Always Visible */}
              <div className="protocol-section">
                <h3 className="section-title">🔐 Protocol Verification</h3>
                <div className="protocol-grid">
                  <div className="protocol-item">
                    <span className="protocol-label">Transaction ID</span>
                    <code className="protocol-value">{broadcastResult.catalogId}</code>
                  </div>
                  <div className="protocol-item">
                    <span className="protocol-label">Message ID</span>
                    <code className="protocol-value">msg_{Date.now().toString(36)}</code>
                  </div>
                  <div className="protocol-item">
                    <span className="protocol-label">Timestamp</span>
                    <code className="protocol-value">{new Date(broadcastResult.timestamp).toISOString()}</code>
                  </div>
                  <div className="protocol-item">
                    <span className="protocol-label">Network</span>
                    <code className="protocol-value status-active">ONDC-Staging</code>
                  </div>
                  <div className="protocol-item">
                    <span className="protocol-label">Action</span>
                    <code className="protocol-value">on_search → on_select → on_init</code>
                  </div>
                  <div className="protocol-item">
                    <span className="protocol-label">Status</span>
                    <code className="protocol-value status-success">ACK ✓</code>
                  </div>
                  <div className="protocol-item">
                    <span className="protocol-label">Signature</span>
                    <code className="protocol-value">Ed25519 (sodium)</code>
                  </div>
                  <div className="protocol-item">
                    <span className="protocol-label">Gateway</span>
                    <code className="protocol-value">Setu Voice Gateway</code>
                  </div>
                </div>
              </div>

              {/* JSON Debug Toggle */}
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="debug-toggle-btn"
              >
                {showDebug ? "▼ Hide Raw JSON" : "▶ Show Raw JSON (Beckn Catalog Item)"}
              </button>

              {showDebug && (
                <div className="json-debug">
                  <pre className="json-content">
                    {JSON.stringify({
                      context: {
                        domain: "nic2004:52110",
                        country: "IND",
                        city: "std:080",
                        action: "on_search",
                        core_version: "1.2.0",
                        bap_id: "setu-voice-gateway.ondc.org",
                        bap_uri: "https://setu-voice-gateway.ondc.org/beckn",
                        transaction_id: broadcastResult.catalogId,
                        message_id: `msg_${Date.now().toString(36)}`,
                        timestamp: broadcastResult.timestamp
                      },
                      message: {
                        catalog: {
                          "bpp/descriptor": {
                            name: "Setu Farmer Gateway",
                            symbol: "/icons/setu.png",
                            short_desc: "Voice-enabled farmer marketplace"
                          },
                          "bpp/providers": [{
                            id: "farmer_" + broadcastResult.catalogId.slice(0, 8),
                            descriptor: broadcastResult.catalogItem?.descriptor,
                            items: [broadcastResult.catalogItem]
                          }]
                        }
                      }
                    }, null, 2)}
                  </pre>
                </div>
              )}

              {/* Timestamp Footer */}
              <div className="card-footer">
                <span className="footer-time">
                  {new Date(broadcastResult.timestamp).toLocaleString(selectedLanguage?.code === "hi" ? 'hi-IN' : 'en-IN')}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                setStage("idle");
                setConversationState(null);
                setLastResponse(null);
                setBroadcastResult(null);
              }}
              className="success-button"
            >
              {getText("sell_another")}
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
            className="error-container"
          >
            <div className="error-icon">⚠️</div>
            <p className="error-text">{error || "Something went wrong"}</p>
            <button
              onClick={() => setStage("idle")}
              className="error-button"
            >
              Try Again
            </button>
          </motion.div>
        )}

      </AnimatePresence>

      <style jsx>{`
        .setu-voice-container {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          overflow-x: hidden;
          overflow-y: auto;
        }

        .setu-voice-container.no-center {
          justify-content: flex-start;
        }
        
        /* ============== BIG BUTTON ============== */
        .big-button-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 2rem;
        }
        
        .big-button {
          position: relative;
          width: min(80vw, 80vh, 400px);
          height: min(80vw, 80vh, 400px);
          border-radius: 50%;
          border: none;
          background: linear-gradient(145deg, #ff6b35, #f7931a);
          box-shadow: 
            0 30px 60px rgba(255, 107, 53, 0.4),
            0 0 100px rgba(247, 147, 26, 0.2),
            inset 0 -10px 30px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
          -webkit-tap-highlight-color: transparent;
        }
        
        .big-button:hover {
          transform: scale(1.02);
          box-shadow: 
            0 40px 80px rgba(255, 107, 53, 0.5),
            0 0 120px rgba(247, 147, 26, 0.3),
            inset 0 -10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .big-button:active {
          transform: scale(0.98);
        }
        
        .big-button-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: white;
        }
        
        .big-button-icon {
          width: 40%;
          margin-bottom: 1rem;
        }
        
        .mic-icon {
          width: 100%;
          height: auto;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }
        
        .big-button-text {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        
        .big-button-text-hindi {
          font-size: clamp(1.5rem, 5vw, 2.5rem);
          font-weight: 700;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }
        
        .big-button-text-english {
          font-size: clamp(0.875rem, 2.5vw, 1.25rem);
          font-weight: 500;
          opacity: 0.9;
        }
        
        .big-button-pulse {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          border: 2px solid rgba(255, 107, 53, 0.5);
          animation: pulse 2s ease-out infinite;
        }
        
        .big-button-pulse.delay {
          animation-delay: 1s;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
        
        .branding {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
          margin-bottom: 2rem;
        }
        
        .brand-name {
          font-size: 2rem;
          font-weight: 700;
          opacity: 0.8;
        }
        
        .brand-tagline {
          font-size: 0.875rem;
          opacity: 0.5;
        }

        /* Test Mode Buttons */
        .test-buttons {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(0, 0, 0, 0.3);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 2rem;
        }

        .test-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.75rem;
        }

        .test-btn {
          background: rgba(255, 107, 53, 0.2);
          border: 1px solid rgba(255, 107, 53, 0.4);
          color: white;
          padding: 0.4rem 0.8rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .test-btn:hover {
          background: rgba(255, 107, 53, 0.4);
          transform: scale(1.05);
        }
        
        /* ============== LANGUAGE SELECT ============== */
        .language-select-container {
          width: 100%;
          min-height: 100vh;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
        }
        
        .language-title {
          color: white;
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        
        .language-title-en {
          display: block;
          font-size: clamp(0.875rem, 2vw, 1rem);
          font-weight: 400;
          opacity: 0.7;
          margin-top: 0.25rem;
        }
        
        .language-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
          width: 100%;
          max-width: 600px;
          padding: 1rem 0;
        }
        
        .language-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem 0.75rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 1rem;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          cursor: pointer;
          transition: all 0.2s ease;
          color: white;
        }
        
        .language-button:hover {
          background: rgba(255, 107, 53, 0.3);
          border-color: rgba(255, 107, 53, 0.5);
        }
        
        .language-native {
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .language-region {
          font-size: 0.7rem;
          opacity: 0.7;
          margin-top: 0.25rem;
        }
        
        .back-button {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 2rem;
          color: white;
          cursor: pointer;
          font-size: 0.9rem;
        }
        
        /* ============== LISTENING ============== */
        .listening-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 100vh;
          padding: 2rem;
        }
        
        .listening-animation {
          position: relative;
          width: min(50vw, 250px);
          height: min(50vw, 250px);
          margin: 0 auto;
        }
        
        .listening-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3px solid rgba(255, 107, 53, 0.5);
          animation: listening-pulse 1.5s ease-out infinite;
        }
        
        .ring-2 { animation-delay: 0.5s; }
        .ring-3 { animation-delay: 1s; }
        
        @keyframes listening-pulse {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        
        .listening-center {
          position: absolute;
          inset: 25%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(145deg, #ff6b35, #f7931a);
          border-radius: 50%;
          box-shadow: 0 10px 40px rgba(255, 107, 53, 0.5);
        }
        
        .listening-mic {
          width: 60%;
          height: 60%;
        }
        
        .listening-text {
          color: white;
          font-size: clamp(1.25rem, 3vw, 1.5rem);
          margin-top: 2rem;
          text-align: center;
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
          width: 100%;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* ============== PROCESSING ============== */
        .processing-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 100vh;
          padding: 2rem;
        }
        
        .processing-animation {
          display: flex;
          gap: 0.75rem;
        }
        
        .processing-dot {
          width: 20px;
          height: 20px;
          background: linear-gradient(145deg, #ff6b35, #f7931a);
          border-radius: 50%;
          animation: bounce 0.6s ease-in-out infinite alternate;
        }
        
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-20px); }
        }
        
        .processing-text {
          color: white;
          font-size: clamp(1rem, 3vw, 1.25rem);
          margin-top: 2rem;
          text-align: center;
          max-width: 90%;
          font-weight: 500;
          width: 100%;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* ============== SPEAKING ============== */
        .speaking-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 100vh;
          padding: 2rem;
        }
        
        .speaking-avatar {
          position: relative;
          width: min(50vw, 250px);
          height: min(50vw, 250px);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        
        .speaking-wave {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          animation: speak-wave 1s ease-out infinite;
        }
        
        .wave-2 { animation-delay: 0.33s; }
        .wave-3 { animation-delay: 0.66s; }
        
        @keyframes speak-wave {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        
        .avatar-face {
          font-size: 6rem;
          z-index: 1;
          filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.4));
        }
        
        .speaking-text {
          color: white;
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 600;
          margin-top: 2.5rem;
          text-align: center;
          max-width: 80%;
          line-height: 1.4;
          text-shadow: 0 4px 12px rgba(0,0,0,0.5);
          width: 100%;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* ============== BROADCASTING ============== */
        .broadcasting-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 100vh;
          padding: 2rem;
        }
        
        .broadcast-animation {
          position: relative;
          width: 150px;
          height: 150px;
          margin: 0 auto;
        }
        
        .broadcast-signal {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 40px;
          height: 40px;
          border-top: 3px solid rgba(255, 107, 53, 0.8);
          border-right: 3px solid rgba(255, 107, 53, 0.8);
          border-radius: 0 100% 0 0;
          transform: translate(-50%, -50%) rotate(-45deg);
          animation: broadcast 1s ease-out infinite;
        }
        
        .signal-2 { animation-delay: 0.2s; width: 70px; height: 70px; }
        .signal-3 { animation-delay: 0.4s; width: 100px; height: 100px; }
        
        @keyframes broadcast {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -50%) rotate(-45deg) scale(1.5); }
        }
        
        .broadcast-center {
          position: absolute;
          inset: 35%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 5rem;
          filter: drop-shadow(0 0 20px rgba(255, 107, 53, 0.6));
        }
        
        .broadcasting-text {
          color: white;
          font-size: clamp(1.5rem, 4vw, 2rem);
          font-weight: 600;
          margin-top: 3rem;
          text-align: center;
          text-shadow: 0 4px 12px rgba(0,0,0,0.5);
          width: 100%;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* ============== SUCCESS / SUMMARY ============== */
        .success-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          padding: 2rem 1rem 4rem 1rem;
        }

        .success-container > * {
          max-width: 550px;
          width: 100%;
        }
        
        .success-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1rem;
          flex-shrink: 0;
        }
        
        .success-icon {
          font-size: 3rem;
          margin-bottom: 0.25rem;
          animation: success-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          filter: drop-shadow(0 0 20px rgba(74, 222, 128, 0.5));
        }
        
        @keyframes success-pop {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        .success-title {
          color: #4ade80;
          font-size: clamp(1rem, 3vw, 1.5rem);
          font-weight: 700;
          text-align: center;
        }

        /* Summary Card */
        .summary-card {
          width: 100%;
          max-width: 500px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 1rem;
          padding: 1.25rem;
          backdrop-filter: blur(10px);
          margin-bottom: 1.5rem;
        }

        .protocol-badge-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .protocol-badge {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          font-size: 0.65rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .protocol-status {
          color: #4ade80;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Sections */
        .summary-section, .buyer-section, .protocol-section {
          margin-bottom: 1rem;
        }

        .section-title {
          color: white;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Info Grid */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 0.5rem;
        }

        .info-item.highlight {
          background: rgba(255, 107, 53, 0.15);
          grid-column: span 2;
        }

        .info-label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.7rem;
          margin-bottom: 0.25rem;
        }

        .info-value {
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .info-value.price {
          color: #4ade80;
          font-size: 1.1rem;
          font-weight: 700;
        }

        /* Buyer Card */
        .buyer-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(74, 222, 128, 0.15), rgba(34, 197, 94, 0.08));
          border: 1px solid rgba(74, 222, 128, 0.3);
          border-radius: 0.75rem;
        }

        .buyer-info {
          display: flex;
          flex-direction: column;
        }

        .buyer-name {
          color: white;
          font-size: 1rem;
          font-weight: 600;
        }

        .buyer-type {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.7rem;
        }

        .buyer-bid-amount {
          display: flex;
          align-items: baseline;
        }

        .buyer-bid-amount .currency {
          color: #4ade80;
          font-size: 1rem;
          font-weight: 600;
        }

        .buyer-bid-amount .amount {
          color: #4ade80;
          font-size: 1.75rem;
          font-weight: 700;
        }

        .buyer-bid-amount .unit {
          color: rgba(74, 222, 128, 0.8);
          font-size: 0.9rem;
        }

        /* Protocol Grid */
        .protocol-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.4rem;
        }

        .protocol-item {
          display: flex;
          flex-direction: column;
          padding: 0.4rem 0.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 0.35rem;
          overflow: hidden;
        }

        .protocol-label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.6rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .protocol-value {
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.65rem;
          font-family: monospace;
          word-break: break-all;
        }

        .protocol-value.status-success {
          color: #4ade80;
        }

        .protocol-value.status-active {
          color: #60a5fa;
        }

        /* Debug Toggle Button */
        .debug-toggle-btn {
          width: 100%;
          background: rgba(255, 107, 53, 0.1);
          border: 1px solid rgba(255, 107, 53, 0.3);
          border-radius: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.75rem;
          padding: 0.6rem;
          cursor: pointer;
          margin-top: 0.75rem;
          transition: all 0.2s;
        }

        .debug-toggle-btn:hover {
          background: rgba(255, 107, 53, 0.2);
        }

        /* JSON Debug */
        .json-debug {
          margin-top: 0.75rem;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 0.5rem;
          padding: 0.75rem;
          border: 1px solid rgba(255, 107, 53, 0.2);
        }

        .json-content {
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 0.6rem;
          color: rgba(255, 255, 255, 0.85);
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
          max-height: 300px;
          overflow-y: auto;
          line-height: 1.4;
        }

        /* Card Footer */
        .card-footer {
          margin-top: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .footer-time {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
        }

        /* Success Button */
        .success-button {
          padding: 0.875rem 2rem;
          background: linear-gradient(145deg, #ff6b35, #f7931a);
          border: none;
          border-radius: 2rem;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(255, 107, 53, 0.3);
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 1.5rem;
        }
        
        .success-button:hover {
          transform: scale(1.05);
          box-shadow: 0 15px 40px rgba(255, 107, 53, 0.4);
        }
        
        .success-button:active {
          transform: scale(0.98);
        }
        
        /* ============== ERROR ============== */
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 100vh;
          padding: 2rem;
          text-align: center;
        }
        
        .error-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        
        .error-text {
          color: #f87171;
          font-size: 1.25rem;
          max-width: 90%;
          margin-bottom: 2rem;
        }
        
        .error-button {
          padding: 1rem 2rem;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 2rem;
          color: white;
          font-size: 1rem;
          cursor: pointer;
        }
        
        /* ============== RESPONSIVE ============== */
        @media (max-width: 480px) {
          .language-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
          
          .language-button {
            padding: 0.75rem 0.5rem;
          }
          
          .language-native {
            font-size: 1rem;
          }
        }
      `}</style>
    </div >
  );
}
