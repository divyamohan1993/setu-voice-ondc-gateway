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
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        console.warn("Speech synthesis not available");
        resolve();
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Get available voices and find the best match
      const voices = window.speechSynthesis.getVoices();

      // Find a voice for the requested language
      let selectedVoice = voices.find(v => v.lang === lang);

      // Fallback: Try language code without region (e.g., "hi" from "hi-IN")
      if (!selectedVoice) {
        const langCode = lang.split('-')[0];
        selectedVoice = voices.find(v => v.lang.startsWith(langCode));
      }

      // Fallback: Try any Indian voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.includes('IN') || v.lang.includes('India'));
      }

      // Fallback: Use English as last resort
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith('en'));
      }

      // Use default voice if still nothing found
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang; // Use the actual voice language
        console.log(`[TTS] Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
      } else {
        utterance.lang = lang;
        console.warn(`[TTS] No voices available, using default with lang: ${lang}`);
      }

      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      // Handle speech end
      utterance.onend = () => {
        console.log("[TTS] Speech completed successfully");
        resolve();
      };

      // Handle speech error with detailed logging
      utterance.onerror = (e) => {
        // Log detailed error info
        const errorInfo = {
          error: e.error || 'unknown',
          charIndex: e.charIndex,
          elapsedTime: e.elapsedTime,
          name: e.name,
          type: e.type
        };
        console.warn("[TTS] Speech synthesis error:", errorInfo);

        // Check for specific error types and handle gracefully
        if (e.error === 'canceled' || e.error === 'interrupted') {
          console.log("[TTS] Speech was cancelled or interrupted (normal behavior)");
        } else if (e.error === 'not-allowed') {
          console.warn("[TTS] Speech synthesis not allowed - user gesture may be required");
        } else if (e.error === 'audio-busy') {
          console.warn("[TTS] Audio output device is busy");
        }

        resolve(); // Don't reject, continue flow
      };

      setStage("speaking");
      setCurrentMessage(text);

      // Chrome workaround: voices may not be loaded immediately
      if (voices.length === 0) {
        // Wait for voices to load
        const handleVoicesChanged = () => {
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
          const newVoices = window.speechSynthesis.getVoices();
          if (newVoices.length > 0) {
            let voice = newVoices.find(v => v.lang === lang || v.lang.split('-')[0] === lang.split('-')[0]);
            if (voice) {
              utterance.voice = voice;
              utterance.lang = voice.lang;
            }
          }
          window.speechSynthesis.speak(utterance);
        };
        window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

        // Fallback timeout in case voiceschanged doesn't fire
        setTimeout(() => {
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) return;
          window.speechSynthesis.speak(utterance);
        }, 100);
      } else {
        window.speechSynthesis.speak(utterance);
      }
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

  // WCAG: Announce stage changes to screen readers
  useEffect(() => {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
      const announcements: Record<AppStage, string> = {
        idle: 'Ready to start. Press the microphone button to begin selling your crop.',
        language_select: 'Language selection. Choose your preferred language.',
        listening: 'Listening. Please speak now.',
        processing: 'Processing your input. Please wait.',
        speaking: 'System is speaking. Please listen.',
        broadcasting: 'Broadcasting to ONDC network. Please wait.',
        success: 'Broadcast successful! Your crop listing has been published.',
        error: error || 'An error occurred. Please try again.',
      };
      liveRegion.textContent = announcements[stage];
    }
  }, [stage, error]);

  return (
    <div
      className={`setu-voice-container ${stage === "success" ? "no-center" : ""}`}
      role="application"
      aria-label="Setu Voice Commerce - Voice-first marketplace for farmers"
    >
      <AnimatePresence mode="wait">

        {/* IDLE STATE - New Formal & Futuristic Design */}
        {stage === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="landing-container"
            role="region"
            aria-label="Welcome screen"
          >
            {/* Header / Branding */}
            <header className="landing-header" role="banner">
              <div className="logo-badge" aria-label="Setu Voice Logo">
                <span className="logo-icon" aria-hidden="true">🌾</span>
                <span className="logo-text">Setu<span className="version">Voice</span></span>
              </div>
              <div
                className="network-status"
                role="status"
                aria-live="polite"
                aria-label="Network status: ONDC Live"
              >
                <span className="status-dot" aria-hidden="true"></span>
                ONDC Live
              </div>
            </header>

            {/* Hero Section - Context */}
            <div className="landing-hero">
              <h1 className="hero-title">
                <span className="gradient-text">Farmer is King</span>
                <span className="hero-subtitle">किसान ही राजा है</span>
              </h1>
              <p className="hero-description">
                Direct market access. Best prices. No middlemen.
                <br />
                <span className="highlight-text">Just speak to sell your crop.</span>
              </p>
            </div>

            {/* Action Section - The Reasonable Mic Button */}
            <div className="action-section" role="group" aria-label="Voice input controls">
              <button
                onClick={handleBigButtonClick}
                className="mic-button-futuristic"
                aria-label="Start selling your crop using voice. Press Enter or click to begin. / आवाज़ से फसल बेचना शुरू करें"
                aria-describedby="mic-hint"
                type="button"
              >
                <div className="mic-icon-wrapper" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="modern-mic-icon" aria-hidden="true">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                  </svg>
                </div>
                <div className="mic-rings" aria-hidden="true"></div>
              </button>
              <p id="mic-hint" className="action-hint" aria-live="polite">Tap to Speak / बोलें</p>
            </div>

            {/* Footer / Trust */}
            <footer className="landing-footer" role="contentinfo">
              <div className="feature-pill" aria-label="Voice First interface"><span aria-hidden="true">🎙️</span> Voice First</div>
              <div className="feature-pill" aria-label="Supports 12 Indian languages"><span aria-hidden="true">🌍</span> 12 Languages</div>
              <div className="feature-pill" aria-label="Get instant bids from buyers"><span aria-hidden="true">⚡</span> Instant Bid</div>
            </footer>

            {/* Quick Test Buttons (kept but styled smaller) */}
            <nav className="test-buttons-compact" aria-label="Demo options">
              <button
                onClick={() => runTestScenario(0)}
                className="test-link"
                type="button"
                aria-label="Run tomato selling demo"
              >Demo: Tomato</button>
              <button
                onClick={() => runTestScenario(1)}
                className="test-link"
                type="button"
                aria-label="Run wheat selling demo"
              >Demo: Wheat</button>
            </nav>
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
            role="region"
            aria-labelledby="language-selection-title"
          >
            <h2 id="language-selection-title" className="language-title">
              अपनी भाषा चुनें
              <span className="language-title-en">Choose your language</span>
            </h2>

            <div
              className="language-grid"
              role="group"
              aria-label="Available languages"
            >
              {SUPPORTED_LANGUAGES.map((lang, index) => (
                <motion.button
                  key={lang.code}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLanguageSelect(lang)}
                  className="language-button"
                  type="button"
                  aria-label={`Select ${lang.name} - ${lang.region}`}
                  tabIndex={0}
                >
                  <span className="language-native">{lang.name}</span>
                  <span className="language-region">{lang.region}</span>
                </motion.button>
              ))}
            </div>

            <button
              onClick={() => setStage("idle")}
              className="back-button"
              type="button"
              aria-label="Go back to home screen / वापस जाएं"
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
            role="region"
            aria-label="Voice input active"
            aria-live="polite"
          >
            <div className="listening-animation" aria-hidden="true">
              <div className="listening-ring ring-1" />
              <div className="listening-ring ring-2" />
              <div className="listening-ring ring-3" />
              <div className="listening-center">
                <svg viewBox="0 0 50 50" className="listening-mic" aria-hidden="true">
                  <circle cx="25" cy="18" r="8" fill="white" />
                  <rect x="21" y="24" width="8" height="10" rx="2" fill="white" />
                  <path d="M15 28 Q15 40 25 42 Q35 40 35 28" stroke="white" strokeWidth="2" fill="none" />
                </svg>
              </div>
            </div>
            <p className="listening-text" role="status" aria-live="polite">{currentMessage}</p>
            <span className="sr-only">Microphone is active. Speak now to enter your crop details.</span>
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
            role="status"
            aria-label="Processing your input"
            aria-busy="true"
          >
            <div className="processing-animation" aria-hidden="true">
              <div className="processing-dot" style={{ animationDelay: "0ms" }} />
              <div className="processing-dot" style={{ animationDelay: "150ms" }} />
              <div className="processing-dot" style={{ animationDelay: "300ms" }} />
            </div>
            <p className="processing-text" aria-live="polite">{currentMessage || "समझ रहा हूं... / Processing..."}</p>
            <span className="sr-only">Please wait while we process your voice input.</span>
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
            role="region"
            aria-label="System response"
          >
            <div className="speaking-avatar" aria-hidden="true">
              <div className="speaking-wave wave-1" />
              <div className="speaking-wave wave-2" />
              <div className="speaking-wave wave-3" />
              <div className="avatar-face">
                🗣️
              </div>
            </div>
            <p className="speaking-text" role="alert" aria-live="assertive">{currentMessage}</p>
            <span className="sr-only">System is speaking. Listen to the response.</span>
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
            role="status"
            aria-label="Broadcasting to ONDC network"
            aria-busy="true"
          >
            <div className="broadcast-animation" aria-hidden="true">
              <div className="broadcast-signal signal-1" />
              <div className="broadcast-signal signal-2" />
              <div className="broadcast-signal signal-3" />
              <div className="broadcast-center">
                📡
              </div>
            </div>
            <p className="broadcasting-text" aria-live="polite">{currentMessage}</p>
            <span className="sr-only">Your crop listing is being broadcast to buyers on the ONDC network. Please wait.</span>
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
            role="region"
            aria-labelledby="success-title"
            aria-describedby="success-description"
          >
            {/* Success Header */}
            <div className="success-header" role="banner">
              <div className="success-icon" aria-hidden="true">✅</div>
              <h2 id="success-title" className="success-title">
                {getText("success_title")}
              </h2>
              <p id="success-description" className="sr-only">
                Your crop has been successfully listed on the ONDC network. A buyer has made an offer.
              </p>
            </div>

            {/* Main Content Card */}
            <article className="summary-card" aria-label="Transaction Summary">
              {/* Protocol Badge */}
              <div className="protocol-badge-row" role="status">
                <span className="protocol-badge" aria-label="Protocol: ONDC Beckn version 1.2">ONDC / BECKN PROTOCOL v1.2</span>
                <span className="protocol-status" aria-label="Verification status: Verified">✓ Verified</span>
              </div>

              {/* Transaction Summary */}
              <section className="summary-section" aria-labelledby="crop-section-title">
                <h3 id="crop-section-title" className="section-title"><span aria-hidden="true">📦</span> {getText("crop")} Details</h3>
                <dl className="info-grid" role="list">
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
                </dl>
              </section>

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
                <div id="json-debug-panel" className="json-debug" role="region" aria-label="Raw JSON data">
                  <pre className="json-content" tabIndex={0} aria-label="Beckn Protocol JSON payload">
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
            </article>

            {/* Action Button */}
            <button
              onClick={() => {
                setStage("idle");
                setConversationState(null);
                setLastResponse(null);
                setBroadcastResult(null);
              }}
              className="success-button"
              type="button"
              aria-label="Sell another crop - Start a new listing"
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
            role="alertdialog"
            aria-labelledby="error-title"
            aria-describedby="error-description"
          >
            <div className="error-icon" aria-hidden="true">⚠️</div>
            <h2 id="error-title" className="sr-only">Error / त्रुटि</h2>
            <p id="error-description" className="error-text" role="alert">{error || "Something went wrong"}</p>
            <button
              onClick={() => setStage("idle")}
              className="error-button"
              type="button"
              aria-label="Try again - Return to home screen"
              autoFocus
            >
              Try Again / फिर से कोशिश करें
            </button>
          </motion.div>
        )}

      </AnimatePresence>

      <style jsx>{`
        /* =====================================================
         * INDIA GOVERNMENT DESIGN SYSTEM COMPLIANT STYLES
         * Following: India.gov.in, Digital India Guidelines
         * ===================================================== */
        
        .setu-voice-container {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #FFFFFF;
          overflow-x: hidden;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
        }

        .setu-voice-container.no-center {
          justify-content: flex-start;
        }
        
        /* Ensure all animated children stay within viewport */
        .setu-voice-container > * {
          flex-shrink: 0;
          max-height: 100%;
        }
        
        /* ============== LANDING PAGE (Official Style) ============== */
        .landing-container {
          display: flex;
          flex-direction: column;
          min-height: 100%;
          width: 100%;
          padding: 1rem 1.25rem 2rem 1.25rem;
          max-width: 600px;
          margin: 0 auto;
          position: relative;
          background: #FFFFFF;
          box-sizing: border-box;
        }
        
        /* Desktop: Center content vertically */
        @media (min-width: 768px) {
          .landing-container {
            padding: 2rem;
            justify-content: center;
            min-height: 100vh;
            max-width: 560px;
          }
        }

        .landing-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0 1rem 0;
          border-bottom: 2px solid #E5E7EB;
          flex-shrink: 0;
        }

        .logo-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #1A365D;
          padding: 0.5rem 1rem;
          border-radius: 6px;
        }

        .logo-icon {
          font-size: 1.25rem;
        }

        .logo-text {
          font-weight: 700;
          font-size: 1.2rem;
          color: white;
        }

        .version {
          font-size: 0.7rem;
          opacity: 0.8;
          margin-left: 4px;
          font-weight: 400;
        }

        .network-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: #138808;
          background: rgba(19, 136, 8, 0.1);
          padding: 6px 12px;
          border-radius: 6px;
          font-weight: 600;
          border: 1px solid #138808;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #138808;
          border-radius: 50%;
        }

        .landing-hero {
          text-align: center;
          margin: 1.5rem 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex-shrink: 0;
        }
        
        @media (min-width: 768px) {
          .landing-hero {
            margin: 2.5rem 0;
          }
        }

        .hero-title {
          font-size: clamp(1.75rem, 5vw, 2.5rem);
          line-height: 1.2;
          font-weight: 700;
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          color: #1A365D;
        }

        .gradient-text {
          color: #E07800;
        }

        .hero-subtitle {
          font-size: clamp(0.95rem, 2.5vw, 1.25rem);
          color: #1F2937;
          font-weight: 400;
          font-family: var(--font-noto-devanagari), sans-serif;
        }

        .hero-description {
          color: #6B7280;
          font-size: 0.95rem;
          line-height: 1.5;
          max-width: 100%;
          margin: 0.75rem auto 0 auto;
        }

        .highlight-text {
          color: #1A365D;
          font-weight: 600;
          display: block;
          margin-top: 0.5rem;
        }

        .action-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
          margin: 1rem 0 1.5rem 0;
          padding: 1.5rem 1rem;
          background: #F9FAFB;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          flex-shrink: 0;
        }
        
        @media (min-width: 768px) {
          .action-section {
            padding: 2rem;
            margin: 1.5rem 0 2rem 0;
          }
        }

        .mic-button-futuristic {
          position: relative;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #E07800 0%, #FF9933 100%);
          border: 4px solid #1A365D;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(224, 120, 0, 0.3);
          z-index: 10;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .mic-button-futuristic:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 30px rgba(224, 120, 0, 0.4);
        }

        .mic-button-futuristic:active {
          transform: scale(0.95);
        }

        .mic-icon-wrapper {
          color: white;
          width: 40px;
          height: 40px;
          z-index: 2;
        }
        
        .modern-mic-icon {
          width: 100%;
          height: 100%;
        }

        .mic-rings {
          position: absolute;
          inset: -15px;
          border: 2px solid rgba(224, 120, 0, 0.4);
          border-radius: 50%;
          animation: pulse-ring 2s infinite;
        }

        .mic-rings::before {
          content: '';
          position: absolute;
          inset: -15px;
          border: 2px solid rgba(224, 120, 0, 0.2);
          border-radius: 50%;
          animation: pulse-ring 2s infinite 0.5s;
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .action-hint {
          font-size: 0.95rem;
          color: #1F2937;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .landing-footer {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid #E5E7EB;
          flex-shrink: 0;
        }

        .feature-pill {
          font-size: 0.75rem;
          color: #1A365D;
          background: #F3F4F6;
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #D1D5DB;
          font-weight: 500;
          white-space: nowrap;
        }
        
        @media (min-width: 768px) {
          .feature-pill {
            font-size: 0.8rem;
            padding: 8px 16px;
          }
        }

        .test-buttons-compact {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px dashed #D1D5DB;
          flex-shrink: 0;
        }

        .test-link {
          background: none;
          border: 1px solid #1A365D;
          color: #1A365D;
          text-decoration: none;
          cursor: pointer;
          font-size: 0.8rem;
          padding: 6px 12px;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .test-link:hover {
          background: #1A365D;
          color: white;
        }
        
        /* ============== LANGUAGE SELECT (Official Style) ============== */
        .language-select-container {
          width: 100%;
          min-height: 100%;
          padding: 1.5rem 1rem 2rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          overflow-y: auto;
          background: #FFFFFF;
          box-sizing: border-box;
        }
        
        @media (min-width: 768px) {
          .language-select-container {
            padding: 2rem;
            justify-content: center;
          }
        }
        
        .language-title {
          color: #1A365D;
          font-size: clamp(1.25rem, 4vw, 1.75rem);
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        
        .language-title-en {
          display: block;
          font-size: clamp(0.8rem, 2vw, 1rem);
          font-weight: 400;
          color: #6B7280;
          margin-top: 0.25rem;
        }
        
        .language-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          width: 100%;
          max-width: 500px;
          padding: 1rem 0;
        }
        
        @media (min-width: 480px) {
          .language-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }
        }
        
        @media (min-width: 768px) {
          .language-grid {
            grid-template-columns: repeat(4, 1fr);
            max-width: 600px;
          }
        }
        
        .language-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1.25rem 1rem;
          border: 2px solid #D1D5DB;
          border-radius: 8px;
          background: #FFFFFF;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #1F2937;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .language-button:hover {
          background: #FFF7ED;
          border-color: #E07800;
          box-shadow: 0 2px 8px rgba(224, 120, 0, 0.2);
        }
        
        .language-button:focus {
          outline: 3px solid #E07800;
          outline-offset: 2px;
        }
        
        .language-native {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1A365D;
        }
        
        .language-region {
          font-size: 0.75rem;
          color: #6B7280;
          margin-top: 0.25rem;
        }
        
        .back-button {
          margin-top: 1.5rem;
          padding: 0.75rem 2rem;
          background: #1A365D;
          border: none;
          border-radius: 6px;
          color: white;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          transition: background 0.2s;
        }
        
        .back-button:hover {
          background: #2D4A6F;
        }
        
        /* ============== LISTENING (Official Style) ============== */
        .listening-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 100%;
          padding: 3rem 1rem;
          background: #FFFFFF;
          box-sizing: border-box;
          overflow: hidden;
        }
        
        @media (min-width: 768px) {
          .listening-container {
            padding: 4rem 2rem;
          }
        }
        
        .listening-animation {
          position: relative;
          width: min(40vw, 160px);
          height: min(40vw, 160px);
          margin: 0 auto;
          flex-shrink: 0;
        }
        
        @media (min-width: 768px) {
          .listening-animation {
            width: min(45vw, 180px);
            height: min(45vw, 180px);
          }
        }
        
        .listening-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 3px solid rgba(224, 120, 0, 0.4);
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
          background: linear-gradient(145deg, #E07800, #FF9933);
          border-radius: 50%;
          border: 3px solid #1A365D;
          box-shadow: 0 4px 20px rgba(224, 120, 0, 0.4);
        }
        
        .listening-mic {
          width: 55%;
          height: 55%;
        }
        
        .listening-text {
          color: #1F2937;
          font-size: 1.25rem;
          text-align: center;
          margin-top: 2rem;
          font-weight: 500;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* ============== PROCESSING (Official Style) ============== */
        .processing-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 100%;
          padding: 3rem 1rem;
          background: #FFFFFF;
          overflow: hidden;
        }
        
        .processing-animation {
          display: flex;
          gap: 0.75rem;
        }
        
        .processing-dot {
          width: 18px;
          height: 18px;
          background: #1A365D;
          border-radius: 50%;
          animation: bounce 0.6s ease-in-out infinite alternate;
        }
        
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-15px); }
        }
        
        .processing-text {
          color: #1F2937;
          font-size: 1.125rem;
          margin-top: 2rem;
          text-align: center;
          max-width: 500px;
          font-weight: 500;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* ============== SPEAKING (Official Style) ============== */
        .speaking-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 100%;
          padding: 3rem 1rem;
          background: #FFFFFF;
          overflow: hidden;
        }
        
        .speaking-avatar {
          position: relative;
          width: min(35vw, 150px);
          height: min(35vw, 150px);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          flex-shrink: 0;
        }
        
        .speaking-wave {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid rgba(26, 54, 93, 0.3);
          animation: speak-wave 1s ease-out infinite;
        }
        
        .wave-2 { animation-delay: 0.33s; }
        .wave-3 { animation-delay: 0.66s; }
        
        @keyframes speak-wave {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        
        .avatar-face {
          font-size: 5rem;
          z-index: 1;
        }
        
        .speaking-text {
          color: #1F2937;
          font-size: clamp(1.25rem, 3vw, 1.5rem);
          font-weight: 600;
          margin-top: 2rem;
          text-align: center;
          max-width: 600px;
          line-height: 1.5;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* ============== BROADCASTING (Official Style) ============== */
        .broadcasting-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 100%;
          padding: 3rem 1rem;
          background: #FFFFFF;
          overflow: hidden;
        }
        
        .broadcast-animation {
          position: relative;
          width: 140px;
          height: 140px;
          margin: 0 auto;
        }
        
        .broadcast-signal {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 35px;
          height: 35px;
          border-top: 3px solid rgba(224, 120, 0, 0.8);
          border-right: 3px solid rgba(224, 120, 0, 0.8);
          border-radius: 0 100% 0 0;
          transform: translate(-50%, -50%) rotate(-45deg);
          animation: broadcast 1s ease-out infinite;
        }
        
        .signal-2 { animation-delay: 0.2s; width: 60px; height: 60px; }
        .signal-3 { animation-delay: 0.4s; width: 90px; height: 90px; }
        
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
          font-size: 4rem;
        }
        
        .broadcasting-text {
          color: #1F2937;
          font-size: clamp(1.25rem, 3vw, 1.5rem);
          font-weight: 600;
          margin-top: 2rem;
          text-align: center;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* ============== SUCCESS / SUMMARY (Official Style) ============== */
        .success-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          padding: 1.5rem 1rem 3rem 1rem;
          background: #FFFFFF;
          box-sizing: border-box;
        }
        
        @media (min-width: 768px) {
          .success-container {
            padding: 2rem 1.5rem 4rem 1.5rem;
          }
        }

        .success-container > * {
          max-width: 520px;
          width: 100%;
        }
        
        @media (min-width: 768px) {
          .success-container > * {
            max-width: 560px;
          }
        }
        
        .success-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-shrink: 0;
        }
        
        .success-icon {
          font-size: 3.5rem;
          margin-bottom: 0.5rem;
          animation: success-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        @keyframes success-pop {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        
        .success-title {
          color: #138808;
          font-size: clamp(1.25rem, 3vw, 1.75rem);
          font-weight: 700;
          text-align: center;
        }

        /* Summary Card - Official Government Style */
        .summary-card {
          width: 100%;
          max-width: 560px;
          background: #FFFFFF;
          border: 2px solid #D1D5DB;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          margin-bottom: 1.5rem;
        }

        .protocol-badge-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #E5E7EB;
        }

        .protocol-badge {
          background: #1A365D;
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .protocol-status {
          color: #138808;
          font-size: 0.85rem;
          font-weight: 700;
        }

        /* Sections */
        .summary-section, .buyer-section, .protocol-section {
          margin-bottom: 1.25rem;
        }

        .section-title {
          color: #1A365D;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #E5E7EB;
        }

        /* Info Grid */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          padding: 0.75rem;
          background: #F9FAFB;
          border-radius: 6px;
          border: 1px solid #E5E7EB;
        }

        .info-item.highlight {
          background: #FFF7ED;
          border-color: #E07800;
          grid-column: span 2;
        }

        .info-label {
          color: #6B7280;
          font-size: 0.75rem;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .info-value {
          color: #1F2937;
          font-size: 1rem;
          font-weight: 600;
        }

        .info-value.price {
          color: #138808;
          font-size: 1.25rem;
          font-weight: 700;
        }

        /* Buyer Card */
        .buyer-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          background: #F0FDF4;
          border: 2px solid #138808;
          border-radius: 8px;
        }

        .buyer-info {
          display: flex;
          flex-direction: column;
        }

        .buyer-name {
          color: #1F2937;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .buyer-type {
          color: #138808;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .buyer-bid-amount {
          display: flex;
          align-items: baseline;
        }

        .buyer-bid-amount .currency {
          color: #138808;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .buyer-bid-amount .amount {
          color: #138808;
          font-size: 2rem;
          font-weight: 700;
        }

        .buyer-bid-amount .unit {
          color: #138808;
          font-size: 1rem;
          font-weight: 500;
        }

        /* Protocol Grid */
        .protocol-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .protocol-item {
          display: flex;
          flex-direction: column;
          padding: 0.5rem 0.75rem;
          background: #F3F4F6;
          border-radius: 4px;
          border: 1px solid #E5E7EB;
        }

        .protocol-label {
          color: #6B7280;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 500;
        }

        .protocol-value {
          color: #1F2937;
          font-size: 0.7rem;
          font-family: 'Consolas', monospace;
          word-break: break-all;
        }

        .protocol-value.status-success {
          color: #138808;
          font-weight: 600;
        }

        .protocol-value.status-active {
          color: #1A365D;
          font-weight: 600;
        }

        /* Debug Toggle Button */
        .debug-toggle-btn {
          width: 100%;
          background: #F3F4F6;
          border: 1px solid #D1D5DB;
          border-radius: 6px;
          color: #1F2937;
          font-size: 0.85rem;
          padding: 0.75rem;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.2s;
          font-weight: 500;
        }

        .debug-toggle-btn:hover {
          background: #E5E7EB;
          border-color: #9CA3AF;
        }

        /* JSON Debug */
        .json-debug {
          margin-top: 1rem;
          background: #1F2937;
          border-radius: 6px;
          padding: 1rem;
          border: 1px solid #374151;
        }

        .json-content {
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 0.7rem;
          color: #E5E7EB;
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
          max-height: 300px;
          overflow-y: auto;
          line-height: 1.5;
        }

        /* Card Footer */
        .card-footer {
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px solid #E5E7EB;
          text-align: center;
        }

        .footer-time {
          color: #6B7280;
          font-size: 0.85rem;
        }

        /* Success Button - Official Saffron */
        .success-button {
          padding: 1rem 2.5rem;
          background: #E07800;
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(224, 120, 0, 0.3);
          transition: all 0.2s;
          margin-top: 2rem;
        }
        
        .success-button:hover {
          background: #CC6B00;
          box-shadow: 0 4px 16px rgba(224, 120, 0, 0.4);
        }
        
        .success-button:active {
          transform: scale(0.98);
        }
        
        /* ============== ERROR (Official Style) ============== */
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 100%;
          padding: 3rem 1rem;
          text-align: center;
          background: #FFFFFF;
          overflow: hidden;
        }
        
        .error-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }
        
        .error-text {
          color: #B91C1C;
          font-size: 1.25rem;
          max-width: 500px;
          margin-bottom: 2rem;
          font-weight: 500;
          line-height: 1.5;
        }
        
        .error-button {
          padding: 1rem 2.5rem;
          background: #1A365D;
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .error-button:hover {
          background: #2D4A6F;
        }
        
        /* ============== RESPONSIVE ============== */
        @media (max-width: 480px) {
          .language-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
          
          .language-button {
            padding: 0.875rem 0.5rem;
          }
          
          .language-native {
            font-size: 1rem;
          }
          
          .success-button,
          .error-button {
            width: 100%;
            max-width: 280px;
          }
        }
      `}</style>
    </div >
  );
}
