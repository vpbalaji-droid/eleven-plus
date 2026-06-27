# Question Bank Data Model

Stack-independent. Consumed by both a vanilla-JS or React front end, and by the
AI-generation pipeline (Claude emits objects in exactly this shape).

## Question

```jsonc
{
  "id": "en-001",            // unique, stable; prefix by subject
  "subject": "english",      // english | maths | verbal | nonverbal
  "topic": "comprehension",  // free-text tag for filtering/analytics
  "board": "GL",             // GL | Quest  — which exam board's style
  "region": ["kent"],        // kent | bexley — which areas use this style
  "difficulty": 2,           // 1 (easy) .. 3 (hard)
  "stem": "Read the passage. What does the word 'reluctant' most nearly mean?",
  "passage": null,           // optional shared context (comprehension); else null
  "image": null,             // optional URL/path (non-verbal); else null
  "choices": [               // 4–5 options, multiple-choice
    "eager", "unwilling", "tired", "curious"
  ],
  "answer": 1,               // index into choices (0-based)
  "explanation": "‘Reluctant’ means unwilling or hesitant to do something.",
  "source": "seed"           // seed | ai | imported
}
```

## Test (a generated paper)

```jsonc
{
  "id": "test-...",
  "region": "kent",          // drives which board + subjects
  "board": "GL",
  "subjects": ["english", "maths", "verbal", "nonverbal"],
  "durationSec": 2700,       // total timed window
  "questionIds": ["en-001", "ma-004", ...]
}
```

## Attempt (a student's run, stored in localStorage)

```jsonc
{
  "id": "attempt-...",
  "testId": "test-...",
  "startedAt": 0,            // epoch ms
  "finishedAt": 0,
  "answers": { "en-001": 1, "ma-004": 3 },  // questionId -> chosen index
  "score": { "correct": 18, "total": 25, "bySubject": { "english": 6, ... } }
}
```

## Region config

| Region | Board | Notes |
|--------|-------|-------|
| Kent   | GL Assessment | English, Maths, VR, NVR. Standardised scoring. |
| Bexley | Quest Assessment (GL-delivered) | English, Maths, VR, NVR. |

Both currently test all four areas via multiple-choice in this app. NVR is
stubbed with placeholder images until real visual items are authored.
