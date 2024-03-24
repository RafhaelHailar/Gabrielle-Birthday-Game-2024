import Button from "./ui/Button.js";
import Text from "./ui/Text.js";
import { Cursor, removeHandlers,addMouseMoveHandler, addClickHandler, addUnClickHandler } from "./eventHandlers.js";
import { TimeoutBuilder, SchedulesHolder } from "./timer.js";
import Component from "./ui/Component.js";
import Modal from "./ui/Modal.js";

import SoundHandler from "./sound.js";

import Attention from "./games/attention.js";
import Confidence from "./games/confidence.js";
import Passion from "./games/passion.js";

import PlayerStats from "./player.js";

const schedules = new SchedulesHolder();

// start time of the game.
let gameStartTime = Date.now();
let gameEndTime = gameStartTime;

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
            this.attentionResultFrame.bind(this),
            this.frame6.bind(this),
            this.frame7.bind(this),
            this.confidenceFrame.bind(this),
            this.confidenceResultFrame.bind(this),
            this.frame10.bind(this),
            this.frame11.bind(this),
            this.passionFrame.bind(this),
            this.passionResultFrame.bind(this),
            this.finishGameFrame.bind(this),
            this.messageFrame.bind(this),
            this.showCreditsFrame.bind(this)
        ];

        this.sound = new SoundHandler(canvas);
        this.sound.setFrames({
            menu: [1],
            story: [2,3,6,7,10,11],
            attention: [4],
            confidence: [8],
            passion: [12],
            result: [5,9,13],
            message: [15]
        });
        this.sound.playFrame(this._currentFrame);

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
                const IMAGESIZE = canvas.width * 0.05;

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
                        Games.attention.run();
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
                    const statsText = new Text(`ATTENTION SPAN: ${(playerStats.getAttentionSpan() * 100).toFixed(2)}%`,width / 2,height * 0.77,width * 0.02,"yellow");

                    const gameStartTimer = new TimeoutBuilder(function() {
                        context.font = "30px Arial";
                        context.fillText(3 - Math.floor(this.endCounter / 1000),canvas.width / 2,canvas.height / 2 + 100);
                    })
                    .setDuration(3000)
                    .setCallback(() => {
                        Games.confidence.run();
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

                    const attentionTxt = new Text(`ATTENTION SPAN: ${(playerStats.getAttentionSpan() * 100).toFixed(2)}%`,width / 2,height * 0.65,width * 0.02,"yellow",this.confidence.width - this.confidence.width * 0.4);
                    const confidenceTxt = new Text(`CONFIDENCE: ${(playerStats.getConfidence() * 100).toFixed(2)}%`,width / 2,height * 0.69,width * 0.02,"yellow",this.confidence.width - this.confidence.width * 0.4);

                    const gameStartTimer = new TimeoutBuilder(function() {
                        context.font = "30px Arial";
                        context.fillText(3 - Math.floor(this.endCounter / 1000),canvas.width / 2,canvas.height / 2 + 100);
                    })
                    .setDuration(3000)
                    .setCallback(() => {
                        Games.passion.run();
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
            const infoText = new Text("your current games progress will reset.",width / 2,height * 0.2,width * 0.03,"rgb(255,0,0)");
            const yesBtn = new Button(width / 2 - BUTTONWIDTH / 2,height / 2 - BUTTONHEIGHT,BUTTONWIDTH,BUTTONHEIGHT,"OKAY");
            
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

            return [infoText,questionText,yesBtn,noBtn];
        });
        menuModal.init();
        menuModal.setIsHide(true);
    
        resumeBtn.attachClick(() => {
            this.updateFrame(this._previousFrame);
            // resume the paused game, if the instructions modal is already gone otherwise don't.
            if (this.pausedGame.hasRun)
                this.pausedGame.resume();
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

        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;
        
        let bg = new Background("rgba(0,0,0, 0.7)");
        bg.setImage("../images/game-menu-bg.jpg", {
            opacity: 1
        });

        const shadow = new Component(0,0,WIDTH,HEIGHT,"rgba(0,0,0, 0.85)");
        shadow.draw = function() {this.drawRect()};
        const clickText = new Text("Click Anywhere to Play",WIDTH / 2,HEIGHT * 0.45,WIDTH * 0.05,"#ccc");

        let titleText = new Text("Gabriella's Birthday Game",WIDTH / 2,HEIGHT * 0.25,WIDTH * 0.06,"#000");
        titleText.setStyles({
            family: 'Varela Round',
            weight: 'bold',
            color: '#F4538A'
        });
       
        let playBtn = new Button(canvas.width / 2 - WIDTH * 0.1 / 2,HEIGHT * 0.35,WIDTH * 0.1,HEIGHT * 0.1,"PLAY");
        playBtn.setStyles({
            textColor: "white",
            origColor: "#FAA300",
            hoverColor: "rgb(150,80,0)", 
            textWeight: "bold",
            textSize: WIDTH * 0.021,
            textFamily: 'Varela Round'
        });


        let creditsBtn = new Button(canvas.width / 2 - WIDTH * 0.11 / 2,HEIGHT * 0.48,WIDTH * 0.11,HEIGHT * 0.11,"CREDITS");
        creditsBtn.setStyles({
            textColor: "white",
            origColor: "#FAA300",
            hoverColor: "rgb(150,80,0)", 
            textWeight: "bold",
            textSize: WIDTH * 0.021,
            textFamily: 'Varela Round'
        });

        playBtn.attachClick(() => {
            this.updateFrame(this._currentFrame + 1);
        });

        creditsBtn.attachClick(() => {
            this.updateFrame(this.frames.length - 1); 
            this.toggleCredits(true); // show credits.
            this.cursor.setIsHidden(true); // hide the cursor image show the default cursor.
        });

        shadow.attachClick(() => {
            shadow.setIsHide(true);
            clickText.setIsHide(true);
            playBtn.setIsHide(false);
            creditsBtn.setIsHide(false);
            this.sound.init(); // initial play of the sound.
        },true);

        for (let game in this.Games) {
            if (this.Games[game].restart)
                this.Games[game].restart();
        }

        displays = [
            bg,
            playBtn,
            creditsBtn,
            titleText,
        ];
        
        // to play the music in menu.
        if (!this.sound.isStart) {
            displays.push(shadow);
            displays.push(clickText);
            playBtn.setIsHide(true);
            creditsBtn.setIsHide(true);
        }

        this.setDisplays(displays);
    }

    frame2() {
        let displays = [];
        
        const width = canvas.width;
        const height = canvas.height;
        
        let bg = new Background("rgba(0,0,0, 0.7)");
        bg.setImage("../images/story-bg.jpg");
        let txt1 = new Text(
            `In the year 2020, where everyone was inside their house feeling dark, sad, and hopeless because of the COVID-19 pandemic.
             there born a beautiful, wonderful, and spectacular girl who in turn give light to a family
             and her name is Gabrielle.`
        , width / 2, height * 0.25, width * 0.025, "red",width * 0.7);
        txt1.setLineSpacing(20);

        let nextBtn = new Button(width / 2 - width * 0.1 / 2,height * 0.5,width * 0.1,height * 0.1,"NEXT");
        nextBtn.setStyles({
            origColor: "#FFC700",
            hoverColor: "#CCA300",
            textSize: width * 0.015,
            textColor: "white"
        });

        nextBtn.attachClick(() => {
            this.updateFrame(this._currentFrame + 1);
        });

        displays.push(bg);
        displays.push(nextBtn);
        displays.push(txt1);
        this.setDisplays(displays);
    }

    frame3() {
        let displays = [];

        const width = canvas.width;
        const height = canvas.height;

        let bg = new Background("rgba(0,0,0, 0.7)");
        bg.setImage("../images/story-bg.jpg");
        let txt1 = new Text(
            `Growing up as a child in this time of the world full of DISTRACTION, her life is somewhat normal
             except for the  24/7 screen time she received.Nevertheless she was still loved or admired by her family.`
        ,width / 2, height * 0.25, width * 0.025, "red",width * 0.7);
        txt1.setLineSpacing(20);

        let nextBtn = new Button(width / 2 + width * 0.1 / 2,height * 0.5,width * 0.1,height * 0.1,"NEXT");
        let backBtn = new Button(width / 2 - width * 0.1 * 1.5,height * 0.5,width * 0.1,height * 0.1,"BACK");

        nextBtn.setStyles({
            origColor: "#FFC700",
            hoverColor: "#CCA300",
            textSize: width * 0.015,
            textColor: "white"
        });

        backBtn.setStyles({
            origColor: "#007F73",
            hoverColor: "#003D52",
            textSize: width * 0.015,
            textColor: "white"
        });
        
        nextBtn.attachClick(() => {
            this.updateFrame(this._currentFrame + 1);
        });

        backBtn.attachClick(() => {
            this.updateFrame(this._currentFrame - 1);
        });

        displays.push(bg);
        displays.push(nextBtn);
        displays.push(backBtn);
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
        if (!this.Games.attention.hasRun) {
            this.Instructions.attention.init();
            this.sound.setFrameIsPlayState(false); // pause the sound, start it after the instruction is remove.
            this.sound.setIsPlayable(false);
        }

        displays.push(this.Games.attention);
        displays.push(this.Instructions.attention);

        // pause frame will be add to displays and remove 
        // must be at the end of all the display.
        this.pauseButton.attachClick(() => {
            this._previousFrame = this._currentFrame;
            this.updateFrame(0);
            this.pausedGame = this.Games.attention;
            this.pausedGame.pause();
        });

        displays.push(this.pauseButton);
        this.setDisplays(displays);
    }

    attentionResultFrame() {
        let displays = [];
        
        const width = canvas.width;
        const height = canvas.height;

        const IMAGESIZE = width * 0.07;

        const Collections = Attention.Collections;
        
        const bg = new Background("rgba(0,0,0, 0.7)");
        bg.setImage("../images/result-bg.jpg");

        const titleTxt = new Text("Attention Game Result",width / 2, height * 0.15, width * 0.05, "#F4538A",width * 0.7);

        const attentionTxt = new Text(
            `Attention Span Left: ${(playerStats.getAttentionSpan() * 100).toFixed(2)}%`
        , width / 2, height * 0.25, width * 0.025, "blue",width * 0.7);

        const itemsTxt = new Text("Items",width * 0.12, height * 0.34, width * 0.025, "orange",width * 0.7);
        const clickedTotalTxt = new Text("Clicked Total:",width * 0.32, height * 0.34, width * 0.025, "green",width * 0.7);
        const notClickedTotalTxt = new Text("NOT Clicked Total:",width * 0.58, height * 0.34, width * 0.025, "red",width * 0.7);
        const itemsTotalTxt = new Text("Item Total:",width * 0.83, height * 0.34, width * 0.025, "blue",width * 0.7);


        const carImage = new Component(width * 0.08,height * 0.41 - IMAGESIZE / 2,IMAGESIZE,IMAGESIZE,"red");
        carImage.setImage("../images/car-toy-game-1.png");

        const bearImage = new Component(width * 0.08,height * 0.52 - IMAGESIZE / 2,IMAGESIZE,IMAGESIZE,"red");
        bearImage.setImage("../images/teddy-bear-game-1.png");

        const phoneImage = new Component(width * 0.08,height * 0.58,IMAGESIZE,IMAGESIZE,"red");
        phoneImage.setImage("../images/cellphone-game-1.png");

        const carClickedTxt = new Text(String(Collections.car.clicked),width * 0.32, height * 0.42, width * 0.025, "green",width * 0.7);
        const teddyClickedTxt = new Text(String(Collections.teddy.clicked),width * 0.32, height * 0.53, width * 0.025, "green",width * 0.7);
        const phoneClickedTxt = new Text(String(Collections.cellphone.clicked),width * 0.32, height * 0.65, width * 0.025, "green",width * 0.7);

        const carNotClickedTxt = new Text(String(Collections.car.total - Collections.car.clicked),width * 0.58, height * 0.42, width * 0.025, "red",width * 0.7);
        const teddyNotClickedTxt = new Text(String(Collections.teddy.total - Collections.teddy.clicked),width * 0.58, height * 0.53, width * 0.025, "red",width * 0.7);
        const phoneNotClickedTxt = new Text(String(Collections.cellphone.total - Collections.cellphone.clicked),width * 0.58, height * 0.65, width * 0.025, "red",width * 0.7);

        const carTotalClickedTxt = new Text(String(Collections.car.total),width * 0.83, height * 0.42, width * 0.025, "blue",width * 0.7);
        const teddyTotalClickedTxt = new Text(String(Collections.teddy.total),width * 0.83, height * 0.53, width * 0.025, "blue",width * 0.7);
        const phoneTotalClickedTxt = new Text(String(Collections.cellphone.total),width * 0.83, height * 0.65, width * 0.025, "blue",width * 0.7);

        const nextBtn = new Button(width / 2 - width * 0.1 / 2,height * 0.75,width * 0.1,height * 0.1,"CONTINUE");
        nextBtn.setStyles({
            origColor: "#FFC700",
            hoverColor: "#CCA300",
            textSize: width * 0.015,
            textColor: "white"
        });

        nextBtn.attachClick(() => {
            this.updateFrame(this._currentFrame + 1);
        });

        displays = [
            bg,
            nextBtn,
            attentionTxt,
            titleTxt,
            itemsTxt,
            clickedTotalTxt,
            notClickedTotalTxt,
            itemsTotalTxt,
            carImage,
            bearImage,
            phoneImage,
            carClickedTxt,
            teddyClickedTxt,
            phoneClickedTxt,
            carNotClickedTxt,
            teddyNotClickedTxt,
            phoneNotClickedTxt,
            carTotalClickedTxt,
            teddyTotalClickedTxt,
            phoneTotalClickedTxt,
        ]
        this.setDisplays(displays);
    }

    frame6() {
        let displays = [];
        
        const width = canvas.width;
        const height = canvas.height;
        
        let bg = new Background("rgba(0,0,0, 0.7)");
        bg.setImage("../images/story-bg.jpg");
        let txt1 = new Text(
            `As a curious,lovely, and brave child, she strives to reach high places.Almost always climbing on desks, chairs, and any other else that
             are too high for a little kid.`
        , width / 2, height * 0.25, width * 0.025, "red",width * 0.7);
        txt1.setLineSpacing(20);

        let nextBtn = new Button(width / 2 - width * 0.1 / 2,height * 0.5,width * 0.1,height * 0.1,"NEXT");
        nextBtn.setStyles({
            origColor: "#FFC700",
            hoverColor: "#CCA300",
            textSize: width * 0.015,
            textColor: "white"
        });

        nextBtn.attachClick(() => {
            this.updateFrame(this._currentFrame + 1);
        });

        displays.push(bg);
        displays.push(nextBtn);
        displays.push(txt1);
        this.setDisplays(displays);
    }

    frame7() {
        let displays = [];

        const width = canvas.width;
        const height = canvas.height;

        let bg = new Background("rgba(0,0,0, 0.7)");
        bg.setImage("../images/story-bg.jpg");
        let txt1 = new Text(
            `Starting climbing at first it was kind of DIFFICULT and SCARY for her, but after successfully climbing 
             some high places she gained BRAVERY, therefore everytime she sees high places instead of feeling scared she instead felt excite.`
        ,width / 2, height * 0.25, width * 0.025, "red",width * 0.7);
        txt1.setLineSpacing(20);

        let nextBtn = new Button(width / 2 + width * 0.1 / 2,height * 0.5,width * 0.1,height * 0.1,"NEXT");
        let backBtn = new Button(width / 2 - width * 0.1 * 1.5,height * 0.5,width * 0.1,height * 0.1,"BACK");

        nextBtn.setStyles({
            origColor: "#FFC700",
            hoverColor: "#CCA300",
            textSize: width * 0.015,
            textColor: "white"
        });

        backBtn.setStyles({
            origColor: "#007F73",
            hoverColor: "#003D52",
            textSize: width * 0.015,
            textColor: "white"
        });
        
        nextBtn.attachClick(() => {
            this.updateFrame(this._currentFrame + 1);
        });

        backBtn.attachClick(() => {
            this.updateFrame(this._currentFrame - 1);
        });

        displays.push(bg);
        displays.push(nextBtn);
        displays.push(backBtn);
        displays.push(txt1);

        this.setDisplays(displays);
    }

    confidenceFrame() {
        let displays = [];
        
        let bg = new Background("#FFF8E3");

        // if the game is not running yet, show the instructions.
        if (!this.Games.confidence.hasRun) {
            this.Instructions.confidence.init();
            this.sound.setFrameIsPlayState(false); // pause the sound, start it after the instruction is remove.
            this.sound.setIsPlayable(false);
        }


        this.Games.confidence.addHandlers();
        displays.push(bg);
        displays.push(this.Games.confidence);
        displays.push(this.Instructions.confidence);

        // pause frame will be add to displays and remove 
        // must be at the end of all the display.
        this.pauseButton.attachClick(() => {
            this._previousFrame = this._currentFrame;
            this.updateFrame(0);
            this.pausedGame = this.Games.attention;
            this.pausedGame.pause();
        });

        displays.push(this.pauseButton);
        this.setDisplays(displays);
    }


    confidenceResultFrame() {
        let displays = [];
        
        const width = canvas.width;
        const height = canvas.height;

        const IMAGESIZE = width * 0.07;

        const Collections = Confidence.Collections;

        const bg = new Background("rgba(0,0,0, 0.7)");
        bg.setImage("../images/result-bg.jpg");

        const titleTxt = new Text("Confidence Game Result",width / 2, height * 0.15, width * 0.05, "#59D5E0");

        const confidenceTxt = new Text(`Confidence Left: ${(playerStats.getConfidence() * 100).toFixed(2)}%`,width / 2,height * 0.25,width * 0.025,"blue");

        const catsTxt = new Text("Cats:",width * 0.17, height * 0.42, width * 0.05, "orange");

        const hitsTxt = new Text("Total Hit", width / 2,height * 0.32,width * 0.025,"red");

        const typesTxt = new Text("Types", width * 0.05,height * 0.72,width * 0.02,"green");

        const annoyedCatImage = new Component(width * 0.3,height * 0.35,IMAGESIZE,IMAGESIZE,"red");
        annoyedCatImage.setImage("../images/cat-annoyed-cute-rectangle-game-2.png");
        const seriousCatImage = new Component(width * 0.45,height * 0.35,IMAGESIZE,IMAGESIZE,"red");
        seriousCatImage.setImage("../images/cat-serious-cute-rectangle-game-2.png");
        const smileCatImage = new Component(width * 0.75,height * 0.35,IMAGESIZE,IMAGESIZE,"red");
        smileCatImage.setImage("../images/cat-smile-cute-rectangle-game-2.png");
        const stillCatImage = new Component(width * 0.6,height * 0.35,IMAGESIZE,IMAGESIZE,"red");
        stillCatImage.setImage("../images/cat-still-cute-rectangle-game-2.png");

        const aTxt = new Text("A", width * 0.15,height * 0.58,width * 0.04,"green");
        const bTxt = new Text("B", width * 0.15,height * 0.68,width * 0.04,"green");
        const cTxt = new Text("C", width * 0.15,height * 0.78,width * 0.04,"green");
        const dTxt = new Text("D", width * 0.15,height * 0.88,width * 0.04,"green");

        const annoyedAHitTxt = new Text(String(Collections.annoyed.a.totalHit), width * 0.33,height * 0.57,width * 0.035,"red");
        const annoyedBHitTxt = new Text(String(Collections.annoyed.b.totalHit), width * 0.33,height * 0.67,width * 0.035,"red");

        const seriousAHitTxt = new Text(String(Collections.serious.a.totalHit), width * 0.48,height * 0.57,width * 0.035,"red");
        const seriousBHitTxt = new Text(String(Collections.serious.b.totalHit), width * 0.48,height * 0.67,width * 0.035,"red");

        const stillAHitTxt = new Text(String(Collections.still.a.totalHit), width * 0.63,height * 0.57,width * 0.035,"red");
        const stillBHitTxt = new Text(String(Collections.still.b.totalHit), width * 0.63,height * 0.67,width * 0.035,"red");
        const stillCHitTxt = new Text(String(Collections.still.c.totalHit), width * 0.63,height * 0.77,width * 0.035,"red");

        const smileAHitTxt = new Text(String(Collections.smile.a.totalHit), width * 0.78,height * 0.57,width * 0.035,"red");
        const smileBHitTxt = new Text(String(Collections.smile.b.totalHit), width * 0.78,height * 0.67,width * 0.035,"red");
        const smileCHitTxt = new Text(String(Collections.smile.c.totalHit), width * 0.78,height * 0.77,width * 0.035,"red");
        const smileDHitTxt = new Text(String(Collections.smile.d.totalHit), width * 0.78,height * 0.87,width * 0.035,"red");


        const nextBtn = new Button(width * 0.85,height * 0.8,width * 0.1,height * 0.1,"CONTINUE");
        nextBtn.setStyles({
            origColor: "#FFC700",
            hoverColor: "#CCA300",
            textSize: width * 0.015,
            textColor: "white"
        });

        nextBtn.attachClick(() => {
            this.updateFrame(this._currentFrame + 1);
        });

        displays = [
            bg,
            nextBtn,
            titleTxt,
            confidenceTxt,
            catsTxt,
            hitsTxt,
            typesTxt,
            aTxt,
            bTxt,
            cTxt,
            dTxt,
            annoyedCatImage,
            seriousCatImage,
            smileCatImage,
            stillCatImage,
            annoyedAHitTxt,
            annoyedBHitTxt,
            seriousAHitTxt,
            seriousBHitTxt,
            stillAHitTxt,
            stillBHitTxt,
            stillCHitTxt,
            smileAHitTxt,
            smileBHitTxt,
            smileCHitTxt,
            smileDHitTxt,

        ];
        this.setDisplays(displays);
    }

    frame10() {
        let displays = [];
        
        const width = canvas.width;
        const height = canvas.height;
        
        let bg = new Background("rgba(0,0,0, 0.7)");
        bg.setImage("../images/story-bg.jpg");
        let txt1 = new Text(
            `Every kid have some activities that interest them, that later on becomes their hobbies. Hobbies that in later
             time become their great skills.`
        , width / 2, height * 0.25, width * 0.025, "red",width * 0.7);
        txt1.setLineSpacing(20);

        let nextBtn = new Button(width / 2 - width * 0.1 / 2,height * 0.5,width * 0.1,height * 0.1,"NEXT");
        nextBtn.setStyles({
            origColor: "#FFC700",
            hoverColor: "#CCA300",
            textSize: width * 0.015,
            textColor: "white"
        });

        nextBtn.attachClick(() => {
            this.updateFrame(this._currentFrame + 1);
        });

        displays.push(bg);
        displays.push(nextBtn);
        displays.push(txt1);
        this.setDisplays(displays);
    }

    frame11() {
        let displays = [];

        const width = canvas.width;
        const height = canvas.height;

        let bg = new Background("rgba(0,0,0, 0.7)");
        bg.setImage("../images/story-bg.jpg");
        let txt1 = new Text(
            `Gabrielle sees what she likes to be DRAWING, she like to draw everywhere scribing on the wall,
             on the chair, tables, EVERYWHERE, she will even draw on your face if she got a chance.`
        ,width / 2, height * 0.25, width * 0.025, "red",width * 0.7);
        txt1.setLineSpacing(20);

        let nextBtn = new Button(width / 2 + width * 0.1 / 2,height * 0.5,width * 0.1,height * 0.1,"NEXT");
        let backBtn = new Button(width / 2 - width * 0.1 * 1.5,height * 0.5,width * 0.1,height * 0.1,"BACK");

        nextBtn.setStyles({
            origColor: "#FFC700",
            hoverColor: "#CCA300",
            textSize: width * 0.015,
            textColor: "white"
        });

        backBtn.setStyles({
            origColor: "#007F73",
            hoverColor: "#003D52",
            textSize: width * 0.015,
            textColor: "white"
        });
        
        nextBtn.attachClick(() => {
            this.updateFrame(this._currentFrame + 1);
        });

        backBtn.attachClick(() => {
            this.updateFrame(this._currentFrame - 1);
        });

        displays.push(bg);
        displays.push(nextBtn);
        displays.push(backBtn);
        displays.push(txt1);

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
        if (!this.Games.passion.hasRun) {
            this.Instructions.passion.init();
            this.sound.setFrameIsPlayState(false); // pause the sound, start it after the instruction is remove.
            this.sound.setIsPlayable(false);
        }


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
            this.pausedGame = this.Games.attention;
            this.pausedGame.pause();

        });

        // click the button to end the game.
        finishBtn.attachClick(() => {
            this.Games.passion.endGame();
        });

        displays.push(this.pauseButton);
        this.setDisplays(displays);
    }

    passionResultFrame() {
        // the time the game ends.
        gameEndTime = Date.now();

        let displays = [];
        
        const width = canvas.width;
        const height = canvas.height;

        const titleTxt = new Text("Passion Game Result",width / 2, height * 0.15, width * 0.05, "#F5DD61");
        
        const bg = new Background("rgba(0,0,0, 0.7)");
        bg.setImage("../images/story-bg.jpg");

        const comparisonTxt = new Text(
            `Comparison Result: `
        , width / 2, height * 0.25, width * 0.025, "red",width * 0.7);

        const comparisonResultTxt = new Text(
            `It doesn't matter whether you draw it perfectly or not, what matter is that you gave your full interest, love, and effort on it, those things only make it already perfect.`
        , width / 2, height * 0.35, width * 0.025, "red",width * 0.8);

        const noteTxt = new Text("-Note: I didn't make the algorithm yet to compare the two images, might add it in the future.",width * 0.7, height * 0.95, width * 0.01, "red");

        const nextBtn = new Button(width / 2 - width * 0.1 / 2,height * 0.8,width * 0.1,height * 0.1,"CONTINUE");
        nextBtn.setStyles({
            origColor: "#FFC700",
            hoverColor: "#CCA300",
            textSize: width * 0.015,
            textColor: "white"
        });

        const downloadTxt = new Text("DOWNLOAD your ART.",width * 0.2, height * 0.54, width * 0.01, "blue");
        const drawingBoardRatio = this.Games.passion.drawingBoard.width / this.Games.passion.drawingBoard.height;
        const drawingResultImg = new Component(width * 0.1,height * 0.55,height * 0.4 * drawingBoardRatio,height * 0.4,"red");
        drawingResultImg.setImage(Passion.drawingResult);

        const downloadBtn = new Button(width * 0.3,height * 0.87,width * 0.1,height * 0.08,"DOWNLOAD");
        downloadBtn.attachClick(() => {
            const downloadLink = document.querySelector("#downloadLink");

            const tempCanvas = document.createElement("canvas");
            const tempContext = tempCanvas.getContext("2d");

            tempCanvas.width = this.Games.passion.drawingBoard.width;
            tempCanvas.height = this.Games.passion.drawingBoard.height;

            const tempImage = new Image();
            tempImage.src = Passion.drawingResult;
            tempContext.drawImage(tempImage,0,0);
            
            const data = tempCanvas.toDataURL("image/png");
            data.replace("image/png","image/octet-stream");

            downloadLink.setAttribute("href",data);
            downloadLink.click();
        });

        // add border
        drawingResultImg.borderize("red");

        nextBtn.attachClick(() => {
            this.updateFrame(this._currentFrame + 1);
        });

        displays = [
            bg,
            nextBtn,
            titleTxt,
            comparisonTxt,
            comparisonResultTxt,
            noteTxt,
            drawingResultImg,
            downloadTxt,
            downloadBtn
        ]
        this.setDisplays(displays);
    }

    finishGameFrame() {
        let displays = [];
        
        const width = canvas.width;
        const height = canvas.height;
        
        const bg = new Background("rgba(0,0,0, 0.7)");
        bg.setImage("../images/story-bg.jpg");

        const titleTxt = new Text("Congratulations, for finishing the game!",width / 2, height * 0.15, width * 0.04, "blue");

        const messageTxt = new Text(
            `You finished it, how do you feel?`
        , width / 2, height * 0.23, width * 0.025, "red",width * 0.7);

        const statsTxt = new Text("Player Stats",width / 2, height * 0.35, width * 0.03, "green");

        const attentionTxt = new Text(`Attention Span: ${(playerStats.getAttentionSpan() * 100).toFixed(2)}%`,width / 2, height * 0.43,width * 0.03, "blue");
        const confidenceTxt = new Text(`Confidence: ${(playerStats.getConfidence() * 100).toFixed(2)}%`,width / 2, height * 0.5, width * 0.03, "blue");

        const totalTimeTxt = new Text(`Total Time: ${((gameEndTime - gameStartTime) / 1000)} seconds`,width / 2, height * 0.61,width * 0.02, "red");

        const nextBtn = new Button(width / 2 - width * 0.1 / 2,height * 0.64,width * 0.1,height * 0.1,"CONTINUE");
        nextBtn.setStyles({
            origColor: "#FFC700",
            hoverColor: "#CCA300",
            textSize: width * 0.015,
            textColor: "white"
        });

        nextBtn.attachClick(() => {
            this.updateFrame(this._currentFrame + 1);
        });

        displays = [
            bg,
            nextBtn,
            titleTxt,
            messageTxt,
            statsTxt,
            attentionTxt,
            confidenceTxt,
            totalTimeTxt
        ];
        this.setDisplays(displays);
    }

    messageFrame() {
        let displays = [];
        
        const width = canvas.width;
        const height = canvas.height;
        
        let bg = new Background("rgba(0,0,0, 0.7)");
        bg.setImage("../images/story-bg.jpg");
        let txt1 = new Text(
            `Cute Little Gabrielle, when you were able to read this I want you to know or rather I hope you already know and feel, or I hope we already made you know and feel, that you are a fantastic
            and marvelous kid that you are special as what you are.We know that you can achieve whatever it is in the world when you give your FOCUS on how to achieve it, and trying to achieve it, when you
            got a BRAVERY and COURAGENESS to face every struggle or challenge the you will encounter in your journey, I hope we can give you that COURAGE as you gave it to us, and also achieving it with a
            little bit help of INTEREST or PASSION on what you want to achieve, We want you to realize that we are always here for you and you can DO it, whatever struggles you are currently facing on
            and that We LOVE you.`
        , width / 2, height * 0.1, width * 0.025, "rgb(150,0,0)",width * 0.7);
        txt1.setLineSpacing(20);

        let nextBtn = new Button(width / 2 - width * 0.1 / 2,height * 0.8,width * 0.1,height * 0.1,"CONTINUE");
        nextBtn.setStyles({
            origColor: "#FFC700",
            hoverColor: "#CCA300",
            textSize: width * 0.015,
            textColor: "white"
        });

        nextBtn.attachClick(() => {
            this.updateFrame(1);
        });

        displays.push(bg);
        displays.push(nextBtn);
        displays.push(txt1);
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

        // re add the handler of the sound.
        this.sound.setIsPlayable(true);
        this.sound.addHandler();
        this.sound.playFrame(this._currentFrame);

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
            else if (display.drawImage) display.drawImage();

            for (let game in this.Games) {
                if (this.Games[game] == display && display.isPlayed) this.updateFrame(this._currentFrame + 1);
            }
        }

        this.sound.draw();
        this.cursor.draw();
    }
}

export default canvas;
export {canvas,context, Display};
