import { context } from "./screen.js";

const mouseMoveFunctions = [];
const mouseClickFunctions = [];
const mouseUnClickFunctions = [];
const keyDownFunctions = [];
const keyUpFunctions = [];

// creates the cursor.
class Cursor {
    static instance = null;
    constructor() {
        if (Cursor.instance == null) Cursor.instance = this;
        else return Cursor.instance;
        
        this.x = 100;
        this.y = 100;
        this.width = 70;
        this.height = 70;
        this.image = null;
        this.clicked = false;
        this.resetSpriteId = null;

        const cursorImage = new Image();
        cursorImage.src = "../images/mickey-mouse-hand-inflated-glove-custom-cursor.png";
        cursorImage.onload = () => {
            this.image = cursorImage;
            this.imageWidth = cursorImage.width;
            this.imageHeight = cursorImage.height;
            this.add();
        };
        
        // hide the cursor image.
        this.isHidden = false;
    }

    // add the cursor to the screen, and its handlers.
    add() {
        function mouseMoveHandler(event) {
            this.x = event.clientX - (this.width / 2);
            this.y = event.clientY - (this.height / 2);
        }
        addMouseMoveHandler(mouseMoveHandler.bind(this));

        function clickHandler() {
            this.clicked = true;
        }

        addClickHandler(clickHandler.bind(this));

        function unClickHandler() {
            this.clicked = false;
        }

        addUnClickHandler(unClickHandler.bind(this));
    }

    /*
     * Hide / Show the cursor image.
     *
     * @param {booelean} toHide Tells whether to we will hide the cursor or not.
     */
    setIsHidden(toHide) {
        this.isHidden = toHide;

        // show or hide the default cursor.
        document.body.classList.toggle("nocursor",!toHide);
    }

    // draw the cursor to the screen if its image is ready.
    draw() {
        if (!this.image) return;
        let cursorSpriteX = 0;
        if (this.clicked) cursorSpriteX = 1;
        
        if (!this.isHidden) {
            context.drawImage(this.image,cursorSpriteX * (this.imageWidth / 2 - 30),0,this.imageWidth / 2 - 20,this.imageHeight,this.x,this.y,this.width,this.height);
            context.strokeRect(this.x,this.y,this.width,this.height);
        }
    }
};


/*
 * Add function to the array of functions
 * that will be called continuesly.
 *
 * Those function handle the event depend on what type.
 *
 * @param {function} handler The handler function.
 * @param {object} {target} The target object that contains a position and dimension we wanted the action to happen to. 
 */


function addClickHandler(handler,{target} = {}) {
    const result = function(event) {
        if (target && !(target && isInTarget(event,target))) return;

        // call the handler passing the position x and y of the mouse.
        handler({x: event.clientX,y: event.clientY});
    }
    mouseClickFunctions.push(result);
}

function addMouseMoveHandler(handler,{target} = {}) {
    const result = function(event) {
        if (!(target && isInTarget(event,target))) return;

        // call the handler passing the position x and y of the mouse.
        handler({x: event.clientX,y: event.clientY});
    }
    mouseMoveFunctions.push(handler);
}

function addUnClickHandler(handler) {
    mouseUnClickFunctions.push(handler);
}

function addKeyDownHandler(handler) {
    keyDownFunctions.push(handler);
}

function addKeyUpHandler(handler) {
    keyUpFunctions.push(handler);
}

/*
 * Checks whether we are on the target shape,
 * that we wanted to call the event handler to.
 *
 * @param {event object} The event object that has the x and y of the action that happened in the game.
 * @param {object} The target object.
 */
function isInTarget(event,target) {
    const cursor = new Cursor();
    let x = cursor.x;
    let y = cursor.y;
    let width = 0;
    let height = 0;

    if (!cursor.isHidden) {
        // the size of the click detection.
        const targetSize = 20;
        x += targetSize / 2;
        width = height = targetSize;
    }

    return x + width > target.x && x < target.x + target.width && y + height > target.y && y < target.y + target.height;
}

/*
 * Remove all the handlers, by emptying all the function arrays.
 */
function removeHandlers() {
    while (mouseMoveFunctions.length > 0) mouseMoveFunctions.pop();
    while (mouseClickFunctions.length > 0) mouseClickFunctions.pop();
    while (keyDownFunctions.length > 0) keyDownFunctions.pop();
    while (keyUpFunctions.length > 0) keyUpFunctions.pop();
}


/*
 * Handle the events, and call all the function handlers in the,
 * array of functions.
 */
window.addEventListener("mousemove",function(event) {
    mouseMoveFunctions.forEach(func => {
        func(event);
    });
});

window.addEventListener("mousedown",function(event) {
    mouseClickFunctions.forEach(func => {
        func(event);
    });
});

window.addEventListener("mouseup",function(event) {
    mouseUnClickFunctions.forEach(func => {
        func(event);
    });
});

window.addEventListener("keydown",function(event) {
    keyDownFunctions.forEach(func => {
        func(event);
    });
});

window.addEventListener("keyup",function(event) {
    keyUpFunctions.forEach(func => {
        func(event);
    });
});


export { Cursor, addMouseMoveHandler, addClickHandler, addUnClickHandler, addKeyDownHandler,addKeyUpHandler,removeHandlers };
