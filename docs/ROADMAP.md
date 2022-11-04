# OpenDuelyst Roadmap

## Project Goals

- OpenDuelyst will be free indefinitely, with no form of monetization. The code
	supporting payment processing has already been disabled or removed.
- We aim to preserve the original game experience of building a collection
	while greatly accelerating card acquisition. As a result, all users receive
	2,500 Gold and 50,000 Spirit after logging in, which gives plenty of
	resources to start building decks. The costs of purchasing Orbs (packs) and
	crafting cards has been reduced by 50%, and quest rewards have been tripled.
- Creating new content or making balance changes are not goals of this project.
	Instead, we aim to provide a well-maintained reference implementation and
	reference deployment of the game as it existed before the shutdown in 2020.
- We will build clients for web (including mobile web) and desktop.
- We would like to provide native mod support for modified art, game rules,
	cards, etc., enabling users to tweak the existing codebase without needing
	to fork and heavily modify the project.

## Project Timeline

As of October 2022, most of the highest-priority issues, such as making the
game functional, building clients for our target platforms, and creating
automation and documentation for the project, are already complete.

We are currently focused on contributor onboarding. Issues are tagged as
`frontend`, `backend`, or `infrastructure` to make it easier to find work which
matches contributors' interests and experience. Contributors can work on any
issue, but we have some rough prioritization assigned to issues:

- P0 issues involve major end-user impact, such as broken or missing features.
- P1 issues involve major developer impact, such as automating deployments.
- P2 issues involve minor end-user impact, such as visual or text bugs.
- P3 issues involve minor developer impact, such as code cleanup.

For November 2022 and beyond, we have a few high-priority objectives:

- Better mobile support, including packaging Android and iOS apps and
	improvements to UI scaling
- Creating new achievements and quests
- Creating new daily challenges and puzzles
- Implementing a password reset flow (using tokens rather than email)

At some point, we plan to provision a production environment in AWS for a more
"official" launch of the game. In the meantime, we are using the staging
environment as a publicly-available deployment for web and desktop clients.
