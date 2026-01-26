"use client";

/**
 * VoiceInjector Component
 * 
 * Simulates voice input through a dropdown interface with pre-configured scenarios.
 * Designed for development mode testing without actual voice recognition.
 * 
 * Features:
 * - Large touch targets (minimum 44x44px)
 * - High contrast colors
 * - Icon-based scenario identification
 * - Smooth animations using Framer Motion
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Wheat, Apple, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * VoiceScenario
 * 
 * Represents a pre-configured voice input scenario
 */
export interface VoiceScenario {
  id: string;
  label: string;
  text: string;
  icon: string;
}

/**
 * Pre-configured voice scenarios
 * 
 * These scenarios simulate realistic farmer voice commands in Hinglish
 */
const VOICE_SCENARIOS: VoiceScenario[] = [
  {
    id: "scenario-1",
    label: "Onions from Nasik",
    text: "Arre bhai, 500 kilo pyaaz hai Nasik se, Grade A hai, aaj hi uthana hai",
    icon: "🧅"
  },
  {
    id: "scenario-2",
    label: "Alphonso Mangoes",
    text: "20 crate Alphonso aam hai, Ratnagiri ka, organic certified hai",
    icon: "🥭"
  },
  {
    id: "scenario-3",
    label: "Wheat from Punjab",
    text: "1000 kilo gehun hai Punjab se, best quality, fresh harvest",
    icon: "🌾"
  }
];

/**
 * VoiceInjectorProps
 */
export interface VoiceInjectorProps {
  onScenarioSelect: (text: string) => Promise<void>;
  isProcessing: boolean;
}

/**
 * VoiceInjector Component
 */
export function VoiceInjector({ onScenarioSelect, isProcessing }: VoiceInjectorProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const handleScenarioChange = async (scenarioId: string) => {
    const scenario = VOICE_SCENARIOS.find(s => s.id === scenarioId);
    
    if (scenario) {
      setSelectedScenario(scenarioId);
      await onScenarioSelect(scenario.text);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Mic className="h-8 w-8 text-primary" />
            Voice Input Simulator
          </CardTitle>
          <CardDescription className="text-base">
            Select a pre-configured voice scenario to test the translation system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select
              value={selectedScenario || ""}
              onValueChange={handleScenarioChange}
              disabled={isProcessing}
            >
              <SelectTrigger className="h-14 text-lg">
                <SelectValue placeholder="Choose a voice scenario..." />
              </SelectTrigger>
              <SelectContent>
                {VOICE_SCENARIOS.map((scenario) => (
                  <SelectItem
                    key={scenario.id}
                    value={scenario.id}
                    className="h-16 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{scenario.icon}</span>
                      <div className="flex flex-col items-start">
                        <span className="font-semibold">{scenario.label}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">
                          {scenario.text}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 p-4 bg-primary/10 rounded-lg"
              >
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium">Translating voice to catalog...</span>
              </motion.div>
            )}

            {selectedScenario && !isProcessing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg"
              >
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  ✓ Voice input processed successfully
                </p>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
