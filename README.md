# OpenDuelyst

![Duelyst Logo](app/resources/ui/brand_duelyst.png)

This is the source code for Duelyst, a digital collectible card game and
turn-based strategy hybrid developed by Counterplay Games and released in 2016.

This repo preserves the state of the game as it existed before the shutdown in
2020, with improvements targeting the code and infrastructure. The game is
playable by hosting a local server; there is no public server available at the
moment.

When playing locally, all factions and cards are unlocked, and you start with
bonus Gold and Spirit for building new decks.

For more information, you can join the Discord server for this project
[here](https://discord.gg/HhUWfZ9cxe).

## Quick Start

Running Duelyst locally requires a free Google Firebase account, software for
running Docker containers, and a Node.js environment. For detailed instructions,
see the [Quick Start Guide](docs/QUICKSTART.md).

## Playing on Android or iOS

The game can currently be played in Chrome or Safari on mobile platforms. Use
the "Add to Home Screen" browser feature to hide the status bar during gameplay.

## Filing Issues and Reporting Bugs

If you encounter a bug and would like to report it, first check the
[Open Issues](https://github.com/open-duelyst/duelyst/issues/) to see if the
bug has already been reported. If not, create a new issue with the `bug` label.

If you would like to request a technical feature or enhancement to the code,
you can create a new issue with the `enhancement` label.

## Contributing

If you're interested in contributing to the project, check out the
[Contributor Guide](docs/CONTRIBUTING.md). This has some important details
on technical issues and programming practices.

### Localization

The game currently includes English and German localization. If you'd like to
contribute translations for another language, take a look at the
`app/localization/locales` directory. You can copy the `en` folder and start
updating strings for the new language, then submit a Pull Request with your
contributions.

## License

OpenDuelyst is licensed under the Creative Commons Zero v1.0 Universal license.
You can see a copy of the license [here](LICENSE).
