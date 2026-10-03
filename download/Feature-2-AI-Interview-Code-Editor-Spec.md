# InterviewAI — Feature 2: AI Interview with In-App Code Editor

**Version:** 1.0 · **Date:** 2026-10-04
**Status:** Design spec — ready to implement
**Scope:** Prep Mode + Candidate (Hiring) Mode · Frontend-first with Gemini API integration

---

## Table of Contents

1. [Overview](#1-overview)
2. [Core Problems Solved](#2-core-problems-solved)
3. [Adaptive Timing System](#3-adaptive-timing-system)
4. [Dynamic Question Generation](#4-dynamic-question-generation)
5. [UI Layout: 70/30 Split](#5-ui-layout-7030-split)
6. [Candidate Interaction Paths](#6-candidate-interaction-paths)
   - Path 1: Code It (coding questions)
   - Path 2: Skip (any question)
   - Path 3: Explain Logic (coding questions — can't code, explain verbally)
   - Path 4: Whiteboard (system design / math / puzzle — draw + explain)
7. [Hint System](#7-hint-system)
8. [Skip + Explain Logic](#8-skip--explain-logic)
9. [End Interview States](#9-end-interview-states)
10. [Webcam PiP (Feature 1)](#10-webcam-pip-feature-1)
11. [Campaign Creation Updates](#11-campaign-creation-updates)
12. [AI Model Architecture](#12-ai-model-architecture)
13. [Code Execution Pipeline](#13-code-execution-pipeline)
14. [Report Integration](#14-report-integration)
15. [Prep vs Candidate Mode Differences](#15-prep-vs-candidate-mode-differences)
16. [Implementation Phases](#16-implementation-phases)
17. [File Structure](#17-file-structure)

---

## 1. Overview

Transform the AI Interview from a **fixed-length chat-only experience** into a **dynamic, adaptive technical interview** where the AI can ask coding questions, the candidate solves them in an in-app code editor, and the AI evaluates the code in real-time — mimicking a real technical interview.

### What changes

| Before | After |
|---|---|
| Fixed 20/30 min timer | AI-paced adaptive timer (soft + hard cap) |
| Fixed 8-12 questions | Dynamic question tree (AI selects based on performance) |
| Chat-only (no coding) | 70/30 split: code editor + AI panel |
| "End Early" always available | 3-state End button (locked → unlocked → emergency) |
| No hints | Tiered hint system (3 max, -10% each) |
| No skip | Skip + Explain-Logic paths |
| Fixed question bank | AI-generated questions (Gemini) + question bank hybrid |
| Mock code evaluation | Real Gemini code evaluation + feedback |
| No webcam preview | Movable PiP webcam on all proctored screens |

---

## 2. Core Problems Solved

### Problem 1: Fixed timer is unrealistic
Real interviews are paced by the interviewer, not a countdown. The AI should extend time for candidates making progress and move on for stuck candidates.

### Problem 2: Fixed question count is artificial
A candidate who aces 2 Easy problems shouldn't be asked a 3rd Easy — they should get a Medium. A candidate who struggles shouldn't face all 12 questions — the AI should adapt.

### Problem 3: No coding during interview
Technical interviews require the candidate to write code. The app has a code editor (Coding Arena) but it's not integrated into the interview flow.

### Problem 4: "End Early" can hurt score
Candidates might accidentally end the interview early, losing points for unanswered questions. The End button should be gated.

### Problem 5: No hint system
Real interviewers give hints. The AI should too — but with a score penalty so it's not abusable.

### Problem 6: No "explain logic" path
In real interviews, candidates who can't code a solution can explain their approach verbally. The app should support this.

---

## 3. Adaptive Timing System

### 3-Tier Timer Architecture

```
Layer 1: Recommended Time (guidance, shown to candidate)
   → Easy coding: 5 min
   → Medium coding: 8 min
   → Hard coding: 12 min
   → Behavioral: 3 min
   → System design: 10 min

Layer 2: Soft Timer (AI-driven, adaptive)
   → At recommended time: AI says "Take your time, but let's wrap up soon."
   → At +2 min: AI says "We should move to the next question soon."
   → At +5 min: AI says "Let's move on — I want to cover remaining questions."
   → AI EXTENDS if candidate is making progress (code growing, typing active)
   → AI MOVES ON if candidate is stuck (idle, exhausted hints, said "I don't know")

Layer 3: Hard Cap (safety net)
   → Max 15 min per question (regardless of type)
   → At 15 min: AI says "I need to move us forward. Let's go to the next question."
   → Prevents a single question from eating the entire interview
```

### AI Decision Signals (evaluated every 30s)

| Signal | "Extend" indicator | "Move on" indicator |
|---|---|---|
| Code length | Growing (writing code) | Stagnant (not typing) |
| Last keystroke | <30 seconds ago | >2 minutes ago |
| Hints used | 0-1 (still trying) | 3 (exhausted) |
| Test runs | Attempted (iterating) | 0 (gave up) |
| Transcript sentiment | "I think I got it" | "I don't know" |
| Question difficulty | Hard (needs more time) | Easy (should be done) |

### Timer UI

```
┌──────────────────────────────────────────────────────┐
│  AI Interview          ⏱ Elapsed: 12:34 / ~45 min    │
│                                                      │
│  Question 3 of ~8 (Technical)                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━     │
│  ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░  (progress)  │
│                                                      │
│  Current Q: "Reverse a linked list" (Easy)           │
│  Recommended: 5 min · Elapsed: 4:30 · Soft limit: 7  │
└──────────────────────────────────────────────────────┘
```

- **Elapsed time** (count-up, not countdown)
- **Estimated total** (based on interview type, adjusts as AI skips/adds questions)
- **Progress bar** (questions completed / estimated total)
- **Per-question timer** (recommended + elapsed + soft limit)
- **No hard cutoff** unless 15 min cap hit

---

## 4. Dynamic Question Generation

### Question Tree (not a fixed list)

The AI builds a question tree and navigates it dynamically based on candidate performance:

```
                    [Start]
                       │
              ┌────────┴────────┐
              │  Behavioral Q1  │
              └────────┬────────┘
                       │
              ┌────────┴────────┐
              │ AI evaluates:    │
              │ STAR structure?  │
              │ Concrete example?│
              └──────┬─────┬─────┘
                     │     │
              ┌──────┘     └──────┐
              │Weak                │Strong
              ▼                    ▼
     ┌────────────────┐  ┌────────────────┐
     │ Follow-up Q2   │  │ Skip follow-up │
     │ (probe deeper) │  │ Move to coding │
     └───────┬────────┘  └───────┬────────┘
             │                   │
             ▼                   ▼
     ┌────────────────┐  ┌────────────────┐
     │  Coding Q1     │  │  Coding Q1     │
     │  (Easy)        │  │  (Easy)        │
     └───────┬────────┘  └───────┬────────┘
             │                   │
     ┌───────┴────────┐         │
     │ AI evaluates:   │         │
     │ Solved? Time?   │         │
     │ Hints used?     │         │
     └──┬──────┬───────┘         │
        │      │                 │
     Solved  Stuck               │
        ▼      ▼                 ▼
   ┌────────┐ ┌──────────┐  ┌────────┐
   │Coding  │ │Explain   │  │Coding  │
   │Q2 Med │ │Logic or  │  │Q2 Med │
   └────────┘ │Skip?     │  └────────┘
              └──────────┘
                    │
              ┌─────┴──────┐
              │ Time check │
              │ <15 min?   │
              └──┬─────┬───┘
                 │     │
              Yes     No
                 ▼     ▼
           ┌────────┐ ┌────────┐
           │ More Q │ │ Wrap   │
           │ (SD)   │ │ up     │
           └────────┘ └────────┘
```

### Adaptive Difficulty Rules

| Candidate performance | Next question |
|---|---|
| Solved Easy quickly (0 hints, <3 min) | Jump to Medium |
| Solved Easy slowly (1-2 hints, 4-5 min) | Another Easy (different topic) |
| Solved Medium quickly (0-1 hints) | Try Hard |
| Struggled on Easy (3 hints, partial) | Another Easy or Explain-Logic |
| Failed Easy (0 tests pass) | Behavioral or System Design (pivot away) |
| Aced 2 coding problems | Skip remaining coding, go to System Design |

### Adaptive Question Count

| Scenario | Questions asked |
|---|---|
| Candidate aces everything | 5-6 (skip easy follow-ups, cover all categories) |
| Candidate struggles | 4-5 (fewer questions, more follow-ups, don't overwhelm) |
| Average candidate | 7-9 (full mix) |
| Time running short | 4-5 (skip remaining, cover must-have categories) |

### Question Source

**Phase 1 (mock):** Pull from existing `CODING_PROBLEMS` bank (24 problems)
**Phase 2 (AI-generated):** Call Gemini to generate fresh problems on the fly
**Phase 3 (hybrid):** 70% from bank, 30% AI-generated (prevents memorization)

```js
// Gemini generates a coding question
async function generateQuestion(type, difficulty, topic, role) {
  const prompt = `
    Generate a ${difficulty} ${type} interview question about ${topic}
    for a ${role} role.
    
    Return JSON:
    {
      "question_text": "the verbal question to ask",
      "problem": {
        "title": "Problem title",
        "description": "Problem statement",
        "difficulty": "${difficulty}",
        "starterCode": { "Python": "...", "JavaScript": "..." },
        "testCases": [{ "input": "...", "expected": "...", "hidden": false }]
      },
      "follow_ups": ["potential follow-up 1", "potential follow-up 2"]
    }
  `;
  // Call Gemini API
}
```

---

## 5. UI Layout: 70/30 Split

### During Coding Questions

```
┌──────────────────────────────────────────┬──────────────────────┐
│                                          │  🤖 AI Avatar        │
│  Problem: Reverse Linked List (Easy)     │  (animated, thinking)│
│  "Given the head of a singly linked      │                      │
│   list, reverse it and return..."        │  ┌────────────────┐  │
│                                          │  │ 📹 Webcam PiP  │  │
│  Examples:                               │  │ (movable)      │  │
│  Input: 1→2→3   Output: 3→2→1           │  │ ● REC          │  │
│                                          │  └────────────────┘  │
│  Constraints:                            │                      │
│  - Number of nodes: [0, 5000]            │  Live Transcript:     │
│                                          │  ┌────────────────┐  │
│  ┌──────────────────────────────────────┐│  │ 🤖 "Let's try a │  │
│  │ 1 │ def reverse(head):              ││  │    coding..."  │  │
│  │ 2 │     # your code here            ││  │ 👤 "I'll use..."│  │
│  │ 3 │     pass                        ││  │ 🤖 "Good choice"│  │
│  │ 4 │                                 ││  │ 🤖 "Take your   │  │
│  │ 5 │                                 ││  │    time."      │  │
│  └──────────────────────────────────────┘│  └────────────────┘  │
│                                          │                      │
│  [Python ▼] [Run Tests] [Submit to AI]  │  [🎤 Mic Toggle]     │
│  [💡 Hint] [Skip] [Explain Logic]       │                      │
│                                          │  ┌────────────────┐  │
│  Test Results: ✅ 2/3 passed             │  │ End Interview  │  │
│  Runtime: 8ms                            │  │ 🔒 (5 of ~8    │  │
│                                          │  │    remaining)  │  │
│  ⏱ Question: 4:30 / 5 min recommended   │  └────────────────┘  │
│                                          │                      │
└──────────────────────────────────────────┴──────────────────────┘
              70% (code + problem)              30% (AI + chat + controls)
```

### During Non-Coding Questions (Behavioral / HR / System Design / Math / Puzzles)

Non-coding questions have **2 modes** depending on the question type:

**Mode A: Chat-only (behavioral / HR questions)**
No visual canvas needed — candidate speaks or types their answer.

**Mode B: Chat + Whiteboard (system design / math / puzzles / architecture)**
A whiteboard canvas appears so the candidate can draw diagrams, write
equations, sketch architecture, or work through a puzzle visually. The AI
evaluates BOTH the verbal explanation AND the whiteboard content.

```
┌──────────────────────────────────────────┬──────────────────────┐
│                                          │  🤖 AI Avatar        │
│  🤖 AI: "Design a URL shortener.        │  (animated)          │
│        Sketch the architecture."         │                      │
│                                          │  ┌────────────────┐  │
│  ┌──────────────────────────────────────┐│  │ 📹 Webcam PiP  │  │
│  │  ✏️ Whiteboard                       ││  │ (movable)      │  │
│  │                                      ││  └────────────────┘  │
│  │   ┌───┐    ┌───┐    ┌───┐           ││                      │
│  │   │ C │───→│ W │───→│DB │           ││  Live Transcript:     │
│  │   └───┘    └───┘    └───┘           ││  🤖 "Design a URL..."│
│  │     │        │                      ││  👤 "I'll use a..."  │
│  │     ▼        ▼                      ││  🤖 "Good, what..."  │
│  │   ┌───┐    ┌─────┐                  ││                      │
│  │   │ L │    │ CDN │                  ││                      │
│  │   └───┘    └─────┘                  ││                      │
│  │                                      ││                      │
│  │  "user → cache → worker → DB"       ││                      │
│  │  "CDN for hot links"                ││                      │
│  │                                      ││                      │
│  └──────────────────────────────────────┘│  [🎤 Mic Toggle]     │
│                                          │                      │
│  [✏️ Pen] [🔲 Shapes] [📝 Text] [🧽 Erase]│  [End Interview 🔒] │
│  [↶ Undo] [↷ Redo] [🧹 Clear] [Submit]   │                      │
│                                          │                      │
│  ⏱ Question: 4:30 / 10 min recommended  │                      │
│                                          │                      │
└──────────────────────────────────────────┴──────────────────────┘
        70% (whiteboard + tools)         30% (AI + chat + controls)
```

**When the whiteboard appears:**

| Question Type | Whiteboard? | Why |
|---|---|---|
| Behavioral ("Tell me about a conflict") | ❌ No | Verbal answer only |
| HR ("Why do you want this role?") | ❌ No | Verbal answer only |
| System Design ("Design a URL shortener") | ✅ Yes | Architecture diagrams |
| Math ("If 5 machines process 1000 jobs...") | ✅ Yes | Equations + calculations |
| Puzzle ("You have 8 balls, 1 is heavier...") | ✅ Yes | Visual problem-solving |
| Estimation ("How many golf balls fit in a bus?") | ✅ Yes | Breakdown + math |
| Architecture ("How would you scale Twitter?") | ✅ Yes | System diagram |
| Follow-up ("Add caching to your design") | ✅ Yes | Inherits parent's whiteboard |

**Whiteboard tools:**
- **Pen** — freehand drawing (mouse/touch/stylus)
- **Shapes** — rectangle, circle, arrow, line (for clean architecture diagrams)
- **Text** — type labels/annotations on the canvas
- **Eraser** — remove specific strokes
- **Undo / Redo** — history navigation
- **Clear** — wipe the canvas
- **Submit** — send snapshot to AI for evaluation

**AI evaluation of whiteboard:**
When the candidate clicks "Submit", the whiteboard is:
1. Captured as a PNG snapshot (canvas → `toDataURL()`)
2. Sent to Gemini as an image (multimodal vision API)
3. AI evaluates the visual content:
   - System design: Is the architecture correct? Are components labeled? Are data flows shown? Are edge cases considered (failure, scaling)?
   - Math: Is the approach correct? Are calculations right? Is the reasoning clear?
   - Puzzle: Is the visual representation accurate? Is the solution logical?
4. AI gives feedback: "Your architecture looks solid — cache + worker + DB is the right pattern. However, you're missing a load balancer in front of the workers, and you haven't shown how the CDN invalidates stale links."
5. Score is recorded combining verbal explanation + whiteboard quality

### Right Panel (30%) — Persistent Elements

The 30% right panel is **always visible** during the interview. It contains:

1. **AI Avatar** (top) — animated circle with "thinking" indicator
2. **Webcam PiP** (movable, defaults inside this panel) — live webcam + REC indicator
3. **Live Transcript** (scrollable) — AI + user chat bubbles with timestamps
4. **Mic Toggle** — on/off, with waveform indicator when speaking
5. **End Interview Button** — 3-state (locked / unlocked / emergency)

### Left Area (70%) — Context-Dependent

The 70% left area changes based on question type:

| Question Type | Left Area Content |
|---|---|
| Coding | Problem statement + code editor + run/submit/hint/skip/explain buttons + test results |
| Behavioral / HR | Expanded transcript + mic input (no code editor, no whiteboard) |
| System Design / Math / Puzzle | Whiteboard canvas + drawing tools + submit button |
| Follow-up | Inherits parent question's layout (code editor OR whiteboard) |

---

## 6. Candidate Interaction Paths

### Path 1: Code It (normal flow)

```
Step 1: AI asks coding question
   → "Let's try a coding problem. Reverse a linked list."
   → Editor slides in (70% left), AI panel stays (30% right)

Step 2: Candidate writes code
   → Types in editor (line numbers, syntax highlighting)
   → Can switch language (Python ↔ JavaScript)
   → Auto-save every 30s

Step 3: Candidate clicks "Run Tests"
   → Code sent to Piston API (or mock)
   → Results: ✅ 2/3 passed, ❌ 1 hidden test failed
   → No AI evaluation yet — just for candidate to check

Step 4: Candidate clicks "Submit to AI"
   → Code + test results sent to Gemini for evaluation
   → Spinner: "AI is reviewing your code..." (2-4s)
   → AI evaluates: correctness, complexity, quality, edge cases
   → AI gives feedback as a new chat bubble:
     "Your solution works and is O(n) time. Good use of two
      pointers. However, you're not handling the edge case of
      an empty list. Can you fix that?"
   → Editor stays open for follow-up

Step 5: Follow-up (optional)
   → AI: "Now can you do it recursively?"
   → Editor clears (or shows new starter code)
   → Candidate codes again → submit → feedback

Step 6: AI moves to next question
   → "Great. Let's switch gears. Tell me about a time..."
   → Editor slides out
   → Chat returns to full width
```

### Path 2: Skip

```
Candidate clicks "Skip Question"
   → Confirmation dialog:
     "Skip this question? You'll get 0 for this problem.
      You can't come back to it."
   → [Cancel] [Skip - Confirm]
   → AI says: "No problem, let's move to the next question."
   → Score for this question: 0, marked "Skipped" in report
   → Interview continues
```

### Path 3: Explain Logic

```
Candidate clicks "Explain Logic"
   → Editor is replaced with logic explanation panel:
   
   ┌──────────────────────────────────────────────────┐
   │  Logic Explanation Mode                          │
   │                                                  │
   │  🤖 AI: "Go ahead, explain your approach.       │
   │        I'm listening."                          │
   │                                                  │
   │  ┌────────────────────────────────────────────┐  │
   │  │ 🎤 (speak or type your explanation)        │  │
   │  │                                            │  │
   │  │  "I'd use two pointers. Start with         │  │
   │  │   prev=null and curr=head. For each        │  │
   │  │   node, save curr.next as temp, point      │  │
   │  │   curr.next to prev, then move prev and    │  │
   │  │   curr forward. Return prev at end."       │  │
   │  └────────────────────────────────────────────┘  │
   │                                                  │
   │  [🎤 Mic] [Submit Explanation]                   │
   └──────────────────────────────────────────────────┘

   → AI evaluates the logic (not the code):
     - Is the approach correct?
     - Is the complexity analysis right?
     - Are edge cases mentioned?
     - Did they identify the right data structure?
   → AI feedback: "Your approach is correct — two pointers
      is O(n) time, O(1) space. Good job mentioning the edge
      case. However, you didn't mention how you'd handle a
      circular list."
   → Score: recorded as "Logic Only" — weighted lower
      (max 60% of full score)
```

### Path 4: Whiteboard (system design / math / puzzle questions)

For non-coding questions that benefit from visual problem-solving, the
candidate gets a whiteboard canvas instead of a code editor.

```
Step 1: AI asks a system design / math / puzzle question
   → "Design a URL shortener. Sketch the architecture."
   → Whiteboard canvas appears (70% left), AI panel stays (30% right)

Step 2: Candidate draws + explains verbally
   → Uses pen/shapes/text tools to sketch architecture
   → Speaks explanation simultaneously (mic is live)
   → Transcript captures both the AI question + verbal explanation

Step 3: Candidate clicks "Submit"
   → Whiteboard captured as PNG snapshot (canvas.toDataURL())
   → Snapshot + verbal transcript sent to Gemini Vision API
   → AI evaluates BOTH:
     - Visual content (architecture correctness, component labeling, data flow)
     - Verbal explanation (reasoning, trade-offs, edge cases)
   → Spinner: "AI is reviewing your design..." (3-5s)

Step 4: AI gives feedback
   → "Your architecture is solid — cache + worker + DB is the right pattern.
      However, you're missing a load balancer, and you haven't shown how
      the CDN invalidates stale links. Can you add those?"
   → Feedback appears as chat bubble in the right panel

Step 5: Follow-up (optional)
   → AI: "Now add a rate limiter to your design."
   → Whiteboard persists (candidate can modify the existing drawing)
   → Candidate adds the rate limiter → submit → feedback

Step 6: AI moves to next question
   → "Great. Let's switch to a coding problem."
   → Whiteboard slides out, code editor slides in (or chat-only if behavioral)
```

**Whiteboard vs Code Editor vs Chat — when each appears:**

| Question Type | Code Editor | Whiteboard | Chat Only |
|---|---|---|---|
| Coding (DSA) | ✅ | ❌ | ❌ |
| Behavioral | ❌ | ❌ | ✅ |
| HR | ❌ | ❌ | ✅ |
| System Design | ❌ | ✅ | ❌ |
| Math | ❌ | ✅ | ❌ |
| Puzzle | ❌ | ✅ | ❌ |
| Estimation | ❌ | ✅ | ❌ |
| Architecture | ❌ | ✅ | ❌ |

**Whiteboard AI evaluation criteria (by question type):**

| Question Type | What AI evaluates |
|---|---|
| System Design | Architecture correctness, component labeling, data flow direction, failure handling, scaling strategy, trade-off awareness |
| Math | Approach correctness, calculation accuracy, step-by-step reasoning, final answer |
| Puzzle | Visual representation accuracy, logical deduction, solution efficiency |
| Estimation | Breakdown structure, assumption reasonableness, math accuracy, final estimate |
| Architecture | Component completeness, connection correctness, redundancy, bottlenecks identified |

---

## 7. Hint System

### Tiered Hints

| Hint # | Content Type | Example | Score Penalty |
|---|---|---|---|
| Hint 1 | Gentle nudge | "Think about what pointers you need to track." | -10% |
| Hint 2 | Bigger nudge | "A two-pointer approach would work well here." | -10% (total -20%) |
| Hint 3 | Near-solution | "Use prev and curr pointers. Don't forget to save curr.next before reassigning." | -10% (total -30%) |
| Hint 4 | Not available | (Would be cheating) | N/A |

### Hint UI

```
┌─────────────────────────────────────────────────────┐
│  Problem: Reverse a Linked List                     │
│                                                     │
│  [💡 Ask AI for a Hint]  ← button in toolbar        │
│                                                     │
│  After clicking:                                    │
│  ┌───────────────────────────────────────────────┐  │
│  │ 🤖 Hint 1 of 3:                               │  │
│  │ "Think about what pointers you need to track  │  │
│  │  as you traverse the list."                   │  │
│  │                                               │  │
│  │  Hints used: 1/3  (score penalty: -10%)       │  │
│  │  [Ask for another hint]  [Got it, continue]   │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Rules

- Max 3 hints per question
- Each hint reduces the max possible score by 10%
- Hints are logged in the report: "Candidate used 2 hints on this problem"
- If candidate uses all 3 hints and still can't solve → AI suggests: "Would you like to explain your logic instead, or skip?"

---

## 8. Skip + Explain Logic

### Skip

- Candidate clicks "Skip Question"
- Confirmation: "Skip this question? You'll get 0 for this problem. You can't come back to it."
- AI says: "No problem, let's move to the next question."
- Score: 0, marked "Skipped" in report
- Interview continues

### Explain Logic

- Candidate clicks "Explain Logic"
- Code editor is replaced with a text/mic explanation panel
- Candidate types or speaks their approach
- AI evaluates the logic (not the code):
  - Is the approach correct?
  - Is the complexity analysis right?
  - Are edge cases mentioned?
  - Did they identify the right data structure?
- Score: "Logic Only" — weighted at max 60% of full score

### Report shows

```
Problem 1: Reverse Linked List
├── Mode: Logic Explanation (not coded)
├── AI score: 52/100 (logic only, weighted at 60%)
├── Approach: Two-pointer (correct)
├── Complexity identified: O(n) time, O(1) space ✓
├── Edge cases: empty list ✓, single node ✓, circular list ✗
└── AI feedback: "Solid approach. Practice coding it up."
```

---

## 9. End Interview States

### State 1: Interview In Progress (Button Locked)

```
┌──────────────────────────────────────────────────┐
│  [End Interview 🔒]  ← greyed out, not clickable │
│                                                  │
│  Tooltip on hover:                               │
│  "The interview isn't complete yet (5 of ~8      │
│  questions remaining). You can skip individual   │
│  questions instead of ending the whole session.  │
│  Long-press for emergency exit."                 │
└──────────────────────────────────────────────────┘
```

- Candidate CANNOT end the interview until AI has asked all questions
- Prevents accidental score loss
- Candidate can still skip individual questions

### State 2: Interview Complete (Button Unlocked)

```
┌──────────────────────────────────────────────────┐
│  🤖 AI: "That's all the questions I have for    │
│        you today. Great job! You can end the     │
│        session now."                             │
│                                                  │
│  [✓ End Interview]  ← active, green              │
└──────────────────────────────────────────────────┘
```

- Only after AI finishes all questions does the button activate
- AI explicitly says "you can end now" in the transcript
- Clicking it goes to processing → report

### State 3: Emergency Exit (Long-Press)

If candidate MUST leave early (emergency, internet issue, etc.):

```
┌──────────────────────────────────────────────────┐
│  ⚠ End Interview Early?                          │
│                                                  │
│  You have 3 unanswered questions. Ending now     │
│  will submit your partial responses. Your score  │
│  will be based on 5 of ~8 questions.             │
│                                                  │
│  Unanswered questions will be marked as          │
│  "Not Attempted" (score: 0) in the report.       │
│                                                  │
│  Reason (required):                              │
│  ○ Finished (I've said enough)                   │
│  ○ Too long                                      │
│  ○ Technical issue                               │
│  ○ Emergency                                     │
│                                                  │
│  [Cancel]                    [End Early - Confirm]│
└──────────────────────────────────────────────────┘
```

- **Long-press** the locked "End Interview" button for 2 seconds → opens emergency dialog
- Reason is required (captures why they left)
- Clear warning about score impact
- Score: answered questions scored normally, unanswered = 0 ("Not Attempted")

### Score Impact Summary

| Scenario | Unanswered Questions | Score |
|---|---|---|
| Normal completion (AI finishes all) | 0 | Full score |
| Skipped questions | Marked "Skipped" (0) | Reduced |
| Emergency exit | Marked "Not Attempted" (0) | Reduced + flagged |

---

## 10. Webcam PiP (Feature 1)

### Component: `<WebcamPiP />`

A draggable, resizable, minimizable webcam preview that floats over any proctored screen.

### Features

- **Draggable** — mouse/touch to move anywhere on screen (track `x/y` position state)
- **Resizable** — 3 sizes: small (160×120), medium (240×180), large (320×240)
- **Minimizable** — collapse to a tiny camera icon
- **Always on top** — `position: fixed; z-index: 9999`
- **Live feed** — uses `getUserMedia()` for real webcam, placeholder if camera off
- **REC indicator** — pulsing red dot
- **Smart default** — bottom-right corner initially

### When it shows

| Screen | Shows PiP? | Condition |
|---|---|---|
| Landing / Auth | ❌ No | — |
| Dashboard / Resume / Profile | ❌ No | — |
| System Check | ✅ Yes | After camera permission granted |
| Aptitude Test (proctored) | ✅ Yes | If camera enabled |
| Coding Test (proctored) | ✅ Yes | If camera enabled |
| AI Interview (live phase) | ✅ Yes | Always (camera mandatory) |
| Interview (processing/done) | ❌ No | — |
| Result screens | ❌ No | — |

### Implementation

```tsx
// src/components/shared/webcam-pip.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, Minimize2, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function WebcamPiP({ enabled }: { enabled: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState<"small" | "medium" | "large">("small");
  const [minimized, setMinimized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Start webcam when enabled
  useEffect(() => {
    if (!enabled) return;
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => {
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => {}); // placeholder if denied
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [enabled]);

  // Drag handler
  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    // ... track mouse move + up
  };

  if (!enabled) return null;

  const sizes = {
    small: "w-40 h-30",   // 160×120
    medium: "w-60 h-45",  // 240×180
    large: "w-80 h-60",   // 320×240
  };

  return (
    <div
      className={cn(
        "fixed z-[9999] overflow-hidden rounded-lg border border-black/20 bg-black shadow-2xl",
        minimized ? "w-12 h-12" : sizes[size],
      )}
      style={{ left: position.x, top: position.y }}
      onMouseDown={onMouseDown}
    >
      {minimized ? (
        <button onClick={() => setMinimized(false)} className="grid h-full w-full place-items-center">
          <Camera className="h-5 w-5 text-white" />
        </button>
      ) : (
        <>
          <video ref={videoRef} autoPlay muted className="h-full w-full object-cover" />
          {/* REC indicator */}
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span className="text-[9px] font-bold text-white">REC</span>
          </div>
          {/* Controls */}
          <div className="absolute right-1 top-1 flex gap-1">
            <button onClick={() => setSize(s === "small" ? "medium" : s === "medium" ? "large" : "small")}>
              <Maximize2 className="h-3 w-3 text-white" />
            </button>
            <button onClick={() => setMinimized(true)}>
              <Minimize2 className="h-3 w-3 text-white" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

### Mount globally in `page.tsx`

```tsx
// page.tsx
const navigationLocked = useNav((s) => s.navigationLocked);

return (
  <>
    <TopNav />
    <FlowNav />
    <SiteChrome />
    <WebcamPiP enabled={navigationLocked} />  {/* ← add here */}
    <AnimatePresence mode="wait">
      <motion.div key={current} ...>
        <Active />
      </motion.div>
    </AnimatePresence>
    <SmartFooter />
  </>
);
```

---

## 11. Campaign Creation Updates

### Step 5: Interview Type — Updated

```
┌─────────────────────────────────────────────────────────┐
│  Interview Type                                          │
│                                                          │
│  ● Technical (8 questions)                               │
│    1 behavioral + 5 coding + 2 system design             │
│    Recommended duration: 45 min                          │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Duration: [ 45 ] min     (range: 30 – 60 min)    │  │
│  │                                                   │  │
│  │ ✓ 35 min: enough for all questions (tight)       │  │
│  │ ✓ 45 min: recommended                            │  │
│  │ ⚠ 25 min: may not be enough for 5 coding problems│  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  Per-question soft timer:                                │
│  ○ Easy coding: 5 min  ● Medium: 8 min  ○ Hard: 12 min  │
│  ○ Behavioral: 3 min  ○ System design: 10 min           │
│                                                          │
│  Hint system:                                            │
│  ☑ Allow hints (3 max, -10% score each)                 │
│                                                          │
│  Skip allowed: ☑ Yes                                     │
│  Explain-logic allowed: ☑ Yes                            │
└─────────────────────────────────────────────────────────┘
```

### New fields added to campaign creation

1. **Duration** — auto-calculated based on interview type, admin-editable, with warnings
2. **Per-question soft timer** — recommended time per question type
3. **Hint system toggle** — on/off + max hints + penalty per hint
4. **Skip toggle** — on/off
5. **Explain-logic toggle** — on/off

### Auto-calculated durations

| Interview Type | Questions | Recommended Duration | Range |
|---|---|---|---|
| Full Interview | 12 (3 beh + 4 coding + 2 SD + 3 follow-up) | 55-65 min | 45-75 |
| Technical | 8 (1 beh + 5 coding + 2 SD) | 45-55 min | 30-60 |
| Role Specific | 10 | 35-45 min | 25-55 |
| Behavioral | 6 | 15-20 min | 10-25 |
| System Design | 4 | 35-45 min | 25-55 |
| Quick Screen | 5 | 10-15 min | 8-20 |

### Store additions

```ts
// store.ts additions to campaign config
interface CampaignConfig {
  // ... existing fields
  interviewType: InterviewType;
  interviewDuration: number;          // minutes (auto-calculated, editable)
  perQuestionTimers: {
    easyCoding: number;               // default 5
    mediumCoding: number;             // default 8
    hardCoding: number;               // default 12
    behavioral: number;               // default 3
    systemDesign: number;             // default 10
  };
  hintsEnabled: boolean;              // default true
  maxHints: number;                   // default 3
  hintPenalty: number;                // default 10 (% per hint)
  skipEnabled: boolean;               // default true
  explainLogicEnabled: boolean;       // default true
}
```

---

## 12. AI Model Architecture

### Multi-Model Pipeline

```
┌─────────────────────────────────────────────────────┐
│  Interview AI Architecture (Multi-Model)            │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  Question Orchestrator (decides what to ask)  │  │
│  │  Model: Gemini 2.0 Flash (fast, cheap)        │  │
│  │  Called: every 30s + after each answer        │  │
│  │  Input: candidate's performance so far        │  │
│  │  Output: { next_question_type, difficulty,    │  │
│  │           topic, skip_followup, extend_time } │  │
│  └───────────────────┬───────────────────────────┘  │
│                      │                              │
│  ┌───────────────────┴───────────────────────────┐  │
│  │  Question Generator (creates the question)    │  │
│  │  Model: Gemini 2.0 Flash                      │  │
│  │  Called: when orchestrator picks a question   │  │
│  │  Input: type, difficulty, topic, role         │  │
│  │  Output: { question_text, problem, tests }    │  │
│  └───────────────────┬───────────────────────────┘  │
│                      │                              │
│  ┌───────────────────┴───────────────────────────┐  │
│  │  Code Evaluator (evaluates candidate's code)  │  │
│  │  Model: GPT-4o (best at code) OR Claude 3.5   │  │
│  │  Called: when candidate clicks "Submit to AI" │  │
│  │  Input: problem, code, test results, language │  │
│  │  Output: { verdict, score, complexity,        │  │
│  │           feedback, follow_up_question }      │  │
│  └───────────────────┬───────────────────────────┘  │
│                      │                              │
│  ┌───────────────────┴───────────────────────────┐  │
│  │  Conversation Agent (interviewer persona)     │  │
│  │  Model: Gemini 2.0 Flash (fast responses)     │  │
│  │  Called: continuously during chat             │  │
│  │  Input: transcript + current question context │  │
│  │  Output: natural conversational responses     │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Model Recommendations by Phase

| Phase | Orchestrator | Question Gen | Code Evaluator | Voice | Cost/Interview |
|---|---|---|---|---|---|
| **Phase 1** (build now) | Gemini Flash | Gemini Flash | Gemini Flash | None (text) | $0.05-0.10 |
| **Phase 2** (real execution) | Gemini Flash | Gemini Flash | GPT-4o | None | $0.15-0.30 |
| **Phase 3** (real voice) | Gemini Flash | Gemini Flash | GPT-4o | Whisper + ElevenLabs | $0.50-1.50 |
| **Phase 4** (scale) | Self-hosted Llama | Gemini Flash | Self-hosted DeepSeek | Self-hosted Whisper | $0.20-0.50 |

### Orchestrator Prompt (called every 30s + after each answer)

```js
async function decideNextQuestion(interviewContext) {
  const prompt = `
    You are an expert technical interviewer conducting a ${interviewContext.type} interview.
    
    Candidate profile: ${interviewContext.role}, ${interviewContext.experience} experience.
    Time elapsed: ${interviewContext.elapsedMin} min / ${interviewContext.targetMin} min target.
    Time remaining: ${interviewContext.remainingMin} min.
    
    Questions asked so far:
    ${interviewContext.questions.map(q => `
      - ${q.type} (${q.difficulty}): ${q.title}
        Score: ${q.score}/100, Time: ${q.timeMin}min, Hints: ${q.hintsUsed}
        Candidate's approach: ${q.approach}
    `).join('')}
    
    Based on the candidate's performance so far, decide the next step:
    1. Ask a follow-up question on the current topic?
    2. Move to a new question? What type and difficulty?
    3. Skip remaining questions and wrap up?
    4. Extend time on the current question?
    
    Rules:
    - Don't ask more than 5 coding questions total
    - Don't ask more than 3 behavioral questions total
    - Always cover at least 1 system design (if time permits)
    - If candidate struggled on Easy, don't jump to Hard
    - If candidate aced Medium, consider Hard
    - Leave 2 min at the end for candidate questions
    
    Return JSON: {
      "action": "followup" | "new_question" | "wrap_up" | "extend",
      "reason": "why",
      "next_question": {
        "type": "behavioral" | "coding" | "system_design",
        "difficulty": "easy" | "medium" | "hard",
        "topic": "arrays" | "trees" | "systems" | etc,
        "text": "the question to ask",
        "problem": { ... } // if coding
      }
    }
  `;
  
  const response = await gemini.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

### Code Evaluator Prompt (called on "Submit to AI")

```js
async function evaluateCode(problem, code, testResults, language) {
  const prompt = `
    You are a technical interviewer evaluating a candidate's code.
    
    Problem: ${problem.title} (${problem.difficulty})
    ${problem.description}
    
    Candidate's code (${language}):
    \`\`\`${language}
    ${code}
    \`\`\`
    
    Test results: ${testResults.passed}/${testResults.total} passed
    ${testResults.failures.map(f => `- Failed: ${f.input} → got ${f.got}, expected ${f.expected}`).join('\n')}
    
    Evaluate the code on:
    1. Correctness (does it solve the problem?)
    2. Time complexity (what is it? is it optimal?)
    3. Space complexity (what is it? is it optimal?)
    4. Code quality (readability, naming, structure)
    5. Edge cases (did they handle empty input, single element, etc.?)
    
    Return JSON: {
      "verdict": "pass" | "partial" | "fail",
      "score": 0-100,
      "complexity": { "time": "O(n)", "space": "O(1)", "optimal": true/false },
      "feedback": "2-3 sentence feedback for the candidate",
      "follow_up": "a follow-up question to ask, or null",
      "strengths": ["what they did well"],
      "improvements": ["what could be better"]
    }
  `;
  
  const response = await gemini.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

---

## 13. Code Execution Pipeline

### "Run Tests" Flow

```
Candidate clicks "Run Tests"
       │
       ▼
┌─────────────────┐
│ Send code to    │
│ Piston API      │──→ Returns: stdout, stderr, exit code
│ (or mock)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Compare output  │
│ vs test cases   │──→ Results: [{ id:1, pass:true }, { id:2, pass:false }]
└────────┬────────┘
         │
         ▼
  Show results in editor UI
```

### "Submit to AI" Flow

```
Candidate clicks "Submit to AI"
       │
       ▼
┌──────────────────────┐
│ Send to Gemini:      │
│ - Problem statement  │
│ - Candidate's code   │
│ - Test results       │
│ - Language           │
└────────┬─────────────┘
         │
         ▼ (2-4s)
┌──────────────────────┐
│ Gemini returns:      │
│ {                    │
│   verdict: "pass",   │
│   score: 78,         │
│   complexity: "O(n)",│
│   feedback: "...",   │
│   suggestions: [...] │
│ }                    │
└────────┬─────────────┘
         │
         ▼
  AI feedback appears as chat bubble
  Score recorded for the report
```

### Mock vs Real

| Step | Phase 1 (mock) | Phase 2 (real) |
|---|---|---|
| Run tests | Mock: always returns 8/10 pass | Piston API: real execution |
| Submit to AI | Mock: pre-written feedback | Gemini API: real evaluation |
| AI voice feedback | Text only | TTS (ElevenLabs/Google) |
| AI follow-up generation | Hardcoded follow-ups | Gemini generates dynamic follow-ups |

---

## 14. Report Integration

The interview report already has a "Coding Analysis" section (#7). For interviews with in-interview coding, this section expands to include all coding problems attempted:

```
Section 7: Coding Analysis

Problem 1: Reverse Linked List (Easy)
├── Language: Python
├── Time to solve: 4m 32s
├── Test cases: 3/3 passed
├── AI score: 82/100
├── Complexity: O(n) time, O(1) space ✓
├── Hints used: 1 (-10% penalty)
├── Code:
│   def reverse(head):
│       prev, curr = None, head
│       while curr:
│           nxt = curr.next
│           curr.next = prev
│           prev = curr
│           curr = nxt
│       return prev
├── AI feedback: "Clean iterative solution. Good edge case handling."
├── Strengths: ["Optimal time complexity", "Clean variable naming"]
├── Improvements: ["Could add type hints", "Consider adding docstring"]
└── Follow-up: "Can you do it recursively?" → Solved (score: 75)

Problem 2: Kth Largest Element (Medium)
├── Language: Python
├── Time to solve: 8m 15s
├── Test cases: 2/3 passed (1 hidden failed)
├── AI score: 65/100
├── Complexity: O(n log n) time, O(1) space (not optimal — should be O(n) with quickselect)
├── Hints used: 2 (-20% penalty)
├── Mode: Coded
├── Code: ...
├── AI feedback: "Your sorting approach works but isn't optimal..."
└── No follow-up (time constraint)

Problem 3: LRU Cache (Hard)
├── Mode: Logic Explanation (not coded)
├── AI score: 52/100 (logic only, weighted at 60%)
├── Approach: HashMap + Doubly Linked List (correct)
├── Complexity identified: O(1) get/put ✓
├── Edge cases: capacity=0 ✗, concurrent access ✗
└── AI feedback: "Solid approach. Practice coding it up."
```

### System Design / Whiteboard Analysis (new report section or expanded section 8/9)

```
System Design Question 1: Design a URL Shortener
├── Mode: Whiteboard (drew + explained verbally)
├── Time: 9m 12s
├── AI score: 74/100
├── Whiteboard snapshot: [embedded PNG image of the candidate's drawing]
├── Components identified: Client, Cache, Worker, Database, CDN ✓
├── Missing components: Load Balancer ✗, Rate Limiter ✗
├── Data flow: Correct (Client → Cache → Worker → DB) ✓
├── Failure handling: Not addressed ✗
├── Scaling strategy: Mentioned CDN for hot links ✓, no sharding ✗
├── Trade-offs discussed: Cache vs DB trade-off ✓
├── AI feedback: "Solid foundation — cache + worker + DB is the right
│   pattern. Add a load balancer and rate limiter. Show how the CDN
│   invalidates stale links. Consider DB sharding for write scaling."
├── Verbal explanation score: 78/100
├── Whiteboard visual score: 70/100
└── Combined score: 74/100 (50% verbal + 50% visual)

System Design Question 2: Add Rate Limiting to your design
├── Mode: Whiteboard (follow-up, modified existing drawing)
├── Time: 4m 30s
├── AI score: 82/100
├── Whiteboard snapshot: [embedded PNG]
├── AI feedback: "Good — token bucket rate limiter is the right choice.
│   Placed correctly between the load balancer and workers."
└── No follow-up (time constraint)
```

---

## 15. Prep vs Candidate Mode Differences

The same interview engine powers both modes, with different rules:

| Feature | Prep Mode | Candidate (Hiring) Mode |
|---|---|---|
| Timer | No timer (practice freely) | Adaptive (paced by AI) |
| Retakes | Unlimited | Zero retakes |
| Hints | Unlimited, no penalty | 3 max, -10% each |
| Skip | Yes, no penalty | Yes, score = 0 |
| Explain Logic | Yes | Yes |
| Whiteboard (system design / math / puzzle) | Yes | Yes |
| End Early | Always allowed | Only after AI finishes, or emergency exit |
| Proctoring | Informational only | Strict (3-strike) |
| Code execution | Mock or real (Piston) | Real (Piston) |
| AI evaluation | Real (Gemini) | Real (Gemini) |
| Report | Full 17-section | Full 17-section |
| Question generation | From bank (24 problems) | AI-generated + bank hybrid |
| Webcam PiP | Optional | Mandatory |

**Same component, different `mode` prop:**
```js
<InterviewStudio mode="prep" />      // forgiving
<InterviewStudio mode="candidate" /> // strict
```

---

## 16. Implementation Phases

### Phase 1: Foundation (Build Now)

| Feature | Mock or Real | Build Time |
|---|---|---|
| Webcam PiP component | Real (`getUserMedia`) | 2 hours |
| 70/30 split layout | Real (CSS grid) | 1 hour |
| Question bank with `type` field | Mock (hardcoded) | 1 hour |
| Slide-in code editor panel | Real (reuse Coding Arena editor) | 2 hours |
| Run tests button | Mock (returns 8/10) | 30 min |
| Submit to AI button | Mock (pre-written feedback) | 1 hour |
| AI feedback as chat bubble | Real (transcript update) | 30 min |
| Editor collapse/expand | Real | 30 min |
| Per-question timer (adaptive) | Mock (recommended + elapsed) | 1 hour |
| Hint system (3 tier) | Mock (pre-written hints) | 1 hour |
| Skip + Explain Logic | Real (UI + flow) | 1 hour |
| 3-state End button | Real | 1 hour |
| Report integration | Mock (data captured) | 1 hour |
| **Total** | | **~13 hours** |

### Phase 2: Real AI + Execution

| Feature | Build Time |
|---|---|
| Real code execution via Piston API | 2 hours |
| Real AI code evaluation via Gemini | 2 hours |
| Dynamic question generation via Gemini | 3 hours |
| AI orchestrator (adaptive pacing) | 3 hours |
| **Total** | **~10 hours** |

### Phase 3: Real Voice

| Feature | Build Time |
|---|---|
| Whisper STT integration (candidate speech → text) | 4 hours |
| ElevenLabs TTS integration (AI text → voice) | 4 hours |
| Real-time conversation loop (WebSocket) | 6 hours |
| **Total** | **~14 hours** |

### Phase 4: Scale + Optimize

| Feature | Build Time |
|---|---|
| Self-host DeepSeek Coder for code eval | 8 hours |
| Self-host Whisper for STT | 4 hours |
| Caching + cost optimization | 4 hours |
| **Total** | **~16 hours** |

---

## 17. File Structure

```
src/
├── components/
│   ├── shared/
│   │   ├── webcam-pip.tsx              ← NEW: draggable webcam PiP
│   │   └── proctoring-warning.tsx      (existing)
│   └── screens/
│       ├── prep/
│       │   └── interview.tsx           ← MAJOR UPDATE: 70/30 split + code editor
│       └── candidate/
│           └── interview-test.tsx      ← MAJOR UPDATE: same 70/30 split
├── lib/
│   ├── interview-engine.ts             ← NEW: orchestrator + question selection
│   ├── code-evaluator.ts               ← NEW: Gemini code evaluation
│   ├── code-executor.ts                ← NEW: Piston API integration
│   └── interview-questions.ts          ← NEW: question bank + AI generation
└── app/
    └── page.tsx                        ← UPDATE: mount WebcamPiP globally
```

### New files to create

| File | Purpose |
|---|---|
| `src/components/shared/webcam-pip.tsx` | Draggable webcam PiP component |
| `src/components/shared/whiteboard.tsx` | Drawing canvas (pen, shapes, text, eraser, undo/redo) for system design / math / puzzle questions |
| `src/lib/interview-engine.ts` | AI orchestrator (question selection, pacing, follow-ups) |
| `src/lib/code-evaluator.ts` | Gemini code evaluation pipeline |
| `src/lib/code-executor.ts` | Piston API integration for code execution |
| `src/lib/whiteboard-evaluator.ts` | Gemini Vision API evaluation of whiteboard snapshots |
| `src/lib/interview-questions.ts` | Question bank + AI question generation |

### Files to update

| File | Changes |
|---|---|
| `src/components/screens/prep/interview.tsx` | Add 70/30 split, code editor, whiteboard, hint system, skip, explain-logic, 3-state End |
| `src/components/screens/candidate/interview-test.tsx` | Same changes as prep version |
| `src/app/page.tsx` | Mount `<WebcamPiP>` globally |
| `src/components/screens/admin/campaign-new.tsx` | Add interview duration, hint/skip/explain/whiteboard toggles to Step 5 |
| `src/components/screens/prep/report.tsx` | Expand Coding Analysis + add System Design Analysis sections |

---

## Appendix: Example Dynamic Interview Flow

```
00:00  AI: "Hi, I'm your interviewer today. We'll do a technical interview
        with a mix of behavioral, coding, and system design. Take your time.
        You can ask for hints or skip if stuck. Let's start."

00:00  AI: "Tell me about a technical challenge you faced."
00:03  Candidate: answers well (STAR, concrete)
00:04  AI decision: strong answer, skip behavioral follow-up
       → Jump to Coding Q1 (Easy)

00:04  AI: "Let's do a coding problem. Reverse a linked list."
       → Editor slides in (70% left)
00:09  Candidate: solves in 5 min, 0 hints, 3/3 tests pass
00:09  AI decision: aced it, skip to Medium
       → Jump to Coding Q2 (Medium)

00:09  AI: "Find the kth largest element in an array."
00:17  Candidate: solves in 8 min, 1 hint, 2/3 tests pass
00:17  AI decision: good but not perfect, ask follow-up
       → "Can you explain the time complexity of your solution?"

00:19  Candidate: explains correctly
00:19  AI decision: solid, one more coding (Hard) or system design?
       → Time check: 26 min remaining → do both
       → Jump to Coding Q3 (Hard)

00:19  AI: "Implement LRU Cache."
00:30  Candidate: struggling, used 3 hints, 1/3 tests
00:30  AI decision: stuck, offer explain-logic or skip
       → "Would you like to explain your approach or move on?"

00:31  Candidate: "Let me explain my logic."
       → Editor switches to Logic Explanation mode
00:33  Candidate explains, AI evaluates logic
00:33  AI decision: logic is decent, move to system design
       → Jump to System Design Q1

00:33  AI: "Design a URL shortener."
       → Editor slides out, full-width chat
00:43  Candidate: explains architecture
00:43  AI: "That's all I have. Any questions for me?"
00:45  Interview ends

Total: 3 coding + 1 behavioral + 1 system design = 5 questions (not 8)
The AI adapted: skipped behavioral follow-ups, skipped a 4th coding problem
because the candidate was struggling (time management), and still covered
all categories.
```

---

*This document is the complete design spec for Feature 2. Update this file as
implementation decisions are finalized.*
