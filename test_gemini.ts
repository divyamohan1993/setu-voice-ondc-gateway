
import dotenv from 'dotenv';
dotenv.config();

import { translateVoiceToJsonWithFallback } from './lib/translation-agent';

async function test() {
    console.log("Testing Gemini 3 Flash Preview...");
    const text = "500kg onions from Nasik";

    try {
        const result = await translateVoiceToJsonWithFallback(text);
        console.log("Result:", JSON.stringify(result, null, 2));

        if (result.descriptor.name.toLowerCase().includes("onion")) {
            console.log("SUCCESS: Gemini returned a valid result!");
        } else {
            console.log("FAILURE: Result does not match expected output.");
        }
    } catch (error) {
        console.error("ERROR:", error);
    }
}

test();
