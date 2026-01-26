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
import { Mic, Loader2, Volume2, Package, Sparkles } from "lucide-react";
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
 * 
 * Icons are selected from Lucide React to provide visual identification:
 * - Package icon represents onions (bulk commodity packaging)
 * - Sparkles icon represents mangoes (premium/special fruit quality)
 */
const VOICE_SCENARIOS: VoiceScenario[] = [
  {
    id: "onion-scenario",
    label: "Nasik Onions - Grade A",
    text: "Arre bhai, 500 kilo pyaaz hai Nasik se, Grade A hai, aaj hi uthana hai",
    icon: Package, // Package represents bulk commodity like onions
    description: "500kg premium onions from Nasik, urgent pickup"
  },
  {
    id: "mango-scenario", 
    label: "Alphonso Mangoes - Organic",
    text: "20 crate Alphonso aam hai, Ratnagiri ka, organic certified hai",
    icon: Sparkles, // Sparkles represents the premium quality of Alphonso mangoes
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
  const [isSelecting, setIsSelecting] = useState(false);

  /**
   * Handle scenario selection
   * 
   * Triggers the translation process when a scenario is selected.
   * Implements error handling gracefully as specified in the design requirements.
   */
  const handleScenarioSelect = async (scenarioId: string) => {
    // Provide immediate visual feedback (within 100ms requirement)
    setIsSelecting(true);
    
    // Validate scenario exists
    const scenario = VOICE_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) {
      console.error("Invalid scenario selected:", scenarioId);
      setIsSelecting(false);
      return;
    }

    // Update selected scenario state
    setSelectedScenario(scenarioId);

    try {
      // Trigger translation process
      await onScenarioSelect(scenario.text);
    } catch (error) {
      console.error("Error processing scenario:", error);
      
      // Reset selected scenario on error to allow retry
      setSelectedScenario(null);
      
      // Re-throw error to allow parent component to handle user feedback
      throw error;
    } finally {
      setIsSelecting(false);
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
      <Card className="border-3 border-slate-300 shadow-xl bg-white">
        <CardHeader className="text-center pb-4 bg-gradient-to-b from-slate-50 to-white">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-slate-900">
            <motion.div
              animate={isProcessing ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 2, repeat: isProcessing ? Infinity : 0, ease: "linear" }}
              className="p-2 rounded-full bg-blue-100 border-2 border-blue-200"
            >
              <Mic className="h-8 w-8 text-blue-700" />
            </motion.div>
            Voice Input Simulator
            {/* Immediate selection feedback */}
            <AnimatePresence>
              {isSelecting && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="p-2 rounded-full bg-blue-200 border-2 border-blue-300"
                >
                  <Loader2 className="h-5 w-5 text-blue-800 animate-spin" />
                </motion.div>
              )}
            </AnimatePresence>
            {selectedScenario && !isSelecting && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`p-2 rounded-full border-2 ${selectedScenario === 'onion-scenario' ? 'bg-orange-200 border-orange-300' : 'bg-purple-200 border-purple-300'}`}
              >
                {(() => {
                  const scenario = getCurrentScenario();
                  return scenario ? (
                    <scenario.icon className={`h-6 w-6 ${selectedScenario === 'onion-scenario' ? 'text-orange-800' : 'text-purple-800'}`} />
                  ) : null;
                })()}
              </motion.div>
            )}
          </CardTitle>
          <p className="text-slate-700 text-lg mt-2 font-medium">
            Select a voice scenario to test the translation system
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Scenario Selection Dropdown */}
          <div className="space-y-4">
            <label 
              htmlFor="scenario-select" 
              className="block text-xl font-bold text-slate-900"
            >
              Choose Voice Scenario
            </label>
            <div id="scenario-description" className="sr-only">
              Select a pre-configured voice scenario to test the translation system. Each scenario represents a realistic farmer voice command in Hinglish.
            </div>
            
            <Select
              value={selectedScenario || ""}
              onValueChange={handleScenarioSelect}
              disabled={isProcessing || isSelecting}
            >
              <SelectTrigger 
                id="scenario-select"
                className="h-16 text-lg font-semibold border-3 border-slate-400 hover:border-blue-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-200 bg-white hover:bg-blue-50 transition-all duration-150 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ minHeight: "48px", minWidth: "48px" }} // Ensure minimum touch target (increased from 44px for better accessibility)
                aria-label="Select voice scenario for translation"
                aria-describedby="scenario-description"
              >
                <SelectValue 
                  placeholder="Select a voice scenario..." 
                  className="text-slate-700 font-medium"
                />
              </SelectTrigger>
              
              <AnimatePresence>
                <SelectContent className="border-3 border-slate-300 bg-white shadow-xl">
                  {VOICE_SCENARIOS.map((scenario) => (
                    <SelectItem 
                      key={scenario.id} 
                      value={scenario.id}
                      className="h-20 cursor-pointer hover:bg-blue-100 focus:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] border-b border-slate-200 last:border-b-0"
                      style={{ minHeight: "48px", minWidth: "48px" }} // Ensure minimum touch target (increased from 44px)
                      aria-label={`${scenario.label}: ${scenario.description}`}
                    >
                      <div className="flex items-center gap-4 w-full p-2">
                        <motion.div 
                          className={`p-3 rounded-xl shadow-sm ${scenario.id === 'onion-scenario' ? 'bg-orange-200 border-2 border-orange-300' : 'bg-purple-200 border-2 border-purple-300'}`}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.1 }}
                          style={{ minHeight: "48px", minWidth: "48px" }} // Ensure icon container meets touch target
                        >
                          <scenario.icon className={`h-12 w-12 flex-shrink-0 ${scenario.id === 'onion-scenario' ? 'text-orange-700' : 'text-purple-700'}`} />
                        </motion.div>
                        <div className="flex-1 text-left">
                          <div className="font-bold text-slate-900 text-lg">
                            {scenario.label}
                          </div>
                          <div className="text-base text-slate-700 font-medium">
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
                transition={{ duration: 0.2 }}
                className="bg-blue-100 border-3 border-blue-300 rounded-xl p-6 shadow-sm"
                role="region"
                aria-label="Selected voice scenario"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-200 rounded-lg border-2 border-blue-300">
                    <Volume2 className="h-7 w-7 text-blue-800 mt-1 flex-shrink-0" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 mb-3 text-lg">
                      Selected Voice Input:
                    </h3>
                    <p className="text-blue-800 text-xl italic leading-relaxed font-medium bg-white p-4 rounded-lg border-2 border-blue-200 shadow-sm">
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
                transition={{ duration: 0.2 }}
                className="bg-amber-100 border-3 border-amber-300 rounded-xl p-8 text-center shadow-sm"
                role="status"
                aria-live="polite"
                aria-label="Processing voice input"
              >
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="p-2 bg-amber-200 rounded-lg border-2 border-amber-300">
                    <Loader2 className="h-10 w-10 text-amber-800 animate-spin" />
                  </div>
                  <span className="text-2xl font-bold text-amber-900">
                    Processing Voice Input...
                  </span>
                </div>
                <p className="text-amber-800 text-lg font-medium">
                  Converting voice command to Beckn Protocol JSON
                </p>
                
                {/* Processing Animation */}
                <div className="mt-4 flex justify-center">
                  <div className="flex space-x-3">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-4 h-4 bg-amber-600 rounded-full border border-amber-700"
                        animate={{
                          scale: [1, 1.3, 1],
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