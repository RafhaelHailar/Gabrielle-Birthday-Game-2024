import { canvas, context } from "../screen.js";
import { addClickHandler, removeClickHandler } from "../eventHandlers.js";
import { TimeoutBuilder } from "../timer.js";
import PlayerStats from "../player.js";
import Game from "./Game.js";
import SoundHandler from "../sound.js";
import ImageHolder from "../image.js";

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

        const Types = {
            SAFE: ["car-toy","teddy-bear"],
            DANGER: ["cellphone"]
        };
        this.color = type == "SAFE" ? "#ADD8E6" : "rgb(255,76,48)";
        
        const imageCollection = Types[type];

        const imageName = imageCollection[Math.floor(Math.random() * imageCollection.length)];

        // the item name
        this.name = imageName.split("-")[0];

        // add it to the attention items information.
        Attention.Collections[this.name].total++;

        this.imageSrc = ImageHolder[imageName.toUpperCase().replace(/-/g,"_") + "_GAME_1"];

        this.width = width * 1.5; 
        this.height = this.imageSrc.width / this.imageSrc.height * this.width;
        
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
        
        this.attachClick(); // add the handler.
    }

    // attach click handler.
    attachClick() {
        // create the click handler.
        const handleClick = this.manageClick.bind(this);
        this.handlerId = addClickHandler(handleClick, { target: this });
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

        // add it to the attention items information.
        Attention.Collections[this.name].clicked++;

        const sound = new SoundHandler();
        sound.play(`./sounds/${this.type.toLowerCase()}-click-game-1.mp3`,{
            volume: 0.2
        });
    }

    // Remove the rectangle.
    remove() {
        if (!this.isToRemove) 
            removeClickHandler(this.handlerId);

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

    // information about the items that shows up.
    static Collections; 

    static startCollections() {
        Attention.Collections = {
            car: {
                total: 0,
                clicked: 0
            },
            teddy: {
                total: 0,
                clicked: 0
            },
            cellphone: {
                total: 0,
                clicked: 0
            },
        };
    }

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
        
        Attention.startCollections();
    }	

    // resume the game.
    resume() {
        // re add the handlers.
        this.reAttachClickHandlers();

        super.resume();
    }

    // restart the game
    // resetting the 'Timeout's', 'Collection of rectangle', and 'Player' game stat.
    restart() {
        super.restart();
        this.rectsSpawnTime.restart();
        this.rects = [];
        this.resetToBeRemoveRects();
        this.attentionSpan = 1;

        Attention.startCollections();
    }

    // re attach click handler after pausing, because pause is another frame, and moving to another,
    // frame will remove every handler from previous frame, therefore we will do re attachment.
    reAttachClickHandlers() {
       this.rects.forEach(rect => rect.attachClick()); 
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

        // change the speed of the sound base on the current game time.
        this.sound.setSpeed(0.8 + (currentRatio * 0.2));
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

            this.rectsSpawnTime.update();

            this.finalizeRemoveRects();
        });
        
        context.fillStyle = "red";
        context.font = "30px Monospace";
        context.fillText(`Attention Span: ${(this.attentionSpan * 100).toFixed(2)}%`,canvas.width * 0.15,canvas.height / 2);
    }
}

export default Attention;
