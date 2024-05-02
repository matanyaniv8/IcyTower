
# Icy Tower Classic Web Edition

Welcome to the Icy Tower Classic Web Edition! This game is a fun and engaging web adaptation of the popular Icy Tower game, designed to be played on both desktop and mobile devices through touch support. Using HTML, CSS, and JavaScript for the frontend and Node.js for the backend, this game provides a seamless experience across all platforms. The top scores are managed on the server using a JSON file, making it easy to keep track of the best players.
You can Play the game using the render.com website at [render-IcyTower](https://icytower.onrender.com).
## Features

- **Cross-Platform Compatibility:** Play on PC or mobile with full touch support.
- **Real-Time Score Tracking:** Top 10 player scores are stored and updated in real-time on a Node.js server.
- **Engaging User Interface:** Smooth and responsive gameplay designed for all devices.

## Installation

To play the game, simply visit the hosted version on Render.com at the provided URL. If you wish to host the game yourself or contribute to its development, follow these installation steps:

### Prerequisites

- Node.js (v12.0 or higher recommended)
- npm (Node Package Manager)

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/matanyaniv8/IcyTower.git
   cd IcyTower
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   This command will start the Node.js server and serve the game at `http://localhost:3000`.

## Gameplay

Players climb a never-ending tower by jumping from platform to platform without falling. The game increases in difficulty as your score gets higher. After the game ends, your score is compared against the top 10 scores from the `scores.json` file on the server. If your score is high enough, it will be saved to the top 10.

## Score Management

Scores are managed through a JSON file named `scores.json` located on the server. Each time a player finishes a game, the score is sent to the server where it is compared with existing scores. The top 10 scores are then updated if necessary and displayed to the player.

## Hosting

The game is hosted on Render.com, allowing it to be accessible from anywhere and managed efficiently with minimal downtime.

## Support

For support, please raise an issue on the GitHub repository or contact the support email provided on the game's webpage.

## Contributing

Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change. Please make sure to update tests as appropriate.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
