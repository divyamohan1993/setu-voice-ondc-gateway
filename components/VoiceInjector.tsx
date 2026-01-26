"use client";

/**
 * VoiceInjector Component
 * 
 * Simulates voice input through a dropdown interface with pre-configured scenarios.
 * Provides accessibility-first design with large touch targets and high contrast.
 * 
 * Features:
 * - Dropdown with pre-configured voice scenarios
 * - Large touch targets (minimum 44x44px)
 * - High contrast colors for accessibility
 * - Loading state during processing
 * - Framer Motion animations
 * - Icon-based scenario identification using Lucide React
 * 
 * Requirements Implementation:
 * - Requirement 1.1: Display dropdown interface with selectable voice scenarios
 * - Requirement 1.2: Provide at least two pre-configured scenarios
 * - Requirement 1.3: Inject specific scenario texts as required
 * - Requirement 1.5: Trigger translation process when scenario is selected
 * - Requirement 10.5: Use minimum touch target size of 44x44 pixels
 * - Requirement 10.6: Use high contrast ratios for visual elements
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Loader2, Volume2, Wheat, Apple } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * VoiceScenario Interface
 * 
 * Represents a pre-configured voice scenario for testing
 */
export interface VoiceScenario {
  id: string;
  label: string;
  text: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

/**
 * Pre-configured voice scenarios
 * 
 * These scenarios simulate realistic farmer voice commands in Hinglish
 * as specified in the requirements:
 * - Scenario 1: "Arre bhai, 500 kilo pyaaz hai Nasik se, Grade A hai, aaj hi uthana hai"
 * - Scenario 2: "20 crate Alphonso aam hai, Ratnagiri ka, organic certified hai"
 */
const VOICE_SCENARIOS: VoiceScenario[] = [
  {
    id: "onion-scenario",
    label: "Nasik Onions - Grade A",
    text: "Arre bhai, 500 kilo pyaaz hai Nasik se, Grade A hai, aaj hi uthana hai",
    icon: Wheat, // Using Wheat as a placeholder for onion
    description: "500kg premium onions from Nasik, urgent pickup"
  },
  {
    id: "mango-scenario", 
    label: "Alphonso Mangoes - Organic",
    text: "20 crate Alphonso aam hai, Ratnagiri ka, organic certified hai",
    icon: Apple, // Using Apple as a placeholder for mango
    description: "20 crates of organic Alphonso mangoes from Ratnagiri"
  }
];

/**
 * VoiceInjectorProps Interface
 * 
 * Props for the VoiceInjector component
 */
export interface VoiceInjectorProps {
  onScenarioSelect: (text: string) => Promise<void>;
  isProcessing: boolean;
}

/**
 * VoiceInjector Component
 * 
 * Simulates voice input through a dropdown interface with pre-configured scenarios.
 * Provides accessibility-first design with large touch targets and high contrast.
 * 
 * Features:
 * - Dropdown with pre-configured voice scenarios
 * - Large touch targets (minimum 44x44px)
 * - High contrast colors for accessibility
 * - Loading state during processing
 * - Framer Motion animations
 * - Icon-based scenario identification
 * 
 * @param onScenarioSelect - Callback function when a scenario is selected
 * @param isProcessing - Whether the system is currently processing a scenario
 */
export function VoiceInjector({ onScenarioSelect, isProcessing }: VoiceInjectorProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  /**
   * Handle scenario selection
   * 
   * Triggers the translation process when a scenario is selected
   */
  const handleScenarioSelect = async (scenarioId: string) => {
    const scenario = VOICE_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) return;

    setSelectedScenario(scenarioId);

    try {
      await onScenarioSelect(scenario.text);
    } catch (error) {
      console.error("Error processing scenario:", error);
    }
  };

  /**
   * Get the currently selected scenario object
   */
  const getCurrentScenario = () => {
    return VOICE_SCENARIOS.find(s => s.id === selectedScenario);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="border-2 border-slate-200 shadow-lg">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-slate-800">
            <motion.div
              animate={isProcessing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 2, repeat: isProcessing ? Infinity : 0, ease: "linear" }}
            >
              <Mic className="h-8 w-8 text-blue-600" />
            </motion.div>
            Voice Input Simulator
          </CardTitle>
          <p className="text-slate-600 text-lg mt-2">
            Select a voice scenario to test the translation system
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Scenario Selection Dropdown */}
          <div className="space-y-3">
            <label 
              htmlFor="scenario-select" 
              className="block text-lg font-semibold text-slate-700"
            >
              Choose Voice Scenario
            </label>
            
            <Select
              value={selectedScenario || ""}
              onValueChange={handleScenarioSelect}
              disabled={isProcessing}
            >
              <SelectTrigger 
                id="scenario-select"
                className="h-16 text-lg border-2 border-slate-300 hover:border-blue-400 focus:border-blue-500 transition-colors"
                style={{ minHeight: "44px" }} // Ensure minimum touch target
                aria-label="Select voice scenario for translation"
                aria-describedby="scenario-description"
              >
                <SelectValue placeholder="Select a voice scenario..." />
              </SelectTrigger>
              
              <AnimatePresence>
                <SelectContent className="border-2 border-slate-200">
                  {VOICE_SCENARIOS.map((scenario) => (
                    <SelectItem 
                      key={scenario.id} 
                      value={scenario.id}
                      className="h-16 cursor-pointer hover:bg-blue-50 focus:bg-blue-100 transition-colors"
                      style={{ minHeight: "44px" }} // Ensure minimum touch target
                    >
                      <div className="flex items-center gap-4 w-full">
                        <scenario.icon className="h-8 w-8 text-green-600 flex-shrink-0" />
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-slate-800">
                            {scenario.label}
                          </div>
                          <div className="text-sm text-slate-600">
                            {scenario.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </AnimatePresence>
            </Select>
          </div>

          {/* Selected Scenario Display */}
          <AnimatePresence>
            {selectedScenario && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-4">
                  <Volume2 className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-800 mb-2">
                      Selected Voice Input:
                    </h3>
                    <p className="text-blue-700 text-lg italic leading-relaxed">
                      "{getCurrentScenario()?.text}"
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Processing State */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 text-center"
              >
                <div className="flex items-center justify-center gap-3 mb-3">
                  <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
                  <span className="text-xl font-semibold text-amber-800">
                    Processing Voice Input...
                  </span>
                </div>
                <p className="text-amber-700">
                  Converting voice command to Beckn Protocol JSON
                </p>
                
                {/* Processing Animation */}
                <div className="mt-4 flex justify-center">
                  <div className="flex space-x-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-amber-500 rounded-full"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-700 mb-2">How it works:</h4>
            <ol className="text-slate-600 space-y-1 text-sm">
              <li>1. Select a voice scenario from the dropdown above</li>
              <li>2. The system will translate the voice text to Beckn Protocol JSON</li>
              <li>3. Review the generated catalog in the Visual Verifier</li>
              <li>4. Broadcast your listing to the ONDC network</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default VoiceInjector;