# Circles
Circles is a physics-based point-and-click browser game. The objective is to shoot all the circles with the fewest number of bullets. Here is a [demo video](https://user-images.githubusercontent.com/40542809/212783505-db7de565-3463-44db-bc40-6f1bd9c58adf.mov) of the game.

The game can be played [here](https://johneastman.github.io/circles/)!

## Setup
1. Download and install [Node and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).
1. Install the dependencies
   ```
   npm install
   ```
1. Run the project
   ```
   npm start
   ```
   This will open the app in development mode at [http://localhost:3000](http://localhost:3000). The page will automatically reload as edits are made.

## Tests
```
npm test
```

## Deploy
```
npm run deploy
```

## Project Structure
All source files are in the `src` directory.
* `src/sprites`: anything that is displayed on the canvas
* `src/components`: React components
* `src/game`: miscellaneous TypeScript logic code

Tests are located in the `test` directory.

## Development Notes
Notes about the development process, solutions to encountered errors, etc. can be found in [the wiki](https://github.com/johneastman/circles/wiki#development-notes).
