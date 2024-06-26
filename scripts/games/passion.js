import { context } from "../screen.js";
import { Cursor, addClickHandler, addUnClickHandler, addMouseMoveHandler } from "../eventHandlers.js";
import PlayerStats from "../player.js";
import { SchedulesHolder, TimeoutBuilder } from "../timer.js";
import Game from "./Game.js";
import ImageHolder from "../image.js";

const schedules = new SchedulesHolder();
const playerStats = new PlayerStats();


class DrawingBoard {
/*
 * Creates the drawing board of the game, contains all the item that is being drawn.
 */
    constructor() {
        this.width = canvas.width * 0.4;
        this.height = canvas.height * 0.8;
        this.x = canvas.width / 2 - this.width / 2 - 100;
        this.y = canvas.height / 2 - this.height / 2;
        this.color = "white";

        // the items or the collection of lines.
        // lines are collection of points.
        this.items = [[]];

        this.isDrawing = false; // tells whether we are drawing on the board.
        this.isAllowDraw = true; // tells whether we are able to draw on the board.
    }

    // Draw the points in the screen, and connect the points of the lines, to draw the lines.
    drawItems() {
        const items = [];
        for (let i = 0;i < this.items.length;i++) {
            items.push(...this.items[i]);
        }

        context.fillStyle = "black";
        items.forEach(item => {
            const POINTSIZE = 0.7;
            context.beginPath();
            context.arc(item.x,item.y,POINTSIZE,0,Math.PI * 2);
            context.fill();
        });

        for (let i = 0;i < this.items.length;i++) {
            const items = this.items[i];
            context.beginPath();
            context.lineWidth = 4;

            if (items.length > 0) 
                context.moveTo(items[0].x,items[0].y);
            
            for (let j = 1;j < items.length;j++) {
                const item = items[j];
                context.lineTo(item.x,item.y);
            } 
            context.stroke();
        }
    }

    // set whether we are drawing or not.
    setIsDrawing(isDrawing) {
        this.isDrawing = isDrawing;
    }

    // set whether we are allowed to draw or not.
    setIsAllowDraw(isAllow) {
        this.isAllowDraw = isAllow;
    }

    /*
     * Check whether the mouse is on the board.
     *
     * @params {number} x The x position of the mouse.
     * @params {number} y The y position of the mouse.
     * 
     * @return {boolean}
     */
    isOn(x,y) {
        return x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height;
    }

    /*
     * Add a point in the current line, the current collection of points.
     * 
     * @params {number} x The x position of the mouse.
     * @params {number} y The y position of the mouse.
     */
    addItem(x,y) {
        if (!this.isAllowDraw || !this.isDrawing) return;
        this.items[this.items.length - 1].push({x,y});
    }

    // creating a new collection of points, or lines.
    createNewDrawing() {
        this.items.push([]);
        this.setIsDrawing(false);
    }

    // drawing the board, the lines, and points.
    draw() {
        context.fillStyle = this.color;
        context.fillRect(this.x,this.y,this.width,this.height);
        this.drawItems();
    }

    // remove every drawing
    clear() {
        this.items = [[]];
    }

    update() {
        this.draw();
    }
}

class Passion extends Game{

    // the resulting drawing board, for whenever player want to download what they draw.
    static drawingResult = null;

    constructor() {
        //gamelength, callback
        super(100000,() => {
            this.drawingBoard.update(); 

            // get the result of the drawing board.
            const drawingBoardResult = context.getImageData(this.drawingBoard.x,this.drawingBoard.y,this.drawingBoard.width,this.drawingBoard.height);
            const tempCanvas = document.createElement("canvas");
            const tempContext = tempCanvas.getContext("2d");

            tempCanvas.width = this.drawingBoard.width;
            tempCanvas.height = this.drawingBoard.height;

            tempContext.putImageData(drawingBoardResult,0,0);

            const resultImg = new Image();
            resultImg.src = tempCanvas.toDataURL();

            Passion.drawingResult = resultImg;
        });

        // create the drawing board.
        this.drawingBoard = new DrawingBoard();

        // the image that have to be drawn.
        const toDrawImgSrc = ImageHolder.TO_DRAW_GAME_3;
        this.toDrawImgSrc = toDrawImgSrc;

        const can = document.createElement("canvas");
        const ctx = can.getContext("2d");

        can.width = canvas.width;
        can.height = canvas.height;

        ctx.drawImage(toDrawImgSrc,this.drawingBoard.x,this.drawingBoard.y,this.drawingBoard.width,this.drawingBoard.height);

        let epx = ctx.getImageData(this.drawingBoard.x,this.drawingBoard.y,this.drawingBoard.width,this.drawingBoard.height); 
        this.drawingBoard.setIsDrawing(true);

        let px = epx.data;

        for (let y = 0;y < this.drawingBoard.height - 100;y++) {
            for (let x = 0;x < this.drawingBoard.width;x++) {
                const r = px[(y * this.drawingBoard.width + x) * 4];
                const g = px[(y * this.drawingBoard.width + x) * 4 + 1];
                const b = px[(y * this.drawingBoard.width + x) * 4 + 2];
                
                if (r == 0 || g == 0 || b == 0) {
            //      this.drawingBoard.addItem(this.drawingBoard.x + x,this.drawingBoard.y + y);
            //      this.drawingBoard.createNewDrawing();
                   this.drawingBoard.setIsDrawing(true);
                }
            }
        }

        this.drawingBoard.setIsDrawing(false);
        

        // the image the will be shown in the drawing board.
        this.distractionImgSrc = ImageHolder.DISTRACTION_GAME_3;

        // the opacity of the distraction image.
        this.distractionOpacity = 0;

        const playerAttentionSpan = playerStats.getAttentionSpan();
        
        // 'Timeout' for showing the distracting image.
        this.distractionImgTime = new TimeoutBuilder(() => {})
        .setDuration(1500 + (playerAttentionSpan * 10 * 2000))
        .setCallback(() => {
            let increaseOpacityTime = new TimeoutBuilder(() => {
                if (this.distractionOpacity < 1)
                    this.distractionOpacity += 0.1;
            })
            // the more attention span the 'Player' has the faster the distration image will be remove.
            .setDuration(4000 - (2000 * playerAttentionSpan))
            .setCallback(() => {
                this.distractionOpacity = 0;
                this.distractionImgTime.restart();
            })
            .build();

            increaseOpacityTime.setSpan(100);
            
            schedules.addSchedule(increaseOpacityTime);
        })
        .build();

        const playerConfidence = playerStats.getConfidence();
        // 'Timeout' for disallowing drawing.
        this.disallowDrawTime = new TimeoutBuilder(() => {})
        // the lower the confidence the faster it will be disallow drawing
        // 10 seconds is fastest, 15 seconds is slowest
        .setDuration(10000 + (playerConfidence * 5000))
        .setCallback(() => {
            this.drawingBoard.setIsAllowDraw(false);
            const allowDrawingTime = new TimeoutBuilder(() => {})
            // the higher the confidence the fastest it will alow the drawing back.
            // 3 seconds is slowest, 1 seconds is fastest.
            .setDuration(3000 - (playerConfidence * 2000))
            .setCallback(() => {
                this.drawingBoard.setIsAllowDraw(true)
                this.disallowDrawTime.restart();
            })
            .build();

            schedules.addSchedule(allowDrawingTime);
        })
        .build();
        
        // this.cursor
        this.cursor = new Cursor();
    }

    // end the current game.
    endGame() {
        if (!this.isRunning) return;
        this.end();
    }

    // restart the game.
    restart() {
        super.restart();

        this.distractionImgTime.restart();
        this.disallowDrawTime.restart();

        this.drawingBoard.clear();
    }
     
    // make the game keep track of the event or action that is happening, and call the appropriate actions.
    addHandlers() {
        /*
         * Handler for when the mouse is clicked or pressed. If we are on the board tells the game that we are drawing in it, and add a point where we clicked.
         *
         * @params {number} x The x position of the mouse.
         * @params {number} y The y position of the mouse.
         */
        function handleClick({x,y}) {
            this.drawingBoard.setIsDrawing(true);

            // to put the tip of the pencil to x and y.
            y = y - this.cursor.height / 2;
            x = x - this.cursor.width / 2;

            if (this.drawingBoard.isOn(x,y))
                this.drawingBoard.addItem(x,y);
        }

        addClickHandler(handleClick.bind(this),{target: this.drawingBoard});

        function handleUnClick(event) {
            console.log(event.clientX,event.clientY); 

            this.drawingBoard.createNewDrawing();
        }

        addUnClickHandler(handleUnClick.bind(this));

        function handleMove(event) {
            // to put the tip of the pencil to x and y.
            const x = event.clientX - this.cursor.width / 2;
            const y = event.clientY - this.cursor.height / 2;

            if (this.isRunning && this.drawingBoard.isOn(x,y)) {
                this.cursor.setType("pencil");
                this.drawingBoard.addItem(x,y);
            } else {
                this.drawingBoard.setIsDrawing(false);
                this.cursor.setType("hand");
            }
        }

        addMouseMoveHandler(handleMove.bind(this));

        this.cursor.setType("pencil");
    }

    // draws the image that have to be drawn, and the board.
    update() {
        super.update(() => {
            this.drawingBoard.update();

            if (this.toDrawImgSrc) {
                // to draw image canvas position and dimension.
                const x = this.drawingBoard.x + this.drawingBoard.width + 5;
                const y = this.drawingBoard.y;
                const size = canvas.width * 0.18;
                context.drawImage(this.toDrawImgSrc,x,y,size,size);

                // to draw image border 
                const offset = 0;
                context.strokeStyle = "red";
                context.strokeRect(x - offset,y - offset,size + offset * 2,size + offset * 2); 
            }

            if (this.distractionImgSrc) {
                context.save();
                context.globalAlpha = this.distractionOpacity;
                context.drawImage(this.distractionImgSrc,this.drawingBoard.x,this.drawingBoard.y,this.drawingBoard.width,this.drawingBoard.height);
                context.restore();
            }

            if (playerStats.getAttentionSpan() < 1)
                this.distractionImgTime.update();

            context.fillStyle = "black";
            context.font = "30px Monospace";
            context.fillText(`Confidence: ${playerStats.getConfidence() * 100}%`,canvas.width * 0.09,canvas.height / 2 - 30);
            context.fillText(`Attention Span: ${playerStats.getAttentionSpan() * 100}%`,canvas.width * 0.1,canvas.height / 2 + 15);

            if (playerStats.getConfidence() < 1)
                this.disallowDrawTime.update();
            // when the drawing is not allowed, show this text.
            if (!this.drawingBoard.isAllowDraw && this.drawingBoard.isOn(this.cursor.x,this.cursor.y)) {
                context.font = "15px Monospace";
                context.fillText("I don't wanna draw, its gonna be terrible anyway.",this.cursor.x,this.cursor.y + 20);
            }
        });
    }
}

export default Passion;
