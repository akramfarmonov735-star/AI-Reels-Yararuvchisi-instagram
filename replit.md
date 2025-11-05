# AI Instagram Reels Generator

## Overview
This is an AI-powered Instagram Reels generator that uses Google's Gemini API to create short-form video content. The application generates scripts, images, and audio narration based on user-provided topics. The interface is in Uzbek language.

## Project Architecture
- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **AI Services**: Google Gemini API (@google/genai)
  - Text generation (gemini-2.5-flash)
  - Image generation (imagen-4.0-generate-001)
  - Text-to-speech (gemini-2.5-flash-preview-tts)

## Recent Changes (Nov 5, 2024)
- Configured for Replit environment
- Fixed security issue: Removed API key exposure from frontend bundle
- Updated to use Vite environment variables (VITE_GEMINI_API_KEY)
- Changed dev server port from 3000 to 5000 for Replit compatibility
- Added TypeScript type definitions for Vite environment variables
- Configured deployment with autoscale target

## Key Files
- `App.tsx` - Main application component with reel generation workflow
- `services/geminiService.ts` - API integration for Gemini models
- `vite.config.ts` - Vite configuration (port 5000, host 0.0.0.0)
- `vite-env.d.ts` - TypeScript environment variable definitions

## Environment Variables
- `VITE_GEMINI_API_KEY` - Required API key from Google AI Studio

## How It Works
1. User enters a topic in Uzbek
2. App generates a script and image prompt using Gemini
3. Generates a 9:16 aspect ratio image using Imagen
4. Creates audio narration using Gemini TTS
5. Displays the complete reel with image and audio

## Development
- Run locally: `npm run dev`
- Build: `npm run build`
- Preview production build: `npm run preview`

## Deployment
The app is configured for autoscale deployment on Replit, which is ideal for this stateless web application.
