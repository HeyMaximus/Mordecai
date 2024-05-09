# Mordecai (Ultimate Mastermind)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

Ultimate Mastermind is an implementation of [Mastermind](https://en.wikipedia.org/wiki/Mastermind_(board_game)), a board game designed by Mordecai Meirowitz.

3 game modes are offered:
- solo (player vs PC)
- pvp1 (player vs player asychronously)
- pvp2 (player vs player synchronously in real time)

The frontend React client provides a UI to lead players through gameplay. Note case sensitivity when entering input.

## Table of Contents
- [Installation and Running](#installation-and-running) | [Requirements](#requirements) | [PostgreSQL Installation](#postgresql-installation) | [.env Configuration](#env-configuration)
- [Architecture](#architecture)
- [Directory Overview](#directory-overview)
- [Implemented Extensions](#implemented-extensions) | [Hints](#mag-give-hints) | [Difficulty Levels](#zap-configurable-difficulty-level) | [High Scores](#chart-high-scores) | [Async PvP](#couple-asychronous-multiplayer-game-mode-pvp1) | [Synch PvP](#fire-sychronous-multiplayer-game-mode-pvp2) | [Disconnect](#interrobang-disconnection-detection) | [Admin Dashboard](#star2-socketio-admin-ui-dashboard)

## Installation and Running
### Requirements:
- npm 10.5.2 or later
- [node 18.17.1](https://nodejs.org/en) or later
- [postgreSQL 14.11](https://www.postgresql.org) or later (v14.11 for best compatibility)

Before running Ultimate Mastermind, <b><u>ensure PostgreSQL is operational on your system</u></b>. If you have PostgreSQL installed with a non-default username and password, you must provide these credentials in the `.env` file for Ultimate Mastermind to function properly.

The application will automatically create the required database and tables, but it relies on establishing a successful connection to the local PostgreSQL database beforehand.

To run Ultimate Mastermind, clone respository to local system, navigate to cloned directory and run in terminal:
```
npm install
npm start
```
Then nagivate to: http://localhost:3000

### PostgreSQL Installation
<u>Mac / Linux</u>

The easiest approach is to use [Homebrew](https://brew.sh), a package manager. With Homebrew installed, install PostgreSQL with terminal commands:
```
brew install postgresql@14
```
Then to start running PostgreSQL
```
brew services start postgresql
```
Confirm PostgreSQL is running with
```
brew services list
```
<u>Windows</u>

An interative installer can be accessed [here](https://www.postgresql.org/download/windows).

NOTE: Initial install may ask to set a username and/or password. Please take note of these information. They will need to be provided to the .env file for the server to successfully connect to the database.

Unless changed, the default user for PostgreSQL after a fresh installation is: <b>postgres</b>

Depending on the system and version, the default password is left empty or: <b>postgres</b>

### `.env` Configuration
A `example.env` is provided to offer more configuration options. Rename to `.env` for file to take effect.
- `DB_USER`, `DB_PASSWORD`, and `DB_NAME` must be provided if they are different than expected PostgreSQL defaults on local system.
```
//BEFORE
example.env

//AFTER reanme
.env
```

## Architecture
Ultimate Master is a full stack monolithic service featuring a React client frontend for the game’s UI, backed by a Node.js server (default port: 3000) and a Socket.io server (default port: 3010) alongside a PostgreSQL database (default port: 5432).

It follows a Model-View-Controller pattern to organize the application’s logic into 3 distinct layers, each carrying out a specific set of tasks. This modularization enhances maintainability, unit testing ease, and security. The backend houses the core game logic, ensuring secure handling of sensitive data and creating non-visible application behavior.

Security and Maintainability Highlights:

- Encapsulation ensures the client only receives results from backend-evaluated guesses, not the answers themselves.
- A RESTful API with distinct endpoints routes and controls client requests, preventing direct database access.
- Frontend inputs undergo validation before reaching the server, reducing vulnerabilities.
- Despite its monolithic setup, the Node.js server operates statelessly.
- Pool connections between the Node.js server and PostgreSQL database enable fault tolerance against load spikes by parallelizing requests and setting connection limits.
- Frontend values undergo parameterization by backend logic, mitigating SQL injection risks.


## Directory Overview
`/Client`

Frontend files for the React, the game UI.

  - `/dist`: Webpack & Babel generated bunndles passed to Node.js to serve.  Not in repository. Created upon `npm start`

  - `/src`: React components Babel compiles and Webpack bundles for distribution. Reduces footprint and promotes backward browser compatiblity.

`/Server`

Backend files for Node.js server, Socket.io server, and PostgreSQL database.

 - `/controller`: Functions coordinating operations between client requests and model functions for database interaction. Validates and transforms data before passing to model or responding to client.

 - `helper.js`: Houses reusable helper functions for generating guess results, hints, and random answers using the Random.org API.

 - `/db`: Establishes a pool connection to the PostgreSQL database. Contains functions responsible for creating the database and games table.

- `/model`: Functions parameterizing frontend values and executing CRUD operations through database queries.

- `index.js`: Node.js server for routing requests and serving the React client.

- `routes.js`: Definitions for RESTful API endpoints, routing requests from the Node.js server to the appropriate controller functions.

- `socket.js`: Logic for the Socket.io server to support synchronous multiplayer.

## Implemented Extensions
### :mag: Give Hints
- Provides three dynamically generated hints:
  - First digit in the answer.
  - Last digit in the answer.
  - Sum of all digits in the answer.

### :zap: Configurable Difficulty Level
- Players can choose from three difficulty levels:
  - 4 = Normal (4 digits).
  - 5 = Veteran (5 digits).
  - 6 = Nightmare (6 digits).

The default difficulty level is 4, but players can adjust it during game creation. When joining a game, the difficulty level reflects the setting when the game was created.

### :chart: High Scores
- Displays the top 5 completed games for each difficulty level.
- Sorted by the number of attempts made before solving the game.
- Click the "High Score" button to refresh the list.

### :couple: Asychronous Multiplayer Game Mode ("pvp1")

- Players can create games with user-generated answers.
- Unique game IDs are dynamically generated by backend for sharing with other players. So players can play at later time.
- Results are recorded, preventing re-attempts of previously played games.

### :fire: Sychronous Multiplayer Game Mode ("pvp2")

In "pvp2" mode, players engage in real-time gameplay facilitated by websockets through Socket.IO. Here's how it works:

- A player, known as the "Encoder," creates a game room and sets a user-generated answer.
- Another player, the "Decoder," can join the room in real time to start the game.
- The Decoder takes turns making guesses, and the backend informs the Encoder of the result.
- The Encoder can then respond to the guess accordingly.
- The game proceeds for a maximum of 10 turns, concluding either when the Decoder correctly guesses the answer or when they exhaust their allotted turns.

### :joy: Lie / Call Bluff

- In "pvp2" mode, the game creator ("Encoder") can choose to tell the truth or lie about the guess made by the other player ("Decoder").
- If the Encoder lies, an inaccurate result is sent to the Decoder.
- The Decoder can call the bluff if they suspect a lie, ending the game in their favor if the call is accurate.
- Winning this way requires the Decoder to call bluff on the specific turn a lie was sent, not if the Encoder has lied previously.

### :interrobang: Disconnection Detection
- In "pvp2" mode, disconnection from the server prompts an event to update the UI and end the game for remaining players.

### :star2: Socket.IO ADMIN UI Dashboard
- Administrators can access a dashboard at https://admin.socket.io
- Server URL is "http:localhost:3010" by default.
- All connected games (rooms), players (sockets), and event can be monitored in real time.
- More information about the Socket.IO ADMIN UI can be found [here](https://socket.io/docs/v4/admin-ui/).
- Authorization to access is turned off for demo and ease of use. Change if not deployed locally.