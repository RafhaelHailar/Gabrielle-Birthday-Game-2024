import Button from "./ui/Button.js";
import Text from "./ui/Text.js";
import { Cursor, removeHandlers,addMouseMoveHandler, addClickHandler, addUnClickHandler } from "./eventHandlers.js";
import { TimeoutBuilder, SchedulesHolder } from "./timer.js";
import Component from "./ui/Component.js";
import Modal from "./ui/Modal.js";

import Attention from "./games/attention.js";
import Confidence from "./games/confidence.js";
import Passion from "./games/passion.js";

import PlayerStats from "./player.js";

const schedules = new SchedulesHolder();

let canvas,context;
canvas = document.querySelector("#canvas");
context = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const CENTERX = canvas.width / 2;
const CENTERY = canvas.height / 2;

const playerStats = new PlayerStats();

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
        this._currentFrame = 4;
        this._displays = []; // all the displayed for the current frame.
        // all the frames that we have.
        this.frames = [
            this.pauseFrame.bind(this),
            this.menuFrame.bind(this),
            this.frame2.bind(this),
            this.frame3.bind(this),
            this.attentionFrame.bind(this),
            this.confidenceFrame.bind(this),
            this.passionFrame.bind(this),
            this.showCreditsFrame.bind(this)
        ];

        // all the games.
        // I assign the Games object first to a variable, so the addContents in the Instructions object, can see the games.
        const Games = {
            attention: new Attention(),
            confidence: new Confidence(),
            passion: new Passion(),
        };

        // games intruction.
        this.Instructions = {
            attention: new Modal(canvas.width / 2 - canvas.width * 0.4 / 2,canvas.height * 0.15,canvas.width * 0.4,canvas.width * 0.25,"black"),
            confidence: new Modal(canvas.width / 2 - canvas.width * 0.5 / 2,canvas.height * 0.15,canvas.width * 0.5,canvas.width * 0.35,"black"),
            passion: new Modal(canvas.width / 2 - canvas.width * 0.4 / 2,canvas.height * 0.15,canvas.width * 0.4,canvas.width * 0.25,"black"),
            addContents() {
                // attention instructional modal
                this.attention.setImage("../images/modal-bg.webp",{
                    brightness: 0.8
                });
                this.attention.setCloseStyle({isHide: true});
                this.attention.addContent(() => {
                    const width = this.attention.width;
                    const height = this.attention.height;
                    const gameTitle = new Text("Attention Span Game!",width / 2,height * 0.12,width * 0.08,"#F4538A");
                    const instructionTxt = new Text("Instruction:",width * 0.15,height * 0.25,width * 0.05,"green");

                    const IMAGESIZE = canvas.width * 0.05;

                    const carImage = new Component(canvas.width * 0.01,height * 0.37 - IMAGESIZE / 2,IMAGESIZE,IMAGESIZE,"red");
                    carImage.setImage("../images/car-toy-game-1.png");
                    const bearImage = new Component(IMAGESIZE,height * 0.37 - IMAGESIZE / 2,IMAGESIZE,IMAGESIZE,"red");
                    bearImage.setImage("../images/teddy-bear-game-1.png");

                    const safeText = new Text("- CLICK the TOYS before they disappear.",width * 0.52,height * 0.38,width * 0.03,"red");

                    const phoneImage = new Component(0,height * 0.44,IMAGESIZE,IMAGESIZE,"red");
                    phoneImage.setImage("../images/cellphone-game-1.png");

                    const dangerText = new Text("- DON'T CLICK the PHONE and let it disappear.",width * 0.56,height * 0.53,width * 0.03,"red");

                    const gameStartTimer = new TimeoutBuilder(function() {
                        context.font = "30px Arial";
                        context.fillText(3 - Math.floor(this.endCounter / 1000),canvas.width / 2,canvas.height / 2 + 100);
                    })
                    .setDuration(3000)
                    .setCallback(() => {
                        Games.attention.resume();
                        this.attention.setIsHide(true);
                    })
                    .build();

                    // pause the game start timer.
                    gameStartTimer.pause();

                    const startBtn = new Button(width / 2 - width * 0.25 / 2,height - width * 0.23,width * 0.25,width * 0.13,"START");
                    startBtn.setStyles({
                        origColor: "red",
                        hoverColor: "green",
                        textSize: width * 0.04
                    });
                    startBtn.attachClick(() => {
                        if (gameStartTimer.isRunning) gameStartTimer.pause();
                        else gameStartTimer.resume(); 
                    });

                    return [
                        gameTitle,
                        instructionTxt,
                        startBtn,
                        gameStartTimer,
                        carImage,
                        bearImage,
                        phoneImage,
                        safeText,
                        dangerText
                    ];
                });

                this.confidence.setImage("../images/modal-bg.webp",{
                    brightness: 0.8
                });
                this.confidence.setCloseStyle({isHide: true});
                this.confidence.addContent(() => {
                    const width = this.confidence.width;
                    const height = this.confidence.height;
                    const gameTitle = new Text("Confidence Game!",width / 2,height * 0.12,width * 0.06,"#59D5E0");
                    const instructionTxt = new Text("Instruction:",width * 0.15,height * 0.25,width * 0.04,"green");

                    const IMAGESIZE = canvas.width * 0.05;
                    
                    const movementText = new Text("- PRESS arrow up(↑) on your keyboard, to move upward, PRESS arrow down(↓) to move downward, PRESS arrow left(←) to move leftward, and PRESS arrow right(→a) to move rightward.",width * 0.06,height * 0.3,width * 0.02,"red",this.confidence.width - this.confidence.width * 0.2);
                    movementText.setAlignment("start");
                    movementText.setStyles({
                        linespace: canvas.height * 0.015 
                    });

                    const houseImage = new Component(width * 0.04,height * 0.39,IMAGESIZE,IMAGESIZE,"red");
                    houseImage.setImage("../images/squirrel-house-game-2.png");

                    const todoText = new Text("- Move up until you get to your house before the time ends",width * 0.43,height * 0.48,width * 0.02,"red");

                    const annoyedCatImage = new Component(width * 0.04,height * 0.55,IMAGESIZE,IMAGESIZE,"red");
                    annoyedCatImage.setImage("../images/cat-annoyed-cute-rectangle-game-2.png");
                    const seriousCatImage = new Component(width * 0.14,height * 0.55,IMAGESIZE,IMAGESIZE,"red");
                    seriousCatImage.setImage("../images/cat-serious-cute-rectangle-game-2.png");
                    const smileCatImage = new Component(width * 0.24,height * 0.55,IMAGESIZE,IMAGESIZE,"red");
                    smileCatImage.setImage("../images/cat-smile-cute-rectangle-game-2.png");
                    const stillCatImage = new Component(width * 0.34,height * 0.55,IMAGESIZE,IMAGESIZE,"red");
                    stillCatImage.setImage("../images/cat-still-cute-rectangle-game-2.png");

                    const avoidText = new Text("- Avoid getting hit by these cats",width * 0.61,height * 0.63,width * 0.02,"red");

                    const effectText = new Text("EFFECTS - LOWER ATTENTION SPAN, the FREQUENT the CATS DISAPPEAR to your SIGHT.",width * 0.48,height * 0.72,width * 0.02,"blue");
                    const statsText = new Text(`ATTENTION SPAN: ${playerStats.getAttentionSpan() * 100}%`,width / 2,height * 0.77,width * 0.02,"yellow");

                    const gameStartTimer = new TimeoutBuilder(function() {
                        context.font = "30px Arial";
                        context.fillText(3 - Math.floor(this.endCounter / 1000),canvas.width / 2,canvas.height / 2 + 100);
                    })
                    .setDuration(3000)
                    .setCallback(() => {
                        Games.confidence.resume();
                        this.confidence.setIsHide(true);
                    })
                    .build();

                    // pause the game start timer.
                    gameStartTimer.pause();

                    const startBtn = new Button(width / 2 - width * 0.2 / 2,height - width * 0.12,width * 0.2,width * 0.1,"START");
                    startBtn.setStyles({
                        origColor: "red",
                        hoverColor: "green",
                        textSize: width * 0.03
                    });
                    startBtn.attachClick(() => {
                        if (gameStartTimer.isRunning) gameStartTimer.pause();
                        else gameStartTimer.resume(); 
                    });

                    return [
                        gameTitle,
                        instructionTxt,
                        startBtn,
                        gameStartTimer,
                        movementText,
                        todoText,
                        houseImage,
                        annoyedCatImage,
                        seriousCatImage,
                        smileCatImage,
                        stillCatImage,
                        avoidText,
                        effectText,
                        statsText
                    ];
                });

                this.passion.setImage("../images/modal-bg.webp",{
                    brightness: 0.8
                });
                this.passion.setCloseStyle({isHide: true});
                this.passion.addContent(() => {
                    const width = this.passion.width;
                    const height = this.passion.height;
                    const gameTitle = new Text("Passion Game!",width / 2,height * 0.12,width * 0.06,"#F5DD61");
                    const instructionTxt = new Text("Instruction:",width * 0.15,height * 0.25,width * 0.04,"green");

                    const IMAGESIZE = canvas.width * 0.05;

                    const todoTxt = new Text("- DRAW the IMAGE on the RIGHT with your MOUSE on the DRAWING BOARD in the CENTER, by CLICKING the LEFT BUTTON and HOLDING THE CLICK on the DRAWING BOARD, BEFORE the TIME ENDS.",width * 0.08,height * 0.33,width * 0.02,"red",this.confidence.width - this.confidence.width * 0.4);
                    todoTxt.setStyles({
                        alignment: "start",
                        linespace: height * 0.03    
                    });

                    const effectTxt = new Text("* EFFECT: LOW ATTENTION SPAN, the FREQUENT the MONKEY SHOWS UP on the BOARD. LOW CONFIDENCE, the FREQUENT you will not be able to DRAW. ",width * 0.08,height * 0.52,width * 0.02,"blue",this.confidence.width - this.confidence.width * 0.4);
                    effectTxt.setStyles({
                        alignment: "start",
                        linespace: height * 0.03
                    });

                    const attentionTxt = new Text(`ATTENTION SPAN: ${playerStats.getAttentionSpan() * 100}%`,width / 2,height * 0.65,width * 0.02,"yellow",this.confidence.width - this.confidence.width * 0.4);
                    const confidenceTxt = new Text(`CONFIDENCE: ${playerStats.getConfidence() * 100}%`,width / 2,height * 0.69,width * 0.02,"yellow",this.confidence.width - this.confidence.width * 0.4);

                    const gameStartTimer = new TimeoutBuilder(function() {
                        context.font = "30px Arial";
                        context.fillText(3 - Math.floor(this.endCounter / 1000),canvas.width / 2,canvas.height / 2 + 100);
                    })
                    .setDuration(3000)
                    .setCallback(() => {
                        Games.passion.resume();
                        this.passion.setIsHide(true);
                    })
                    .build();


                    // pause the game start timer.
                    gameStartTimer.pause();

                    const startBtn = new Button(width / 2 - width * 0.2 / 2,height - width * 0.15,width * 0.2,width * 0.1,"START");
                    startBtn.setStyles({
                        origColor: "red",
                        hoverColor: "green",
                        textSize: width * 0.03
                    });
                    startBtn.attachClick(() => {
                        if (gameStartTimer.isRunning) gameStartTimer.pause();
                        else gameStartTimer.resume(); 
                    });

                    return [
                        gameTitle,
                        instructionTxt,
                        startBtn,
                        gameStartTimer,
                        todoTxt,
                        effectTxt,
                        attentionTxt,
                        confidenceTxt
                    ];
                });
            }

        };

        this.Games = Games;
        this.Instructions.addContents();

        // game cursor
        this.cursor = new Cursor();
        
        // a pause button that can change the frame to paused, stopping the current game we are playing.
        this.pauseButton = new Button(50,40,100,60,"PAUSE");
        this.pauseButton.setStyles({
            origColor: "#59D5E0",
            hoverColor: "blue",
            textColor: "#F5DD61"
        });
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
        bg.setImage("../images/pause-bg.jpg");

        const BUTTONWIDTH = canvas.width * 0.1;
        const BUTTONHEIGHT = canvas.height * 0.1;

        let resumeBtn = new Button(CENTERX - BUTTONWIDTH / 2,CENTERY + canvas.height * 0.005,BUTTONWIDTH,BUTTONHEIGHT,"RESUME");

        resumeBtn.setStyles({
            origColor: "#4CCD99",
            hoverColor: "rgb(50,190,130)",
            textColor: "white",
            textSize: canvas.width * 0.015
        });

        let menuBtn = new Button(CENTERX - BUTTONWIDTH / 2,CENTERY - canvas.height * 0.15,BUTTONWIDTH,BUTTONHEIGHT,"MENU");

        menuBtn.setStyles({
            origColor: "#FFC700",
            hoverColor: "rgb(230,180,0)",
            textColor: "white",
            textSize: canvas.width * 0.015
        });

        const menuModal = new Modal(CENTERX - canvas.width * 0.4 / 2,canvas.height * 0.15,canvas.width * 0.4,canvas.width * 0.25,"black");
        menuModal.setCloseStyle({isHide: true});
        menuModal.setImage("../images/modal-bg.webp",{
            brightness: 0.8
        });

        menuModal.addContent(() => {
            const width = menuModal.width;
            const height = menuModal.height;
            const questionText = new Text("Go Back to Menu ?",width / 2,height * 0.12,width * 0.06,"#F5DD61");
            const yesBtn = new Button(width / 2 - BUTTONWIDTH / 2,height / 2 - BUTTONHEIGHT,BUTTONWIDTH,BUTTONHEIGHT,"YES");
            
            yesBtn.setStyles({
                origColor: "rgb(0,240,0)",
                hoverColor: "rgb(0,150,0)",
                textColor: "white",
                textSize: canvas.width * 0.015
            });

            yesBtn.attachClick(() => {
                this.updateFrame(1);
            });

            const noBtn = new Button(width / 2 - BUTTONWIDTH / 2,height / 2 + BUTTONHEIGHT / 2,BUTTONWIDTH,BUTTONHEIGHT,"NO");

            noBtn.setStyles({
                origColor: "rgb(240,0,0)",
                hoverColor: "rgb(150,0,0)",
                textColor: "white",
                textSize: canvas.width * 0.015
            });

            noBtn.attachClick(() => {
                menuModal.setIsHide(true);
                menuBtn.setIsHide(false);
                resumeBtn.setIsHide(false);
            });

            return [questionText,yesBtn,noBtn];
        });
        menuModal.init();
        menuModal.setIsHide(true);
    
        resumeBtn.attachClick(() => {
            this.updateFrame(this._previousFrame);
        });

        menuBtn.attachClick(() => {
            menuModal.setIsHide(false);
            menuBtn.setIsHide(true);
            resumeBtn.setIsHide(true);
        });

        displays.push(bg);
        displays.push(resumeBtn);
        displays.push(menuBtn);
        displays.push(menuModal);
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

    attentionFrame() {
        let displays = [];

        let bg = new Background("#FFFAFA");

        bg.setImage("../images/game-1-bg.jpg",{
            opacity: 0.7
        });

        displays.push(bg);

        // if the game is not running yet, show the instructions.
        if (!this.Games.attention.isRunning)
            this.Instructions.attention.init();

        displays.push(this.Games.attention);
        displays.push(this.Instructions.attention);

        // pause frame will be add to displays and remove 
        // must be at the end of all the display.
        this.pauseButton.attachClick(() => {
            this._previousFrame = this._currentFrame;
            this.updateFrame(0);
        });

        displays.push(this.pauseButton);
        this.setDisplays(displays);
    }

    confidenceFrame() {
        let displays = [];
        
        let bg = new Background("#FFF8E3");

        // if the game is not running yet, show the instructions.
        if (!this.Games.confidence.isRunning)
            this.Instructions.confidence.init();

        this.Games.confidence.addHandlers();
        displays.push(bg);
        displays.push(this.Games.confidence);
        displays.push(this.Instructions.confidence);

        // pause frame will be add to displays and remove 
        // must be at the end of all the display.
        this.pauseButton.attachClick(() => {
            this._previousFrame = this._currentFrame;
            this.updateFrame(0);
        });

        displays.push(this.pauseButton);
        this.setDisplays(displays);
    }


    passionFrame() {
        let displays = [];
        
        let bg = new Background("rgba(0,60,0, 0.7)");
        bg.setImage("../images/game-3-bg.jpg");
        let finishBtn = new Button(
            this.Games.passion.drawingBoard.x + this.Games.passion.drawingBoard.width,
            this.Games.passion.drawingBoard.y + this.Games.passion.drawingBoard.height - canvas.width * 0.05,
            canvas.width * 0.1,
            canvas.width * 0.05,
            "FINISH"
        );
        finishBtn.setStyles({
            origColor: "#4CCD99",
            hoverColor: "#4CCD99",
            textSize: canvas.width * 0.015,
            textWeight: 700
        });

        // if the game is not running yet, show the instructions.
        if (!this.Games.passion.isRunning)
            this.Instructions.passion.init();

        this.Games.passion.addHandlers();
        displays.push(bg);
        displays.push(this.Games.passion);
        displays.push(finishBtn);
        displays.push(this.Instructions.passion);

        // pause frame will be add to displays and remove 
        // must be at the end of all the display.
        this.pauseButton.attachClick(() => {
            this._previousFrame = this._currentFrame;
            this.updateFrame(0);
        });

        // click the button to end the game.
        finishBtn.attachClick(() => {
            this.Games.passion.endGame();
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
         
        this.pauseButton.setColor(this.pauseButton.origColor);

        schedules.clearSchedules();

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

            for (let game in this.Games) {
                if (this.Games[game] == display && display.isPlayed) this.updateFrame(this._currentFrame + 1);
            }
        }

        this.cursor.draw();
    }
}

export default canvas;
export {canvas,context, Display};
