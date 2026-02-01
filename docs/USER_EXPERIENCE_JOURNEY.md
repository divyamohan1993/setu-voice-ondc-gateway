# Setu UX: Designing for the Invisible User

## 1. Design Philosophy: "Radical Simplicity"

The user of Setu is likely a farmer named Ramesh.
- He is 45 years old.
- He owns a smartphone but uses it primarily for YouTube and WhatsApp.
- He cannot read English. He struggles with written Hindi.
- **He is an expert farmer, but a digital novice.**

Our design philosophy is simple: **The Interface Must Disappear.**

If Ramesh has to "learn" how to use Setu, we have failed. The application must behave like a human conversation, not a computer form.

---

## 2. The "One Button" Interface

Inspired by the simplicity of the original iPhone home button, the entire Setu interface revolves around a single, massive interaction point.

### The Idle State
- **No Menus. No Nav Bars. No Settings.**
- The screen is dominated by a single, pulsating microphone button.
- **Why?** It creates a clear "Call to Action". There is no ambiguity about what to do next. "Press to Speak" is the universal language.

### Visual Hierarchy
- **Typography is Secondary**: We treat text as a secondary confirmation mechanism.
- **Iconography is Primary**:
    - A Tomato is represented by a high-fidelity image of a Tomato, not the text "Tomato".
    - A Price is represented by a Coin/Rupee stack icon.
    - Logistics is represented by a Truck icon.
- **Color Theory**:
    - **Green**: Used for Action, Success, and Growth (Farming).
    - **Earth Tones**: Used for backgrounds to feel grounded and familiar.
    - **High Contrast**: Essential for readability in bright sunlight (field conditions).

---

## 3. The Voice Interaction Model

We moved beyond simple "Command & Control" to "Natural Language Understanding".

### The "Sloppy Input" Problem
Ramesh will not speak like a computer programmer.
- **Computer Expects**: `create_catalog(item="Onion", qty=50, price=20)`
- **Ramesh Says**: "Arre bhai, Nasik wala pyaaz hai mere paas, 50 kilo pada hai, 20 rupaye mein le lo."

### The AI Solution (Google Gemini)
Our AI agent acts as a "Smart Interpreter":
1.  **Normalization**: Converts "bhai", "pada hai" (filler words) -> Ignored.
2.  **Entity Extraction**:
    - "Nasik wala" -> **Location**: Nasik
    - "Pyaaz" -> **Commodity**: Onion (Red)
    - "50 kilo" -> **Qty**: 50kg
    - "20 rupaye" -> **Price**: ₹20
3.  **Context Injection**: If Ramesh forgets to say the quality, the system (knowing it's Nasik Onion) might default to "Grade A" or ask a gentle follow-up.

---

## 4. Feedback Loops & Trust Building

For a user who has been exploited by middlemen, **Transparency is Trust**.

### 1. Visual Verification Card
Before sending anything to the internet, we show Ramesh a "Card".
- It shows the **Picture** of what the AI understood.
- It highlights the **Price** in big bold numbers.
- **Why?** This gives Ramesh control. If the AI heard "20" but he meant "200", he can see it immediately.

### 2. The Broadcast Animation
- We don't use a spinner. We use a "Ripple" effect that expands outward.
- **Metaphor**: Casting a net. It visually implies reaching out to the world.
- **Timing**: The 12-25 second delay is filled with reassuring audio feedback ("Finding buyers...", "Negotiating prices...") to keep anxiety low.

### 3. The Success State (The Bid)
- We assume the user cannot calculate percentages.
- We show the **Final Offer** clearly.
- We show the **Brand Logo** of the buyer (e.g., Reliance, BigBasket) because logos are recognizable even to the illiterate.

---

## 5. Accessibility Implementation

- **ARIA Labels**: Every element has strict ARIA labels for screen readers.
- **Touch Targets**: All interactive elements are minimum **48x48dp** (Google Material Design standard), often larger (120px for the main mic).
- **Contrast Ratios**: Strictly WCAG AA compliant.
- **Audio Redundancy**: Every critical state change (Success, Error, Listening) can be accompanied by an audio cue or TTS (Text-to-Speech) feedback.

---

## 6. The User Journey Map

1.  **Intent**: Ramesh has crop to sell.
2.  **Action**: Opens Setu. Taps Button. Speaks.
3.  **Processing**: "Listening... Thinking..." (Visual Feedback).
4.  **Verification**: "Is this right?" (Visual Card).
5.  **Commitment**: Taps "Thumbprint" (Broadcast).
6.  **Reward**: "Bid Received: ₹1,200 from BigBasket".

This linear, no-branching path reduces cognitive load to near zero.
