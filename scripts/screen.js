import Button from "./ui/Button.js";
import Text from "./ui/Text.js";
import { Cursor, removeHandlers,addMouseMoveHandler, addClickHandler, addUnClickHandler } from "./eventHandlers.js";
import Component from "./ui/Component.js";

import Attention from "./games/attention.js";
import Confidence from "./games/confidence.js";
import Passion from "./games/passion.js";

let canvas,context;
canvas = document.querySelector("#canvas");
context = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const CENTERX = canvas.width / 2;
const CENTERY = canvas.height / 2;


class Background extends Component{
/*
 * Create a rectangle background for the entire game.
 *
 * @param {number} x The x position of rectangle.
 * @param {number} y The y position of rectangle.
 * @param {number} width The size of rectangle in width.
 * @param {number} height The size of rectangle in height.
 * @param {string} color The color of the rectangle.
 *
 * @arguments (x,y,width,height,color) or (color).
 */
    constructor(x,y,width,height,color) {
       if (arguments.length == 5) 
           super(x,y,width,height,color);

        // if the argument is only one, get the position and dimension of the canvas as,
        // the position and dimension of the rectangle background, and get that one argument,
        // as the color
       else super(0,0,canvas.width,canvas.height,x);
    }

    // draw the rectangle background in the screen.
    draw() {
        this.drawRect();
        this.drawImage();
    }
}

class Display {
    constructor() {
        // the current frame that is being displayed in the screen.
        this._currentFrame = 6;
        this._displays = []; // all the displayed for the current frame.
        // all the frames that we have.
        this.frames = [
            this.pauseFrame.bind(this),
            this.menuFrame.bind(this),
            this.frame2.bind(this),
            this.frame3.bind(this),
            this.frame4.bind(this),
            this.frame5.bind(this),
            this.frame6.bind(this),
            this.showCreditsFrame.bind(this)
        ];

        // all the games.
        this.Games = {
            attention: new Attention(),
            confidence: new Confidence(),
            passion: new Passion()
        };

        // game cursor
        this.cursor = new Cursor();
        
        // a pause button that can change the frame to paused, stopping the current game we are playing.
        this.pauseButton = new Button(50,40,100,60,"PAUSE");
        this.isPause = false;

        // initialize the current frame.
        this.displayFrame();
    }

    // remove all the display of the current frame.
    removeDisplays() {
        while (this._displays.length > 0) this._displays.pop();
    }

    // display the current frame, adding all the display in the displays collection.
    displayFrame() {
        this.frames[this._currentFrame]();
    }

    // change what we are displaying.
    setDisplays(displays) {
        this._displays = displays;
    }


    // the pause frame of the game.
    pauseFrame() {
        let displays = [];

        let bg = new Background("rgba(150,20,20,1)");

        let resumeBtn = new Button(600,350,200,100,"RESUME");
        let menuBtn = new Button(CENTERX - 200 / 2,canvas.height * 0.3,200,100,"MENU");

        resumeBtn.attachClick(() => {
            this.updateFrame(this._previousFrame);
        });

        menuBtn.attachClick(() => {
            this.updateFrame(1);
        });

        displays.push(bg);
        displays.push(resumeBtn);
        displays.push(menuBtn);
        this.setDisplays(displays);
    }

    // menu frame, going here resets the game and 'Player' stats.
    menuFrame() {
        let displays = [];
        
        let bg = new Background("rgba(0,0,0, 0.7)");
        bg.setImage("../images/game-menu-bg.jpg", {
            opacity: 1
        });
        let txt1 = new Text("Gabriella's Birthday Game",canvas.width / 2,250,100,"#000");
        txt1.setStyles({
            family: 'Varela Round',
            weight: 'bold',
            color: '#F4538A'
        });
       
        let btn1 = new Button(canvas.width / 2 - 200 / 2,350,200,90,"PLAY");
        btn1.setStyles({
            textColor: "white",
            origColor: "#FAA300",
            hoverColor: "rgb(150,80,0)", 
            textWeight: "bold",
            textSize: 40,
            textFamily: 'Varela Round',
        });

        let btn2 = new Button(canvas.width / 2 - 220 / 2,460,220,100,"CREDITS");
        btn2.setStyles({
            textColor: "white",
            origColor: "#FAA300",
            hoverColor: "rgb(150,80,0)", 
            textWeight: "bold",
            textSize: 40,
            textFamily: 'Varela Round',
        });

        btn1.attachClick(() => {
            this.updateFrame(this._currentFrame + 1);
        });

        btn2.attachClick(() => {
            this.updateFrame(this.frames.length - 1); 
            this.toggleCredits(true); // show credits.
            this.cursor.setIsHidden(true); // hide the cursor image show the default cursor.
        });

        for (let game in this.Games) {
            if (this.Games[game].restart)
                this.Games[game].restart();
        }

        displays.push(bg);
        displays.push(btn1);
        displays.push(btn2);
        displays.push(txt1);
        this.setDisplays(displays);
    }

    frame2() {
        let displays = [];
        
        let bg = new Background("rgba(0,0,0, 0.7)");
        let txt1 = new Text(
            `In the year 2020, where everyone was inside their house feeling dark, sad, and hopeless because of the COVID-19 pandemic.
             there born a beautiful, wonderful, and spectacular girl who in turn give light to a family
             and her name is Gabrielle.`
        , canvas.width / 2, canvas.height * 0.25, 40, "red",1200);
        txt1.setLineSpacing(20);

        let btn1 = new Button(canvas.width / 2 - 200 / 2,canvas.height * 0.4,200,100,"NEXT");
        btn1.setTextColor("yellow");
        btn1.setTextSize(40);

        btn1.attachClick(() => {
            this.updateFrame(this._currentFrame + 1);
        });

        displays.push(bg);
        displays.push(btn1);
        displays.push(txt1);
        this.setDisplays(displays);
    }

    frame3() {
        let displays = [];

        let bg = new Background("rgba(0,0,0, 0.7)");
        let txt1 = new Text(
            `Growing up as a child in this time of the world full of distraction, her life is somewhat normal
             except for the  24/7 screen time she received.Nevertheless she was still loved or admired by her family.`
        ,700, 150, 40, "red", 1200);
        txt1.setLineSpacing(20);

        let btn1 = new Button(800,370,200,100,"NEXT");
        let btn2 = new Button(400,370,200,100,"BACK");

        btn1.setTextColor("yellow");
        btn1.setTextSize(40);
        
        btn2.setTextColor("red");
        btn2.setTextSize(40);

        btn1.attachClick(() => {
            this.updateFrame(this._currentFrame + 1);
        });

        btn2.attachClick(() => {
            this.updateFrame(this._currentFrame - 1);
        });

        displays.push(bg);
        displays.push(btn1);
        displays.push(btn2);
        displays.push(txt1);

        this.setDisplays(displays);
    }

    frame4() {
        let displays = [];

        let bg = new Background("#FFFAFA");

        bg.setImage("../images/game-1-bg.jpg",{
            opacity: 0.7
        });

        displays.push(bg);

        displays.push(this.Games.attention);

        // pause frame will be add to displays and remove 
        // must be at the end of all the display.
        this.pauseButton.attachClick(() => {
            this._previousFrame = this._currentFrame;
            this.updateFrame(0);
        });

        displays.push(this.pauseButton);
        this.setDisplays(displays);
    }

    frame5() {
        let displays = [];
        
        let bg = new Background("#FFF8E3");

        this.Games.confidence.addHandlers();
        displays.push(bg);
        displays.push(this.Games.confidence);

        // pause frame will be add to displays and remove 
        // must be at the end of all the display.
        this.pauseButton.attachClick(() => {
            this._previousFrame = this._currentFrame;
            this.updateFrame(0);
        });

        displays.push(this.pauseButton);
        this.setDisplays(displays);
    }


    frame6() {
        let displays = [];
        
        let bg = new Background("rgba(0,60,0, 0.7)");

        this.Games.passion.addHandlers();
        displays.push(bg);
        displays.push(this.Games.passion);

        // pause frame will be add to displays and remove 
        // must be at the end of all the display.
        this.pauseButton.attachClick(() => {
            this._previousFrame = this._currentFrame;
            this.updateFrame(0);
        });

        displays.push(this.pauseButton);
        this.setDisplays(displays);
    }

    /*
     * Toggle credits display.
     *
     * @param {boolean} isShow The boolean that tells whether we displays the credits or not.
     */
    toggleCredits(isShow) {
        const creditsElement = document.querySelector(".credits-container");
        creditsElement.classList.toggle("hide",!isShow);
    }

    // show credits.
    showCreditsFrame() {
        let display = [];
        let bg = new Background("rgba(0,0,0, 0.7)");
        bg.setImage("../images/game-menu-bg.jpg", {
            opacity: 1
        });   
        let backBtn = new Button(canvas.width * 0.05,canvas.height * 0.05,200,100,"BACK");
        backBtn.attachClick(() => {
            this.updateFrame(1);
            this.toggleCredits(false);
            this.cursor.setIsHidden(false);
        });

        display.push(bg);
        display.push(backBtn);
        this.setDisplays(display);
    }

    /*
     * Change the frame to the frame that is passed, removing all the displays, and handlers of the current frame.
     *
     * @param {number} frame The frame we are going to switch to.
     */
    updateFrame(frame) {
        this._currentFrame = frame;
         
        this.removeDisplays();
        removeHandlers();
        this.displayFrame();
        this.cursor.add();
    }

    // Update the game status, handlers and draw the frames on the screen.
    update() {
        context.clearRect(0,0,canvas.width,canvas.height);

        for (let i = 0;i < this._displays.length;i++) {
            let display = this._displays[i];
            if (display.update)
                display.update();
            else if (display.draw) display.draw();
        }

        this.cursor.draw();
    }
}

export default canvas;
export {canvas,context, Display};
