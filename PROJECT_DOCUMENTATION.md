# SehatSathi - Project Documentation

## 1. Project Overview

**SehatSathi** is an AI-powered medical consultation platform designed to provide accessible, multilingual, and intelligent healthcare assistance. It acts as a bridge between users and medical knowledge, offering simulated consultations with AI doctors specialized in various fields.

The core mission is to make healthcare guidance available to everyone, regardless of language barriers or location, by leveraging advanced Large Language Models (LLMs) and voice technologies.

### Key Features:
-   **AI Doctor Consultation**: Real-time voice and text-based consultation with AI agents acting as specialized doctors (General Physician, Cardiologist, Pediatrician, etc.).
-   **Multilingual Support**: Supports English and Hindi, with automatic language detection and switching.
-   **Symptom Analysis**: Users can describe their symptoms, and the system intelligently suggests the most relevant specialist.
-   **Real-time Voice Interaction**: Seamless voice conversation using Vapi (Voice AI) and Web Speech API.
-   **Automated Medical Reports**: Generates a structured clinical summary, diagnosis, and medical advice after every session.
-   **PDF Report Download**: Users can download their consultation reports for offline reference.
-   **Session History**: Keeps track of all past consultations and reports.

---

## 2. Technical Stack

### Frontend
-   **Framework**: Next.js 16 (App Router)
-   **Styling**: Tailwind CSS
-   **Animations**: Framer Motion
-   **Icons**: Lucide React
-   **Voice/Audio**:
    -   `@vapi-ai/web`: For handling AI voice streaming and conversation management.
    -   Web Speech API: For browser-based Speech-to-Text (STT).
-   **PDF Generation**: `jspdf`

### Backend
-   **Runtime**: Next.js API Routes (Serverless functions)
-   **Database**: PostgreSQL
-   **ORM**: Drizzle ORM (for type-safe database interactions)
-   **Authentication**: Clerk (`@clerk/nextjs`)

### AI & LLMs
-   **Doctor Recommendation**: Google Gemini 2.5 Flash Lite (via OpenAI-compatible client)
-   **Report Generation**: GPT-4o-mini
-   **Conversational Agent**: GPT-4o-mini (orchestrated via Vapi)

---

## 3. Project Workflow

The user journey follows a streamlined process:

1.  **Authentication**:
    -   User lands on the platform and signs in using Clerk (Email/Social Login).
    -   System verifies the user and creates a record in the `users` database table if they are new.

2.  **Dashboard**:
    -   Authenticated user sees their dashboard.
    -   Displays a list of past consultations (History).
    -   Provides a button to "Start a Consultation".

3.  **New Session Creation**:
    -   User clicks "Start Consultation".
    -   **Input**: User enters a description of their symptoms (e.g., "I have a severe headache and nausea").
    -   **Processing**: The input is sent to the `/api/suggest-doctors` endpoint. The AI analyzes the symptoms and selects the most appropriate specialists from a predefined list.
    -   **Selection**: User selects one of the suggested doctors.
    -   **Initialization**: System calls `/api/create-session` to generate a unique `sessionId` and store the initial context in the database.

4.  **Consultation (Voice Call)**:
    -   User is redirected to the consultation page (`/consult/[sessionId]`).
    -   **Voice Interface**: The `VoiceCall` component initializes.
    -   **Interaction**:
        -   User speaks -> Web Speech API converts speech to text.
        -   Text is sent to Vapi -> Vapi processes it with the AI Doctor Persona -> AI responds with voice.
    -   **Real-time Features**:
        -   Live transcript is displayed.
        -   Real-time symptom detection (highlighting keywords like "Fever", "Cough").
        -   Severity score calculation (heuristic-based).

5.  **Conclusion & Report**:
    -   User ends the call.
    -   **Save**: The transcript is sent to `/api/save-conversation`.
    -   **Generate**: The backend uses GPT-4o-mini to analyze the transcript and generate a structured JSON report (Summary, Diagnosis, Advice).
    -   **View/Download**: The report is displayed to the user, and they can download it as a PDF.

---

## 4. API Documentation

The project uses Next.js API routes located in `app/api/`.

### 1. User Management
-   **Endpoint**: `POST /api/users`
-   **Purpose**: Ensures the authenticated user exists in the local database.
-   **Input**: None (Uses Clerk session).
-   **Output**: User object (id, name, email, credits).

### 2. Suggest Doctors
-   **Endpoint**: `POST /api/suggest-doctors`
-   **Purpose**: Analyzes symptoms to recommend specialists.
-   **Input**: `{ "notes": "symptom description" }`
-   **Output**: Array of doctor objects (id, name, specialist, image).
-   **Logic**: Uses **Google Gemini 2.5 Flash Lite** to match symptoms against a list of known doctor agents.

### 3. Create Session
-   **Endpoint**: `POST /api/create-session`
-   **Purpose**: Initializes a new medical session.
-   **Input**:
    ```json
    {
      "notes": "symptoms",
      "selectedDoctor": { ... },
      "userEmail": "user@example.com"
    }
    ```
-   **Output**: `{ "success": true, "sessionId": "uuid" }`

### 4. Get Session
-   **Endpoint**: `GET /api/session/[sessionId]`
-   **Purpose**: Retrieves session metadata (doctor info, initial notes).
-   **Output**: Session object.

### 5. Get Conversation
-   **Endpoint**: `GET /api/conversation/[sessionId]`
-   **Purpose**: Retrieves the chat transcript for a specific session.
-   **Output**: Array of message objects `[{ role: "user", text: "..." }, ...]`.

### 6. Save Conversation & Generate Report
-   **Endpoint**: `POST /api/save-conversation`
-   **Purpose**: Saves the chat history and triggers AI report generation.
-   **Input**:
    ```json
    {
      "sessionId": "uuid",
      "conversation": [...]
    }
    ```
-   **Output**:
    ```json
    {
      "success": true,
      "report": {
        "summary": "...",
        "diagnosis": "...",
        "advice": [...]
      }
    }
    ```
-   **Logic**: Uses **GPT-4o-mini** to process the conversation transcript and extract clinical insights.

---

## 5. Database Schema

The project uses a relational database schema defined in `config/schema.tsx`.

### `usersTable`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Auto-incrementing ID |
| `name` | Varchar | User's full name |
| `email` | Varchar | User's email (Unique) |
| `credit` | Integer | Consultation credits available |

### `SessionChatTable`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer (PK) | Auto-incrementing ID |
| `sessionId` | Varchar | Unique UUID for the session |
| `notes` | Text | Initial symptoms described by user |
| `selectedDoctor` | JSON | Object containing doctor details |
| `conversation` | JSON | Full transcript of the chat |
| `report` | JSON | AI-generated medical report |
| `createdBy` | Varchar (FK) | Reference to user email |
| `createdOn` | Varchar | Timestamp |
