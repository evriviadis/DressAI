# evryWear 🧥✨

**Dress smarter. Your entire wardrobe, digitized.**

## About the Project
evryWear is a personal project built mostly for fun. The main goal is to solve the everyday dilemma of "What do I wear today?" 

It is designed to help people make effortless decisions about their daily outfits and upgrade their personal style without having to stress, overthink, or put in a ton of effort. Just scan your clothes, and let the AI do the heavy lifting of figuring out what looks good together based on the weather and the occasion.

## Core Features
* **Smart Scanning:** Digitize your wardrobe simply by uploading photos. The AI automatically identifies colors, materials, and styles.
* **Digital Closet:** Browse and filter your clothes across categories (Tops, Bottoms, Shoes, etc.).
* **AI Stylist:** Get curated outfit suggestions pulled straight from your actual wardrobe, tailored to the current weather and your personal preferences.
* **Feedback Loop:** Rate the AI's suggestions so it learns your unique style over time.

## Tech Stack
* **Frontend:** Next.js 14 (App Router), Tailwind CSS
* **Backend/Auth/Database:** Supabase
* **AI Engine:** Google Gemini Vision & Text APIs

## Running Locally

**Prerequisites:** Node.js 18+, a [Supabase](https://supabase.com) project, and API keys for Google Gemini and OpenWeatherMap.

1. **Clone the repo & install dependencies**
   ```bash
   git clone https://github.com/your-username/DressAI.git
   cd DressAI
   npm install
   ```

2. **Set up environment variables**

   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GOOGLE_AI_KEY=your_google_gemini_api_key
   OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.
