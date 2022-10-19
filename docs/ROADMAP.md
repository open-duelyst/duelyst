# OpenDuelyst Roadmap

## Project Goals

- OpenDuelyst will be free indefinitely, with no form of monetization. The code
	supporting payment processing has already been disabled or removed.
- We aim to accelerate building a card collection, since there is no
	monetization. This includes larger Gold rewards, reduced Orb (pack) costs,
	and creating new Quests with additional rewards.
- Creating new content or making balance changes are not goals of this project.
	Instead, we aim to provide a well-maintained reference implementation and
	reference deployment of the game as it existed before the shutdown in 2020.
- The game will be maintained after launch, though support may be limited since
	this is a volunteer project. For example, server outages will send emails to
	developers, but response times may be delayed.

## Project Timeline

#### Leading up to launch

- Our priorities leading up to the launch include any issues which will
	directly impact the player experience in the web client, such as granting
	full collections, adding new quests, or adjusting card acquisition rates.
- Since this project does not store personal user data (such as emails), we
	also need to implement a password reset token system similar to MFA backup
	tokens. The former system used an email-based flow.

#### Launch and announcement

- We plan to launch the reference deployment as soon as the production AWS
	account is ready. This account will be provided by Counterplay Games.
- Counterplay Games will announce the project once the reference deployment is
	available.

#### After launch

- Following the announcement, onboarding new contributors will be a priority.
	Much work has been done to streamline this process (writing documentation,
	automating tests in CI, etc.) so we should have ample resources for new
	contributors. Contributors are welcome to work on any issue with the `help
	wanted` label. Issues are labeled `frontend`, `backend`, or `infrastructure`
	to make it easier to find work matching one's interests and expertise.
- Once the project has been launched and announced, we will continue to work on
	issues as needed, according to the issue priorities defined below.
- The initial post-launch priorities include web-based mobile clients for iOS
	and Android.

## Issue Prioritization

These guidelines help determine issue priority. P0 is the highest priority.

- P0: Issues which have major impact on the player experience, e.g. inability
	to play games or use core features.
- P1: Issues which have major impact on the developer experience, e.g. enabling
	developers to deploy code or modify infrastructure without blocking on
	maintainers or CPG.
- P2: Issues which have minor impact on the player experience, e.g. broken
	links or typos.
- P3: Issues which have minor impact on the developer experience, e.g. code
	cleanup.
