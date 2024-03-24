import { TimeoutBuilder } from "../timer.js";
import { context } from "../screen.js";
import SoundHandler from "../sound.js";

class Game {
/*
 * Games parent class, contains the timer and update the current game.
  
 * @param {number} length The length of the game in milliseconds / ms.
 * @param {function} callback The action that will be perform after each games.
 */
    constructor(length,callback) {
        this.isPlayed = false;
        const GAMELENGTH = length;
        this.gameTime = new TimeoutBuilder(
            function() {
                const counter = Math.floor(this.endCounter / 1000);
                const end = Math.floor(GAMELENGTH / 1000);
                context.fillStyle = "#FF3333";
                context.font = "70px Arial";
                context.fillText(`${counter.toString().padStart(2,"0")} / ${end}`,canvas.width * 0.9,canvas.height * 0.1);
        })
        .setDuration(GAMELENGTH)
        .setCallback(() => {
            this.isPlayed = true;
            callback();
        }).build();

        // tells whether the game is running or not.
        // at start the game was at paused, because of the instruction then continue after the player decided to start.
        this.isRunning = false;

        this.hasRun = false; // tells whether the game run already run before, for the instructions modal.
        
        // sound handler
        this.sound = new SoundHandler();
    }

    // run the game, after the instructions modal.
    run() {
        this.hasRun = true;
        this.sound.setIsPlayable(true);
        this.resume();
    }

    // their names tell what they do.
    pause() {
        this.isRunning = false;
    }

    resume() {
        this.isRunning = true;
        this.sound.setFrameIsPlayState(true);
    }

    // reset the game
    restart() {
        this.isPlayed = false;
        this.hasRun = false;
        this.gameTime.restart();
        this.pause();
    }

    // end the game
    end() {
       this.gameTime.end(); 
    }

    /*
     * Update the current game
     *
     * @param {function} action The action of the current game that will be perform.
     */
    update(action) {
        if (this.isPlayed) return;

        if (this.isRunning) {
            action();
            this.gameTime.update();
        }
    }
}

export default Game;
