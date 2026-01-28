"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, Loader2, Volume2, Sparkles, Languages } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Declarations for Web Speech API
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

export interface VoiceInjectorProps {
    onScenarioSelect: (scenario: string) => void;
    isProcessing: boolean;
}

export function VoiceInjector({ onScenarioSelect, isProcessing }: VoiceInjectorProps) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [showSimulate, setShowSimulate] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = "hi-IN"; // Default to Hindi

                recognitionRef.current.onstart = () => {
                    setIsListening(true);
                    setError(null);
                };

                recognitionRef.current.onresult = (event: any) => {
                    const text = event.results[0][0].transcript;
                    setTranscript(text);
                    onScenarioSelect(text);
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    setIsListening(false);
                    // If not allowed or not supported, show simulation option
                    if (event.error === 'not-allowed' || event.error === 'no-speech') {
                        setError("माइक की समस्या (Mic Error). कृपया दोबारा कोशिश करें।");
                    } else {
                        setShowSimulate(true);
                    }
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };
            } else {
                setShowSimulate(true);
            }
        }
    }, [onScenarioSelect]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            try {
                recognitionRef.current?.start();
            } catch (err) {
                console.error("Failed to start recognition:", err);
                setShowSimulate(true);
            }
        }
    };

    // Fallback Simulation Data
    const simulateVoiceInput = () => {
        const scenarios = [
            "मेरे पास ५०० किलो लाल प्याज है नासिक से। क्वालिटी ए ग्रेड है। मुझे २५ रुपये प्रति किलो चाहिए। कल तक दे सकता हूँ।",
            "रत्नागिरी से ताजा हापुस आम उपलब्ध है। २०० दर्जन पेटी तैयार है। बढ़िया एक्सपर्ट क्वालिटी। ८०० रुपये दर्जन।"
        ];
        const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        setTranscript(randomScenario);
        onScenarioSelect(randomScenario);
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4 space-y-8">
            {/* Visual Instructions Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Languages className="w-24 h-24 text-orange-500" />
                </div>

                <CardContent className="p-8 text-center space-y-6">
                    <div className="flex justify-center mb-4">
                        <span className="bg-orange-100 text-orange-800 px-4 py-1 rounded-full text-sm font-bold border border-orange-200">
                            हिंदी / Marathi Mode
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                        अपनी फसल बेचने के लिए <br />
                        <span className="text-orange-600">निचे दिए गए बटन को दबाएं</span>
                    </h2>

                    <div className="bg-white/60 p-6 rounded-2xl mx-auto max-w-lg border border-orange-100 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center justify-center gap-3 mb-3 text-orange-700 font-semibold text-lg">
                            <Volume2 className="w-6 h-6" />
                            क्या बोलना है? (What to say?)
                        </div>
                        <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium">
                            "मेरा <span className="text-green-600 font-bold">नाम</span>...
                            मेरी <span className="text-green-600 font-bold">फसल</span>...
                            कितनी <span className="text-green-600 font-bold">मात्रा</span>...
                            और <span className="text-green-600 font-bold">कीमत</span>..."
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Main Interaction Area */}
            <div className="flex flex-col items-center justify-center space-y-8 py-8">

                {/* Giant Mic Button */}
                <div className="relative group">
                    {isListening && (
                        <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75" />
                    )}

                    <Button
                        disabled={isProcessing}
                        onClick={toggleListening}
                        variant={isListening ? "destructive" : "default"}
                        className={cn(
                            "relative w-48 h-48 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 border-8",
                            isListening
                                ? "bg-red-500 hover:bg-red-600 border-red-200"
                                : "bg-gradient-to-b from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-orange-200",
                            isProcessing && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isProcessing ? (
                            <Loader2 className="w-20 h-20 text-white animate-spin" />
                        ) : (
                            <Mic className={cn("w-24 h-24 text-white", isListening && "animate-pulse")} />
                        )}
                    </Button>

                    {/* Label below button */}
                    <div className="absolute -bottom-16 left-0 right-0 text-center">
                        <p className={cn(
                            "text-xl font-bold transition-all duration-300",
                            isListening ? "text-red-500 scale-110" : "text-gray-500"
                        )}>
                            {isProcessing ? "Processing..." : isListening ? "सुन रहा हूँ... (Listening)" : "बोलने के लिए दबाएं (Tap to Speak)"}
                        </p>
                    </div>
                </div>

                {/* Live Transcript or Error */}
                <div className="h-24 w-full flex items-center justify-center text-center px-4">
                    {error && (
                        <p className="text-red-500 font-medium bg-red-50 px-4 py-2 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                            {error}
                        </p>
                    )}

                    {transcript && !isProcessing && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 max-w-2xl bg-white p-4 rounded-xl border-l-4 border-green-500 shadow-sm">
                            <div className="flex items-center gap-2 mb-1 text-xs font-bold text-green-600 uppercase tracking-wider">
                                <Sparkles className="w-3 h-3" />
                                आवाज़ परजी (Voice Input)
                            </div>
                            <p className="text-lg text-gray-800 font-medium">"{transcript}"</p>
                        </div>
                    )}
                </div>

                {/* Fallback Simulation Button (Only visible if needed or for dev) */}
                {(showSimulate || error) && !isProcessing && !isListening && (
                    <Button
                        variant="outline"
                        onClick={simulateVoiceInput}
                        className="mt-4 text-muted-foreground border-dashed"
                    >
                        Test Simulation (Developer Mode)
                    </Button>
                )}
            </div>
        </div>
    );
}
