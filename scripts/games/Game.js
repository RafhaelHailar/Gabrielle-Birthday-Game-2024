import { TimeoutBuilder } from "../timer.js";
import { context } from "../screen.js";

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
        this.isRunning = true;
    }

    // their names tell what they do.
    pause() {
        this.isRunning = false;
    }

    resume() {
        this.isRunning = true;
    }

    // reset the game
    restart() {
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
        action();

        if (this.isRunning)
            this.gameTime.update();
    }
}

export default Game;
