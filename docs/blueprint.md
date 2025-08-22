# **App Name**: Verbum Lector

## Core Features:

- File Upload: Upload audio or video files, and store to Firebase Storage.
- Auto Language Detection: Automatically detect spoken language from the uploaded file using Speech-to-Text API, treating the API as a tool.
- Audio to Text Conversion: Convert audio to text, splitting it into sentences using Speech-to-Text.
- Editable Transcript Display: Display sentences in an editable list; add 'Line Break' button for new paragraphs as separate blocks. Do not use user key-presses (such as the 'Enter' key) for adding line breaks.
- Translation Service: Translate sentences from Vietnamese to Korean or vice versa, only re-translating modified sentences.
- Side-by-Side Display & Copy: Display original and translated sentences side by side; implement 'copy all' functions for transcript and translation.
- User Authentication and History: Use Firebase Authentication for login; store transcript/translation history in Firestore.

## Style Guidelines:

- Primary color: Light sky blue (#A7D1E8) to inspire calmness and faith.
- Background color: Soft beige (#F5F5DC) to create a warm and trustworthy backdrop.
- Accent color: Gentle sage green (#A8D8B9) for interactive elements, complementing the calm palette.
- Body font: 'Literata', serif, for readability and a literary feel in the transcript and translation sections.
- Headline font: 'PT Sans', sans-serif, for a modern, neutral headings.
- Use simple, outlined icons that convey trust and clarity.
- Fixed sections for file upload, language detection, transcript, translation, and final copy.