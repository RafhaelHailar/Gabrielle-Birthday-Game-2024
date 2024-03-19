import { canvas, context } from "../screen.js";
import { addClickHandler } from "../eventHandlers.js";
import { TimeoutBuilder } from "../timer.js";
import PlayerStats from "../player.js";
import Game from "./Game.js";

// statistics of player
const playerStats = new PlayerStats();

class Rectangle {
/*
 * Create a rectangle use for drawing
 * 
 * @param {number} x The x position of rectangle.
 * @param {number} y The y position of rectangle.
 * @param {number} width The size of rectangle in width.
 * @param {number} height The size of rectangle in height.
 * @param {"SAFE" | "BAD"} type Describes what will happen to player 'attention span' if clicked or not clicked.
 *     "SAFE":
 *          - Have to click before it vanished, reduce 'attention span' if vanished without clicking.
 *     "BAD":
 *          - Ignore and don't click, reduce 'attention span' if clicked.
 * @param {number} shrinkSpeed How fast the rectangle shrink.
 */
    constructor(x,y,width,height,type,shrinkSpeed) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;

        this.images = {
            SAFE: ["car-toy","teddy-bear"],
            DANGER: ["cellphone"]
        };
        this.color = type == "SAFE" ? "#ADD8E6" : "rgb(255,76,48)";
        
        const imageCollection = this.images[type];
        const imageName = imageCollection[Math.floor(Math.random() * imageCollection.length)];
        const image = new Image();
        image.src = "../../images/" + imageName + "-game-1.png";
        image.addEventListener("load",() => {
            this.imageSrc = image;
            this.width = width * 1.5; 
            this.height = image.width / image.height * this.width;
        });

        this.isBad = false; // if it will reduce the 'attention span'
        this.spanReduce = type == "SAFE" ? 0.01 : 0.02; // total amount to reduce in the 'attention span' based on type. 

        this.isToRemove = false;

        // a 'Timeout' that will reduce the size of the rectangle until it is gone.
        this.shrinkTime = new TimeoutBuilder(this.shrink.bind(this))
        .setEnder(() => {
            return this.width <= 0 && this.height <= 0;
        })
        .setCallback(() => {
            this.vanished();
        })
        .build();

        this.shrinkTime.span = shrinkSpeed; // how fast it reduce the size of the rectangle
        this.slope = height / width;

        // create the click handler.
        const handleClick = this.manageClick.bind(this);
        addClickHandler(handleClick, { target: this });
    }

    /*
     * Dictate whether this rectangle will reduce 'attention span'
     * or not when it vanished without being clicked.
     * 
     * Then remove the rectangle from the collection.
     */
    vanished() {
        if (this.type == "SAFE") this.isBad = true;
        this.remove();
    }

    /*
     * Dictate whether this rectangle will reduce 'attention span',
     * when clicked.
     *
     * Then remove the rectangle from the collection.
     */
    manageClick() {
        if (this.type == "DANGER") this.isBad = true; 
        this.remove();
    }

    // Remove the rectangle.
    remove() {
        this.isToRemove = true;
    }

    // Reduce the size of the rectangle until it was gone.
    shrink() {
        if (this.width > 0)
            this.width--;

        if (this.height > 0)
            this.height -= this.slope;
    }
    
    draw() {
        context.fillStyle = this.color;
        //context.fillRect(this.x,this.y,this.width,this.height);
        if (this.imageSrc) {
            context.drawImage(this.imageSrc,this.x,this.y,this.width,this.height);
        }
    }

    update() {
        this.shrinkTime.update();
        this.draw();
    }
}

class Attention extends Game{
    constructor() {
        // pass the action that will happen when the game ends.
        // gamelength, callback
        super(60000,() => {
            playerStats.setAttentionSpan(this.attentionSpan); 
        });

        this.rects = []; // the rectangles.
        this.toBeRemoveRects = []; // rectangles that will be removed.
        this.attentionSpan = 1; // player current total attention span.

        // the 'Timeout' for spawning the rectangles
        this.rectsSpawnTime = new TimeoutBuilder(() => this.generateRect()).build();

        // at start the game was at paused, because of the instruction then continue after the player decided to start.
        this.pause();
    }	

    // restart the game
    // resetting the 'Timeout's', 'Collection of rectangle', and 'Player' game stat.
    restart() {
        super.restart();
        this.rectsSpawnTime.restart();
        this.rects = [];
        this.resetToBeRemoveRects();
        this.attentionSpan = 1;
    }


    // Creates a rectangle in a random position
    generateRect() {
        // ratio of current time to end time of the game.
        const currentRatio  = (this.gameTime.endCounter / this.gameTime.duration);

        // the chances of a danger type.
        // minimum of 10%.
        const dangerChance = 0.1 + (currentRatio * 0.4);
        // as the ratio increase the more the danger type as well.
        const type = Math.random() * 1 <= dangerChance ? "DANGER" : "SAFE";

        const SPACEBUFFER = 50;
        const RECTWIDTH = 80;
        const RECTHEIGHT = 110;

        // random position from the buffer to the screen width subtracted by the buffer.
        const randX = Math.random() * (canvas.width - RECTWIDTH - SPACEBUFFER * 2) + SPACEBUFFER;
        const randY = Math.random() * (canvas.height - RECTHEIGHT - SPACEBUFFER * 2) + SPACEBUFFER;

        // how fast the rectangle shrink.
        // minimumum of 1ms.
        const shrinkSpeed = 20 - (19 * currentRatio);

        const rect = new Rectangle(randX,randY,RECTWIDTH,RECTHEIGHT,type,shrinkSpeed);

        // how fast we will spawn rectangle.
        // starting speed of 900 milliseconds/ms.
        // 500ms ending time.
        const spawnTime = 900 - (currentRatio * 500);
        this.rectsSpawnTime.setSpan(spawnTime);

        this.rects.push(rect);
    }

    // Re initialize the collection of rectangles to be removed.
    resetToBeRemoveRects() {
        this.toBeRemoveRects = [];
    }

    // Add the rectangles to be removed.
    propagateToBeRemoveRects() {
        this.resetToBeRemoveRects();
        for (let i = 0;i < this.rects.length;i++) {
            const rect = this.rects[i];

            if (rect.isToRemove) {
                this.toBeRemoveRects.push(rect);
            }
        }
	}

    // Remove the rectangles.
    finalizeRemoveRects() {
        for (let i = 0;i < this.toBeRemoveRects.length;i++) {
            const rect = this.toBeRemoveRects[i];
            const index = this.rects.indexOf(rect);

            if (rect.isBad) this.attentionSpan -= rect.spanReduce;
            
            this.rects.splice(index,1);
        }
    }

    update() {
        super.update(() => {
            this.propagateToBeRemoveRects(); 
            for (let i = 0;i < this.rects.length;i++) {
                const rect = this.rects[i];
                rect.update();
            }

            if (this.isRunning)
                this.rectsSpawnTime.update();

            this.finalizeRemoveRects();
        });
        
        context.fillStyle = "red";
        context.font = "30px Monospace";
        context.fillText(this.rects.length,100,100);
        context.fillText(`Attention Span: ${Math.floor(this.attentionSpan * 100)}%`,canvas.width * 0.15,canvas.height / 2);
    }
}

export default Attention;
