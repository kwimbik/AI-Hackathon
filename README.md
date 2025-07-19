# 🍼 ママとパパどっちが好きなの？  
**The Battle for Baby's First Words**

## 🎮 Quick Start

### Method 1: Simple HTTP Server (Recommended for testing)
1. **Navigate to the game directory:**
   ```bash
   cd AI-Hackathon
   ```

2. **Start Python HTTP server:**
   ```bash
   python3 -m http.server 8000
   ```

3. **Open your browser:**
   Navigate to `http://localhost:8000`

### Method 2: Node.js Server (If available)
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🎯 Overview

"ママ" or "パパ"... or maybe... "バカ"!?

**最初言葉バトル！** is a fast, fun, anime-style 1-minute showdown where two parents — one human and one AI — compete to influence their baby's very first word.

But there's a twist: a third character joins the fight — a dog! The AI dog doesn't speak human words, it just barks ("ワンワン") randomly, adding chaos to the scene 🐶.

## 🕹 How It Works

- Player chooses to be **ママ** or **パパ**.
- The player types their character's dialogue freely (in Japanese).
- The AI parent generates funny or emotional responses — sometimes related, sometimes totally off-topic.
- The AI **dog** just barks or makes "dog sounds" randomly during the game.
- You have **1 minute** to win over the baby through words.
- At the end, the baby says their **first word**, with a fun animation:
  - Laughing if it's a silly or "bad" word
  - Emotional reactions depending on the outcome

Will the baby say "ママ"? "パパ"? Or something completely unexpected like "マンマ" or "バカ"!?

---

## 🖼 Scene Details

- 👶 The baby lies in a cozy bed in the center of the screen.
- 🧑‍🍼 The player and AI parent stand on each side of the bed, facing each other.
- 🐶 The AI dog stands at the foot of the bed, occasionally barking.
- 🌇 A window is behind the baby — it's part of the background scenery.
- Later characters models will be used for specific actions like turning to a dog or reacting to 変なおじさん, they will be in images folder

## Prepared Sounds
- Baby’s crying sound is “crying.mp3”
- Baby’s laughing sound is “laughing.mp3”

⏳ **Surprise twist!**  
Just before the 1-minute time limit ends, **変なおじさん (Weird Uncle)** appears suddenly in the window. He delivers a funny or cryptic line that fits his chaotic vibe — disrupting the tension for a final laugh before the baby speaks.

---

## 🎚 Difficulty Levels

There are two difficulty modes:

- 🍼 **よちよちモード** – Easy Mode (Toddle Mode): More predictable and friendly AI responses  
- Player always chooses from 3 possible sentences given to him
- 🔥 **ガチ育児モード** – Hard Mode (Hardcore Parenting): More aggressive, chaotic, and sarcastic AI behavior
- Player types everything on his own

Choose wisely — parenting is not for the weak!

---

## 🌐 Game Language

**The game is entirely in Japanese.**  
Players must enter dialogue in Japanese, and all AI responses and UI are also in Japanese.

## Github
- Always commit bigger changes to github

---

## 🚀 Features

- **Real-time multiplayer** using Socket.IO
- **Anime-style character animations**
- **Audio effects** (crying and laughing)
- **Two difficulty modes**
- **Japanese language interface**
- **Surprise game elements**
- **Score tracking and winner determination**

## 🛠 Development

For development with auto-restart:
```bash
npm run dev
```

## 🔧 Optional: OpenAI Integration

To use dynamic AI responses instead of pre-written ones:

1. Copy `.env.example` to `.env`
2. Add your OpenAI API key to `.env`
3. Uncomment OpenAI integration code in `server.js`

## 🔧 Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Real-time**: Socket.IO
- **AI**: OpenAI GPT-4o (optional)
- **Audio**: HTML5 Audio API
