SehatSathi — AI Voice Medical Assistant

Project Details

Project Name:
SehatSathi — AI Voice Medical Assistant

Problem Statement ID:
PS01SW

Team Name:
Keshav Coders

College Name:
St Aloysius (Deemed To Be University)

Problem Statement:

Access to primary healthcare remains a major challenge in semi-urban and rural regions. Many communities face a shortage of doctors, limited medical facilities, long travel distances to hospitals, and delayed medical attention. Language barriers and low digital literacy further prevent people from seeking timely healthcare support.

Proposed Solution:

We propose an AI-powered Intelligent Medical Assistant designed to simplify access to primary healthcare in semi-urban and rural areas.

The system functions as a smart medical chatbot that listens to users, understands their symptoms, and provides real-time guidance. Users can describe their health issues either through voice input or text. The system processes the input using Artificial Intelligence and Natural Language Processing (NLP) techniques to analyze symptoms and generate appropriate medical guidance.

Innovation and Creativity:

*Accessibility
Designed to cater specifically to the rural population, ensuring user-friendly interaction with minimal technological barriers.

*Language Support
Incorporates regional and local languages to facilitate better communication and understanding among diverse user groups in rural areas.

*Voice-Based Interaction
Utilizes voice-based interaction to assist illiterate users, making healthcare guidance accessible to everyone regardless of literacy levels.

Tech Stack and Complexity:
Frontend

*Next.js – Website framework

*Tailwind CSS – Design and styling

*Framer Motion – Animations

*Vapi – Voice AI calls

*Web Speech API – Converts speech to text

*jsPDF – Creates downloadable reports

Backend

*Next.js API Routes – Backend functions

*PostgreSQL (Neon) – Database for storing users and chats

*Drizzle ORM – Simplified database interaction

*Clerk – Authentication and login system

Artificial Intelligence

Different AI models are used for specific tasks:

*Task	- AI Model
*Choose Doctor	- Gemini 2.5 Flash Lite
*Conversation	- GPT-4o mini
*Report Generation -	GPT-4o mini

Voice Processing

Web Speech API converts user speech into text.

The text is sent to Vapi.

Vapi processes it using the AI Doctor persona.

The AI generates a response.

The response is converted back into voice output.


Database

Database: PostgreSQL (Neon)

Users Table

Stores the following fields:

name

email

credits

This acts as a user account record within the system.



Usability and Impact

The system is designed to provide primary healthcare guidance for semi-urban and rural populations. It aims to reduce delays in medical consultation, improve healthcare accessibility, and assist users in understanding their health conditions through AI-powered interaction.



Setup Instructions
Step 1: Clone the Repository
git clone https://github.com/sathwik-337/Keshav_coders.git
Step 2: Install Dependencies
npm install
Step 3: Run the Development Server
npm run dev
Step 4: Open in Browser
http://localhost:3000


Presentation Link

https://www.canva.com/design/DAHCXY0Zn1I/1pqmXKIvUEDM0yUNokbbTg/edit?utm_content=DAHCXY0Zn1I&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton
