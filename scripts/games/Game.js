import { TimeoutBuilder } from "../timer.js";
import { context } from "../screen.js";

class Game {
    constructor(length,callback) {
        this.isPlayed = false;
        const GAMELENGTH = length;
        this.gameTime = new TimeoutBuilder(
            function() {
                const counter = Math.floor(this.endCounter / 1000);
                const end = Math.floor(GAMELENGTH / 1000);
                context.fillStyle = "#FF3333";
                context.font = "70px Arial";
                context.fillText(`${counter} / ${end}`,canvas.width - 200,100);
        })
        .setDuration(GAMELENGTH)
        .setCallback(() => {
          //  this.isPlayed = true;
            callback();
        }).build();
    }

    update(action) {
        if (this.isPlayed) return;
        action();
        this.gameTime.update();
    }
}

export default Game;
