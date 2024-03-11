import { context } from "../screen.js";
import { Cursor, addClickHandler, addUnClickHandler, addMouseMoveHandler } from "../eventHandlers.js";
import PlayerStats from "../player.js";
import { SchedulesHolder, TimeoutBuilder } from "../timer.js";
import Game from "./Game.js";

const schedules = new SchedulesHolder();
const playerStats = new PlayerStats();

// Cursor
const cursor = new Cursor();
cursor.setType("pencil");

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
    }

    // Draw the points in the screen, and connect the points of the lines, to draw the lines.
    drawItems() {
        const items = [];
        for (let i = 0;i < this.items.length;i++) {
            items.push(...this.items[i]);
        }

        items.forEach(item => {
            const POINTSIZE = 0.7;
            context.beginPath();
            context.fillStyle = "black";
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
        if (this.isDrawing) {
            this.items[this.items.length - 1].push({x,y});
        }
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

    update() {
        this.draw();
    }
}

class Passion extends Game{
    constructor() {
        //gamelength, callback
        super(100000,() => {
            console.log("FINISHED!");
        });

        // create the drawing board.
        this.drawingBoard = new DrawingBoard();

        // the image that have to be drawn.
        const toDrawImgSrc = new Image();
        toDrawImgSrc.src = "../../images/ice-cream-drawing.jpg";
        toDrawImgSrc.onload = () => {
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
          //             this.drawingBoard.addItem(this.drawingBoard.x + x,this.drawingBoard.y + y);
           //            this.drawingBoard.createNewDrawing();
                       this.drawingBoard.setIsDrawing(true);
                    }
                }
            }

            this.drawingBoard.setIsDrawing(false);
        }

        // the image the will be shown in the drawing board.
        let distractionSrc = "../../images/monkey-smiling-distraction.jpg";
        const distractionImg = new Image();
        distractionImg.src = distractionSrc;
        distractionImg.onload = () => {
            this.distractionImgSrc = distractionImg;
        }

        this.distractionOpacity = 0;

        const playerAttentionSpan = 0.1;//playerStats.getAttentionSpan();
        
        // 'Timeout' for showing the distracting image.
        this.distractionImgTime = new TimeoutBuilder(() => {})
        .setDuration(1500 + (playerAttentionSpan * 10 * 2000))
        .setCallback(() => {
            let increaseOpacityTime = new TimeoutBuilder(() => {
                if (this.distractionOpacity < 1)
                    this.distractionOpacity += 0.1;
            })
            .setDuration(4000)
            .setCallback(() => {
                this.distractionOpacity = 0;
                this.distractionImgTime.restart();
            })
            .build();

            increaseOpacityTime.setSpan(100);
            
            schedules.addSchedule(increaseOpacityTime);
        })
        .build();


        
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
            y = y - cursor.height / 2;
            x = x - cursor.width / 2;
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
            const x = event.clientX - cursor.width / 2;
            const y = event.clientY - cursor.height / 2;

            if (this.drawingBoard.isOn(x,y)) {
                cursor.setType("pencil");
                this.drawingBoard.addItem(x,y);
            } else {
                this.drawingBoard.setIsDrawing(false);
                cursor.setType("hand");
            }
        }

        addMouseMoveHandler(handleMove.bind(this));


    }

    // draws the image that have to be drawn, and the board.
    update() {
        super.update(() => {
            this.drawingBoard.update();

            if (this.toDrawImgSrc) {
                context.drawImage(this.toDrawImgSrc,this.drawingBoard.x + this.drawingBoard.width + 5,this.drawingBoard.y,canvas.width * 0.18,canvas.width * 0.18);
            }

            if (this.distractionImgSrc) {
                context.save();
                context.globalAlpha = this.distractionOpacity;
                context.drawImage(this.distractionImgSrc,this.drawingBoard.x,this.drawingBoard.y,this.drawingBoard.width,this.drawingBoard.height);
                context.restore();
            }

            this.distractionImgTime.update();
        });
    }
}

export default Passion;
