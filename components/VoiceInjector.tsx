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
            
            <motion.div
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.1 }
              }}
            >
              <Select
                value={selectedScenario || ""}
                onValueChange={handleScenarioSelect}
                disabled={isProcessing || isSelecting}
              >
                <motion.div
                  animate={selectedScenario ? { 
                    borderColor: "#3b82f6", // Blue border when selected
                    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)"
                  } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <SelectTrigger 
                    id="scenario-select"
                    className="h-16 text-lg font-semibold border-3 border-slate-400 hover:border-blue-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-200 bg-white hover:bg-blue-50 transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ minHeight: "48px", minWidth: "48px" }} // Ensure minimum touch target (increased from 44px for better accessibility)
                    aria-label="Select voice scenario for translation"
                    aria-describedby="scenario-description"
                  >
                    <motion.div
                      animate={selectedScenario ? { 
                        color: "#1e40af" // Blue text when selected
                      } : {}}
                      transition={{ duration: 0.2 }}
                    >
                      <SelectValue 
                        placeholder="Select a voice scenario..." 
                        className="text-slate-700 font-medium"
                      />
                    </motion.div>
                  </SelectTrigger>
                </motion.div>
              </Select>
            </motion.div>
              
              <SelectContent className="border-3 border-slate-300 bg-white shadow-xl overflow-hidden">
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ 
                    duration: 0.2, 
                    ease: [0.4, 0.0, 0.2, 1] // Custom easing for smooth dropdown animation
                  }}
                >
                  {VOICE_SCENARIOS.map((scenario, index) => (
                    <motion.div
                      key={scenario.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.1, // Stagger animation for each item
                        ease: [0.4, 0.0, 0.2, 1]
                      }}
                    >
                      <SelectItem 
                        value={scenario.id}
                        className="h-20 cursor-pointer hover:bg-blue-100 focus:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-b border-slate-200 last:border-b-0"
                        style={{ minHeight: "48px", minWidth: "48px" }} // Ensure minimum touch target (increased from 44px)
                        aria-label={`${scenario.label}: ${scenario.description}`}
                      >
                        <div className="flex items-center gap-4 w-full p-2">
                          <motion.div 
                            className={`p-3 rounded-xl shadow-sm ${scenario.id === 'onion-scenario' ? 'bg-orange-200 border-2 border-orange-300' : 'bg-purple-200 border-2 border-purple-300'}`}
                            whileHover={{ 
                              scale: 1.1,
                              rotate: [0, -5, 5, 0], // Subtle wiggle animation on hover
                              transition: { duration: 0.3 }
                            }}
                            whileTap={{ 
                              scale: 0.95,
                              transition: { duration: 0.1 }
                            }}
                            style={{ minHeight: "48px", minWidth: "48px" }} // Ensure icon container meets touch target
                          >
                            <motion.div
                              whileHover={{ 
                                y: -2,
                                transition: { duration: 0.2 }
                              }}
                            >
                              <scenario.icon className={`h-12 w-12 flex-shrink-0 ${scenario.id === 'onion-scenario' ? 'text-orange-700' : 'text-purple-700'}`} />
                            </motion.div>
                          </motion.div>
                          <motion.div 
                            className="flex-1 text-left"
                            whileHover={{ 
                              x: 5,
                              transition: { duration: 0.2 }
                            }}
                          >
                            <motion.div 
                              className="font-bold text-slate-900 text-lg"
                              whileHover={{ 
                                color: "#1e40af", // Blue color on hover
                                transition: { duration: 0.2 }
                              }}
                            >
                              {scenario.label}
                            </motion.div>
                            <div className="text-base text-slate-700 font-medium">
                              {scenario.description}
                            </div>
                          </motion.div>
                        </div>
                      </SelectItem>
                    </motion.div>
                  ))}
                </motion.div>
              </SelectContent>
            </Select>
          </div>

          {/* Selected Scenario Display */}
          <AnimatePresence mode="wait">
            {selectedScenario && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.4, 0.0, 0.2, 1],
                  height: { duration: 0.3 }
                }}
                className="bg-blue-100 border-3 border-blue-300 rounded-xl p-6 shadow-sm overflow-hidden"
                role="region"
                aria-label="Selected voice scenario"
              >
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex items-start gap-4"
                >
                  <motion.div 
                    className="p-2 bg-blue-200 rounded-lg border-2 border-blue-300"
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }}
                  >
                    <Volume2 className="h-7 w-7 text-blue-800 mt-1 flex-shrink-0" />
                  </motion.div>
                  <div className="flex-1">
                    <motion.h3 
                      className="font-bold text-blue-900 mb-3 text-lg"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                    >
                      Selected Voice Input:
                    </motion.h3>
                    <motion.p 
                      className="text-blue-800 text-xl italic leading-relaxed font-medium bg-white p-4 rounded-lg border-2 border-blue-200 shadow-sm"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
                        transition: { duration: 0.2 }
                      }}
                    >
                      "{getCurrentScenario()?.text}"
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Processing State */}
          <AnimatePresence mode="wait">
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ 
                  duration: 0.3,
                  ease: [0.4, 0.0, 0.2, 1]
                }}
                className="bg-amber-100 border-3 border-amber-300 rounded-xl p-8 text-center shadow-sm overflow-hidden"
                role="status"
                aria-live="polite"
                aria-label="Processing voice input"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="flex items-center justify-center gap-4 mb-4"
                >
                  <motion.div 
                    className="p-2 bg-amber-200 rounded-lg border-2 border-amber-300"
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
                    }}
                  >
                    <Loader2 className="h-10 w-10 text-amber-800" />
                  </motion.div>
                  <motion.span 
                    className="text-2xl font-bold text-amber-900"
                    animate={{ 
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    Processing Voice Input...
                  </motion.span>
                </motion.div>
                <motion.p 
                  className="text-amber-800 text-lg font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  Converting voice command to Beckn Protocol JSON
                </motion.p>
                
                {/* Enhanced Processing Animation */}
                <motion.div 
                  className="mt-6 flex justify-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <div className="flex space-x-3">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-4 h-4 bg-amber-600 rounded-full border border-amber-700"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                          y: [0, -10, 0]
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
                
                {/* Progress bar animation */}
                <motion.div 
                  className="mt-4 w-full bg-amber-200 rounded-full h-2 overflow-hidden"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <motion.div
                    className="h-full bg-amber-600 rounded-full"
                    animate={{ 
                      x: ["-100%", "100%"]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{ width: "30%" }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Instructions */}
          <div className="bg-slate-100 border-2 border-slate-300 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-3 text-lg">How it works:</h4>
            <ol className="text-slate-800 space-y-2 text-base font-medium">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span>Select a voice scenario from the dropdown above</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span>The system will translate the voice text to Beckn Protocol JSON</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span>Review the generated catalog in the Visual Verifier</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span>Broadcast your listing to the ONDC network</span>
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default VoiceInjector;