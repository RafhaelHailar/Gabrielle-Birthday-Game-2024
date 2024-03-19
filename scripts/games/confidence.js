import { addKeyDownHandler, addKeyUpHandler } from "../eventHandlers.js";
import { context } from "../screen.js";
import { SchedulesHolder, TimeoutBuilder } from "../timer.js";
import PlayerStats from "../player.js";
import Game from "./Game.js";

// get the schedules of the game.
const schedules = new SchedulesHolder();

// player statistics
const playerStats = new PlayerStats();
playerStats.setAttentionSpan(0.5);

// game screen
let GameScreen;

// images
let Images;

class Rectangle {
/*
 * Create a rectangle use for drawing
 *
 * @param {number} x The x position of rectangle.
 * @param {number} y The y position of rectangle.
 * @param {number} width The size of rectangle in width.
 * @param {number} height The size of rectangle in height.
 * @param {string} color The color of rectangle.
 */
    constructor(x,y,width,height,color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
    
    // draw the rectangle in the screen.
    draw() {
        if (this.type) {
            let image = Images.annoyedCat;

            switch (this.type) {
                case "normal":
                    image = Images.smileCat;
                    break;
                case "skipping":
                    image = Images.stillCat;
                    break;
                case "speederD":
                    if (this.color == "cyan") image = Images.annoyedCat;
                    else image = Images.seriousCat;
                    break;
            }
            context.drawImage(image,this.x + GameScreen.x,this.y + GameScreen.y,this.width,this.height);
        } else if (this instanceof Player) {
            if (this.image)
                context.drawImage(this.image,this.x + GameScreen.x,this.y + GameScreen.y,this.width,this.height);
        }else {
            context.fillStyle = this.color;
            context.fillRect(this.x + GameScreen.x,this.y + GameScreen.y,this.width,this.height);
        }
    }
}


class MovableRect extends Rectangle {
/*
 * Create a rectangle that can move.
 *
 * @params - the same as 'Rectangle class'.
 */
    constructor(x,y,width,height,color) {
        super(x,y,width,height,color);
        this.velocityX = 0; // how fast the rectangle moves in horizontally.
        this.velocityY = 0; // how fast the rectangle moves in vertically. 
    }

    // update the position of the rectangle and draw it. + GameScreen.y
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;

        this.draw();
    }
}

class Player extends MovableRect {
/*
 * Create our rectangle player.
 *
 * @params - similar to 'Rectangle class'.
 */
    constructor(x,y,width,height,color) {
        super(x,y,width,height,color);
        this.receivingDamage = false; // whether the player collides with blocks, if it collide then it was receiving damage.
        this.isSafeId = null; // id of the timeout, when will the player be safe.
        
        const normalImage = new Image();
        normalImage.src = "../../images/player-normal-game-2.jpg";
        this.normalImage = normalImage;

        const damageImage = new Image();
        damageImage.src = "../../images/player-damage-game-2.jpg";
        this.damageImage = damageImage;

        this.image = this.normalImage;

    }

    // set whether the player is receiving damage or not.
    setReceivedDamage(value) {
        this.receivingDamage = value;
    }


    // Cause the player to be damage, reducing the 'confidence' stats of the Player.
    // After sometime of getting damaged, if the player is not getting damage anymore,
    // it set whether we receive damage to false, unless we keep getting damage.
    damage() {
        Confidence.value -= 0.0002;

        this.color = "white";
        this.image = this.damageImage;
        if (this.isSafeId != null) {
            clearTimeout(this.isSafeId);
        }

        this.isSafeId = setTimeout(() => {
            this.color = "orange";
            this.image = this.normalImage;
            this.setReceivedDamage(false);
        },300);

        this.setReceivedDamage(true);
    }

    /* 
     * Changes our velocities base on the key that is being press.
     *
     * @param {string} keysDown The key that is pressing.
     */
    updateVelocity(keysDown) {
       const VELOCITY = 2;

       if (keysDown.a) this.velocityX = -VELOCITY;
       if (keysDown.d) this.velocityX = VELOCITY;
       if (keysDown.w) this.velocityY = -VELOCITY;
       if (keysDown.s) this.velocityY = VELOCITY;

       if (!keysDown.a && !keysDown.d) this.velocityX = 0;
       if (!keysDown.s && !keysDown.w) this.velocityY = 0;
    }

    /*
     * Update the player velocity, position and draw it.
     *
     * @param {string} keysDown They key that is pressing.
     */
    update(keysDown) {
        this.updateVelocity(keysDown); 
        super.update();
    }
}

class Block extends MovableRect {
/*
 * Creates a block, a moving object in the game, where the player should avoid to not get a damage.
 *
 * @params [x - color] - similar to 'Rectangle class'
 * @param {string}["normal" | "skipping" | "speederD"] type The type of the block that is being create.
 * @param {string}["a"|"b"|"c"|"d"] subtype The different versions of the type of the block, it tells how fast is that type, a is the fastest and d is the slowest.
 * @param {number} extentBuffer It adds to how far should be the block to tell whether it is out of the screen.
 * @param {number} otherBlockDistance The space between this block and other block in blocks.
 */
    constructor(x,y,width,height,color,type,subtype,extentBuffer = 0,otherBlockDistance = null) {
       super(x,y,width,height,color); 
       this.velocityX = 0;

       switch (type) {
           case "normal":
               switch (subtype) {
                    case "a":
                        this.velocityX = 1;
                        break;
                    case "b":
                        this.velocityX = 0.6;
                        break;
                    case "c":
                        this.velocityX = 0.4;
                        break;
                    case "d":
                        this.velocityX = 0.2;
                        break;
                    default:
                       throw new Error(`Block subtype of ${type}: ${subtype} is not a valid subtype`);
               }
               break;
           case "skipping":
                switch (subtype) {
                    case "a":
                        this.velocityX = 6;
                        break;
                    case "b":
                        this.velocityX = 4;
                        break;
                    case "c":
                        this.velocityX = 2;
                        break;
                    default:
                       throw new Error(`Block subtype of ${type}: ${subtype} is not a valid subtype`);
               }
               break;
           case "speederD":
               this.incrementing = 0;
               switch (subtype) {
                   case "a":
                        this.incrementSpeed = 0.06;
                        break;
                   case "b":
                        this.incrementSpeed = 0.02;
                        break;
                   default:
                       throw new Error(`Block subtype of ${type}: ${subtype} is not a valid subtype`);

               }
       }

       // this.velocityX = 0;
       this.prevVelocityX = this.velocityX; // the initial velocity of the block, for resetting the velocity of it.
       this.type = type;
       this.subtype = subtype;
       this.extentBuffer = extentBuffer;
       this.prevY = y; // the initial y position of the block, it was added with 'screenY' to move the block when the player is going up.
       this.otherBlockDistance = otherBlockDistance;

    }

    /*
     * Check whether an object collide with the block.
     *
     * @param { object } object The object that we are going to check to collision to.
     */
    isCollideWith(object) {
       return !((this.x > object.x + object.width) || (this.x + this.width < object.x) || (this.y > object.y + object.height) || (this.y + this.height < object.y)); 
    }

    // Check whether the block is out of the screen to the right, if it is put it back to the left of the screen.
    logic() {
        if (this.type != "speederD") {
            if (this.x > GameScreen.width + this.otherBlockDistance + this.extentBuffer) {
                this.x = -this.extentBuffer;
            }
        }
    }

    // change the horizontal velocity of the block.
    updateVelocity() {
        switch (this.type) {
            case "skipping": 
                this.velocityX *= 0.998;
                if (this.velocityX < 1) this.velocityX = this.prevVelocityX;
                break;
        }
    }

    /*
     * Update the velocity, position and checks for collision, then draw the block.
     *
     * @param {number} screenY How much is the screen moves vertically, when the player goes up or down.
     */
    update(screenY) {
        this.updateVelocity();

        if (this.type == "speederD") {
            this.x = (GameScreen.width / 2 - this.width / 2) + Math.cos(this.incrementing) * 300 * Math.cos(this.incrementing * 0.1);
            this.incrementing += this.incrementSpeed;
            if (this.incrementing >= 360) {
                this.incrementing = 0;
            }
        }

        this.y = this.prevY + screenY;
        this.logic();
        this.draw();

        super.update();
    }
}

class Blocks {
/*
 * Create a collection of block.
 *
 * @param {string}["normal"|"skipping"|"speederD"] type The type of the block.
 * @param {string}["a"|"b"|"c"|"d"] subtype Tells how fast the type is.
 * @params [x - color] similar to 'Rectangle class'.
 */
    constructor(type,subtype,x,y,width,height,color) {
        this.blocks = []; // collection of blocks.
        
        let totalBlock; // how many block to create
        let spacing; // how far each blocks is from each other.

        switch (type) {
            case "normal":
            case "skipping":
                totalBlock = 5;
                spacing = GameScreen.width * 0.2; // 20% of the screen width.
                // since, we know that the width of each block is 10% of the screen,
                // and there's a total of 5 of them, so we have 50% of width already taken by blocks,
                // then additional 20% for each space between blocks and there's 4 of those 40%,
                // so we have 80% for each space, now we have a total of 130% width taken by blocks,
                // now we know that the total width of blocks exceed the width of the screen,
                // since the width of the screen is 100%.
                // To get the the extent buffer we reduce the width of the screen to it, to get the total exceeding amount,
                // and divide it by 2 to get the extent in both left and right side.
                // so we have 130% - 100% = 30% / 2 = 15%.
                // 15% space for each side of the screen.
                // 15% 100% 15% = 130%.
                let extentBuffer = ((width * totalBlock + spacing * (totalBlock - 1)) - GameScreen.width) / 2;

                for (let i = 0;i < totalBlock;i++) {
                   const block = new Block(
                       // the starting x will be a space less than the extentBuffer.
                       // to not make the rightmost block to go back immediatey or go the the -extentBuffer because , it starts with the
                       // a distance exceeding the extentBuffer.
                       -extentBuffer + ((spacing + width) * i),
                       y,
                       width,
                       height,
                       color,
                       type,
                       subtype,
                       extentBuffer,
                       spacing,
                   );
                   this.blocks.push(block);
                }
                break;
            case "speederD":
                const blockD = new Block(
                    x + GameScreen.width / 2 - width / 2,
                    y,
                    width,
                    height,
                    "cyan",
                    type,
                    subtype,
                    0
                );
                const blockA = new Block(
                    x + GameScreen.width / 2 - width / 2,
                    y,
                    width,
                    height,
                    "violet",
                    type,
                    subtype,
                    0
                );
                blockA.incrementing = 355;
                this.blocks.push(blockD);
                this.blocks.push(blockA);
                break;

        }
    }
}

class Confidence extends Game {
    
    // the total amount of 'confidence' that will be set to the Player stats.
    static value = 1;

    constructor() {
        // add the action that will be perform when the game ends.
        // gamelength, callback
        super(80000,function(){
            playerStats.setConfidence(Confidence.value); 
        }); 

        // the size and position of the game screen.
        GameScreen = {
            y: 0,
            width: canvas.width * 0.3,
            height: canvas.height
        };
        GameScreen.x = canvas.width / 2 - (GameScreen.width / 2);

        Images = {};

        const catImages = ["annoyed","serious","smile","still"];
        for (let catImage of catImages) {
            let image = new Image();
            image.src = `../../images/cat-${catImage}-cute-rectangle-game-2.png`;
            Images[catImage + "Cat"] = image;
        }

        Images.background = new Image();
        Images.background.src = "../../images/game-2-bg.jpg";
        
        Images.house = new Image();
        Images.house.src = "../../images/squirrel-house-game-2.png";

        // the player width and height
        const PLAYERWIDTH = GameScreen.width * 0.12;
        const PLAYERHEIGHT = GameScreen.width * 0.13;
        // create the player.
        this.player = new Player(GameScreen.width / 2,GameScreen.height -PLAYERHEIGHT-200,PLAYERWIDTH,PLAYERHEIGHT,"orange");

        // check whether a particular key is being pressed.
        this.KEYSDOWN = {
            a: false,
            d: false,
            w: false,
            s: false
        };
        
        // holds differnet types of blocks
        this.blocks = {
            normals: [
               new Blocks("normal","d",10,200,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
               new Blocks("normal","c",10,-500,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
               new Blocks("normal","d",10,-700,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
               new Blocks("normal","b",10,-1900,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
               new Blocks("normal","b",10,-2300,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
               new Blocks("normal","b",10,-2500,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
               new Blocks("normal","b",10,-2900,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
               new Blocks("normal","b",10,-3100,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
               new Blocks("normal","a",10,-3600,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
               new Blocks("normal","a",10,-3800,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
               new Blocks("normal","a",10,-5000,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
               new Blocks("normal","a",10,-6000,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"), 
            ],
            skippings: [
                new Blocks("skipping","c",10,-200,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
                new Blocks("skipping","c",10,-1400,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
                new Blocks("skipping","c",10,-1600,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
                new Blocks("skipping","b",10,-2700,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
                new Blocks("skipping","b",10,-3300,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
                new Blocks("skipping","a",10,-4000,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
                new Blocks("skipping","a",10,-4200,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
                new Blocks("skipping","a",10,-4600,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
                new Blocks("skipping","a",10,-4800,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
                new Blocks("skipping","a",10,-5800,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
            ],
            speeders: [
                new Blocks("speederD","b",10,-1000,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
                new Blocks("speederD","b",10,-2100,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
                new Blocks("speederD","a",10,-4400,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
                new Blocks("speederD","a",10,-5300,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
                new Blocks("speederD","a",10,-5500,GameScreen.width * 0.1,GameScreen.width * 0.1,"red"),
            ],
            /*
             * Get all of the blocks created.
             *
             * @return { object[] };
             */
            getAll() {
                const result = [];

                for (let i = 0;i < this.normals.length;i++) {
                    const blocksCollection = this.normals[i].blocks;
                    result.push(...blocksCollection);
                }

                for (let i = 0;i < this.skippings.length;i++) {
                    const blocksCollection = this.skippings[i].blocks;
                    result.push(...blocksCollection);
                }

                for (let i = 0;i < this.speeders.length;i++) {
                    const blocksCollection = this.speeders[i].blocks;
                    result.push(...blocksCollection);
                }

                return result;
            }
            
        };

        // the opacity of the blocks
        this.objectsOpacity = 1;

        // contains all the block that is created.
        this.allBlocks = this.blocks.getAll();

        // how much the screen moves vertically when the players move up or down.
        this.screenY = 0;
        
        // the Player 'attention span' stats.
        const attentionSpan = playerStats.getAttentionSpan();
        
        // create a 'Timeout' that will make some changes in the opacity of the blocks, after sometime.
        // how frequent the opacity is reduce is based on the 'attention span' of the Player.
        this.lowAttentionSpanEffectTime = new TimeoutBuilder(()=>{})
        .setDuration(2000 + (attentionSpan * 1000 * 15))
        .setCallback(() => {
            // a 'Timeout' that will reduce the opacity of the blocks continuesly until sometime.
            let beingDistractedTime = new TimeoutBuilder(() => {
                let newOpacity = this.objectsOpacity - 0.1;

                if (newOpacity > 0) this.objectsOpacity = newOpacity;
                else this.objectsOpacity = 0;
            })
            .setCallback(() => {
                this.objectsOpacity = 1;
                this.lowAttentionSpanEffectTime.restart();
            })
            .setDuration(2000)
            .build();

            // set how fast it will reduce the opacity.
            beingDistractedTime.setSpan(100);

            // add it to the scheduler of the game, to perform it.
            schedules.addSchedule(beingDistractedTime); 
        })
        .build();

        super.pause(); // pause the game for introduction modal.
    }

    // resume the game.
    resume() {
        super.resume();
    }

    // Contains the logic of the player.
    logic() {
        const player = this.player;
        // total amount to move the screen.
        const moveScreenY = 2;

        // when the player reach a point above the screen, the game is finished.
        if (player.y < 200) {
            this.isPlayed = true;
        }

        // when the screen is not yet moved down at target point.
        // move the screen down, when the player reached some point moving up.
        if (this.screenY < 6400 && player.y < GameScreen.height / 2) {
            this.screenY += moveScreenY;
            this.player.y = GameScreen.height / 2;
        }

        // when the screen is moved down and the player reached to bottom of the screen,
        // move the screen up.
        if (this.screenY > 0 && player.y + player.height > GameScreen.height - 200) {
            this.player.y = GameScreen.height - player.height - 200;
            this.screenY -= moveScreenY;
        }

        // creates the collission detection of the player in the left and right side of the screen.
        if (player.x < 0) {
            this.player.x = 0;
        }

        if (player.x + player.width > GameScreen.width) {
            this.player.x = GameScreen.width - player.width;
        }

        // collission detection when the player reached the bottom of the screen, and still moving down.
        if (player.y + player.height > GameScreen.height) this.player.y = GameScreen.height - player.height;
        

        // checks the collission detection of each blocks to the player, if they collide with it damage the player. 
        for (let i = 0;i < this.allBlocks.length;i++) {
            const block = this.allBlocks[i];
            if (block.isCollideWith(this.player)) {
               this.player.damage();
            }
        }
    }

    /*
     * Tells to the game that a specific key is being pressed, and unset the opposite key to being pressed.
     *
     * @param {string} key The key that is being pressed.
     */
    setKeyDown(key) {
        switch (key) {
            case "a":
                this.KEYSDOWN.d = false;
                this.KEYSDOWN.a = true;
                break;
            case "d":
                this.KEYSDOWN.a = false;
                this.KEYSDOWN.d = true;
                break;
            case "w":
                this.KEYSDOWN.s = false;
                this.KEYSDOWN.w = true;
                break;
            case "s":
                this.KEYSDOWN.w = false;
                this.KEYSDOWN.s = true;
                break;
        }
    }

    /*
     * Tells the game that a specific key is now no longer being pressed.
     * 
     * @param {string} key The key that is no longer being pressed.
     */
    setKeyUp(key) {
        this.KEYSDOWN[key] = false;
    }

    // set the action / scenario that the game have to keep track when it happens,
    // and handle it with a specific action.
    addHandlers() {
       function keyDownHandler(event) {
           this.setKeyDown(event.key);
       }

       addKeyDownHandler(keyDownHandler.bind(this));

       function keyUpHandler(event) {
           this.setKeyUp(event.key);
       }

       addKeyUpHandler(keyUpHandler.bind(this));
    }

    // Check for the collissions, update the 'Timeout's, then update the player and blocks position and draws them.
    update() {
        super.update(() => {
            this.logic();
            this.lowAttentionSpanEffectTime.update();

            // remember the drawing state of the game.
            context.save();
            
            // set the opacity of the drawings.
            context.globalAlpha = this.objectsOpacity;
            this.allBlocks.forEach(block => block.update(this.screenY));

            context.restore();
            // reset the drawing state of the game, from what it remembers. Successfully not affecting the opacity of other drawings.

            // update the player, and passed in the keys that is being pressed or not.
            this.player.update(this.KEYSDOWN);

            // outer walls 
            // for hiding the things that go over the path width
            context.drawImage(
                Images.background,
                0, // image source x
                0, // image source y
                // image source width
                Images.background.width - Images.background.width * ((canvas.width / 2 + GameScreen.width / 2) / canvas.width),
                //image source height
                Images.background.height,
                // canvas properties
                0,
                0,
                canvas.width / 2 - GameScreen.width / 2,
                canvas.height
            );
            context.drawImage(
                Images.background,
                // image source x
                Images.background.width * ((GameScreen.width / 2 + canvas.width / 2) / canvas.width), //Images.background.width - Images.background.width * (GameScreen.width / canvas.width),
                // image source y
                0,
                // image source width
                Images.background.width,
                // image source height
                Images.background.height,
                // canvas properties
                canvas.width / 2 + GameScreen.width / 2,
                0,
                canvas.width,
                canvas.height
            );

            // the house at the end.
            if (this.screenY == 6400) 
            context.drawImage(Images.house,GameScreen.x + GameScreen.width / 2 - GameScreen.width * 0.5 / 2,-GameScreen.width * 0.1,GameScreen.width * 0.5,GameScreen.width * 0.5);
        });

        context.fillStyle = "red";
        context.font = "40px Monospace";
        context.fillText(`Screen Level: ${this.screenY}`,canvas.width * 0.12,canvas.height * 0.4);
        context.fillText(`Attention Span: ${Math.floor(playerStats.getAttentionSpan() * 100)}%`,canvas.width * 0.15,canvas.height / 2 - 30); 
        context.fillText(`Confidence: ${Math.floor(Confidence.value * 100)}%`,canvas.width * 0.13,canvas.height / 2 + 15); 
    }
}

export default Confidence;
