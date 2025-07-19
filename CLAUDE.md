# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Japanese language game project called "ママとパパどっちが好きなの？" (The Battle for Baby's First Words). It's a 1-minute anime-style showdown where players compete with an AI opponent to influence a baby's first word.

## Current Project Status

The project is in the initial planning phase with:
- Detailed game design documented in README.md
- Audio assets prepared (crying.mp3, laughing.mp3 in /sounds/)
- Empty /images/ directory for future character models
- No implementation code yet

## Game Architecture

### Core Game Mechanics
- **Duration**: 1-minute timed rounds
- **Players**: Human (Mom or Dad) vs AI opponent (opposite parent)
- **Third Character**: AI dog that randomly barks ("ワンワン")
- **Surprise Element**: 変なおじさん (Weird Uncle) appears in the window before time ends
- **Two Difficulty Modes**:
  - よちよちモード (Easy): Player chooses from 3 provided sentences
  - ガチ育児モード (Hard): Player types freely

### Technical Requirements
- **Language**: All game text and UI must be in Japanese
- **AI Integration**: OpenAI GPT-4o for AI parent and dog responses. Generate few strings and then keep reusing them.
- **Scene Layout**: Baby in center bed, parents on sides, dog at foot, window in background

## Development Guidelines

### When Implementing
1. All user-facing text must be in Japanese
2. Implement OpenAI API integration for AI characters
3. Create timer system for 1-minute rounds
4. Handle both difficulty modes with different input methods
5. Implement audio playback for crying.mp3 and laughing.mp3

### Git Workflow
- Commit significant changes to GitHub as mentioned in README

### Future Asset Management
- Character models will be stored in /images/
- Audio files are in /sounds/

## Next Steps for Implementation

Since no framework has been chosen yet, when starting implementation:
1. Recommend and set up appropriate web framework
2. Create project structure with build tools
3. Set up OpenAI API integration
4. Implement game state management
5. Create UI components for the game scene
6. Add animation system for character reactions