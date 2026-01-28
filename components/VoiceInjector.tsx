"use client";

import { useState } from "react";
import { Mic, Tractor, Apple, Loader2, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VoiceInjectorProps {
    onScenarioSelect: (scenario: string) => void;
    isProcessing: boolean;
}

export function VoiceInjector({ onScenarioSelect, isProcessing }: VoiceInjectorProps) {
    const [selectedScenario, setSelectedScenario] = useState<string>("");

    const scenarios = [
        {
            id: "onion",
            label: "Nasik Onions",
            icon: Tractor,
            text: "I have 500kg of red onions from Nasik (pyaaz). Quality is Grade A. Expected price is 25 rupees per kg. Can deliver by tomorrow."
        },
        {
            id: "mango",
            label: "Alphonso Mangoes",
            icon: Apple,
            text: "Fresh Alphonso mangoes from Ratnagiri available. 200 dozen boxes ready. Premium export quality. 800 rupees per dozen."
        }
    ];

    const handleSelect = (value: string) => {
        const scenario = scenarios.find((s) => s.id === value);
        if (scenario) {
            setSelectedScenario(scenario.text);
            onScenarioSelect(scenario.text);
        }
    };

    return (
        <Card className="w-full max-w-md border-2 border-primary/10 shadow-lg" data-testid="voice-injector">
            <CardHeader className="bg-muted/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                    <Mic className="h-6 w-6" />
                    Voice Input Simulator
                </CardTitle>
                <CardDescription>
                    Select a voice scenario to simulate farmer input
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                    <Select
                        disabled={isProcessing}
                        onValueChange={handleSelect}
                    >
                        <SelectTrigger className="w-full min-h-[44px] bg-background">
                            <SelectValue placeholder="Select a voice scenario" />
                        </SelectTrigger>
                        <SelectContent>
                            {scenarios.map((scenario) => (
                                <SelectItem key={scenario.id} value={scenario.id} className="py-3">
                                    <div className="flex items-center gap-3">
                                        <scenario.icon className="h-5 w-5 text-muted-foreground" />
                                        <div className="flex flex-col">
                                            <span className="font-medium">{scenario.label}</span>
                                        </div>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {isProcessing && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                            <div className="relative bg-background p-4 rounded-full border-2 border-primary shadow-sm">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-medium text-foreground">Processing Voice Input</p>
                            <p className="text-xs text-muted-foreground">Converting voice command to Beckn Protocol JSON...</p>
                        </div>
                    </div>
                )}

                {selectedScenario && !isProcessing && (
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-2 animate-in slide-in-from-top-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                            <Check className="h-4 w-4" />
                            Selected Voice Input:
                        </h4>
                        <div className="text-sm text-muted-foreground italic pl-6 border-l-2 border-primary/20">
                            &quot;{selectedScenario}&quot;
                        </div>
                    </div>
                )}

                <div className="rounded-lg bg-blue-50/50 dark:bg-blue-950/20 p-4 text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                        How it works:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 opacity-90 ml-1">
                        <li>Select a pre-recorded voice scenario</li>
                        <li>System processes the natural language</li>
                        <li>Converts to structured ONDC catalog</li>
                    </ol>
                </div>
            </CardContent>
        </Card>
    );
}
