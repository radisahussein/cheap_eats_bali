# Cheap Eats Web Application

## Main Issue
Bali is a moderately big island. However, we have nothing but Google Maps to rely on to search for places to eat. Locally-owned smaller places don't have the technology capability to market their establishments, often relying on word-of-mouth.

With the influx of foreigners in the island, more and more of establishments are catering their menu to people with substantially higher income than the locals themselves. Making it harder for locals to find and experience a good eating experience, thats easy on the wallet. 

In addition to that, most people don't spend their time exploring Bali and trying out new places, people would rather take other's recommendations and suggestions, as they feel eating out should be worth the time and money to go to. Trying out new places feels scary for most of them.

## Proposed Solution
To create a web application, that serves as a platform for users to find restaurants or small food courts that are well-underrated, hidden gems, locally-owned, inexpensive.

Users will have 3 options:
- Search for other user's suggestions / recommendations
- Input a place, with description/notes, menu's they had, pictures if available, pricing information, and a rating.
- Add reviews to existing inputted places, sharing their own experience, rate, and add pictures if available.

The end goal is to create a more local, and community-driven application, for finding good eats. Emphasis on "local", we wan't a place that's not literred with ads like in google maps, with their paid recommendation services

## Core Requirements
- The webapp must be lightweight, modular, and easy to maintain. In the beginning stages, we are obviously not expecting a large amount of users/visitors. However for anticipation, we need to be able to switch architecture/services for ease of scaling.
- UI/UX must be eye-catching, while being simple and easy enough to navigate, especially for non-tech savys.
- It is recommended to use free-services, however keep in mind to make it scalable to use paid services if needed. 

## Tech Stacks
I don't have preferred complete tech stack that I want for this project. However these are some that I want added:
- Husky > for cleaner commits and maintainability
- Bun > for a superfast package manager
- Biome > for linting and formatting
- Fallow > for finding dead code, duplication, and complexity across the whole project
- Arcjet > for rate-limiting, bot protection, and general security
- Lucide > for clean open-source icons
- Motion > for production-grade animations
- Zod > for runtime validation that infers your typescript types
- PostHog > for product analytics, session replays, feature flags, A/B testings, surveys, etc.

You also need to utilize skills and plugins to create a production-grade looking website.

## CLAUDE.md file
Set-up the CLAUDE.md file after grilling me with questions/clarifications regarding the project. Below are must haves:
- Apply DRY, YAGNI, KISS. Use industry-standards, and best-practices for coding.
- Ensure minimal code changes for fixes and features. Your main goal is functionality.
- Grill user for any uncertainties, NEVER assume.
- Utilize skills and plugins to your advantage.
- Full git implementation, create stage branch off of main, and a branch for each phase of the project
- You are never to push, unless with strict approval from the user
- Do not overthink decisions, you have a maximum of 3 attempts to solve/fix something, if exceeds this limit, you ask the user for clarification, providing the issue and your suggested solutions
- Prioritize free services first, ensure scalability if migration to paid services are needed.
- Environment-based programming, do not include any hard-coded variables in the code. All that can be configured must be inside env
- Provide CI/CD implementations, including all tests that are needed to guarantee app-functionality. Unit tests, component tests, lint tests, type tests, integration tests, everything.
- After each phase / bug fixing session, provide summary by updating PROGRESS.md file. Explain what was done, and what needs to be worked on for the next phase
- Utilize playwright skill for browser-testing. Ensure all UI/UX are working as expected.
- Stop after each phase, prepare yourself for compacting.

