import { context } from "./screen.js";
import ImageHolder from "./image.js";

const mouseMoveFunctions = [];
const mouseClickFunctions = [];
const mouseUnClickFunctions = [];
const keyDownFunctions = [];
const keyUpFunctions = [];

let toBeRemoveClickFunctions = [];

let clickHandlerId = 0; // the id of the click handlers, it will iterate so every id is unique.

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

        this.handImage = ImageHolder.HAND_CURSOR;
        this.imageWidth = this.handImage.width;
        this.imageHeight = this.handImage.height;
        this.add();

        this.pencilImage = ImageHolder.PENCIL_CURSOR_GAME_3;
        
        this.type="hand";

        // hide the cursor image.
        this.isHidden = false;
    }

    /*
     *
     * Update or change the type of the cursor, for its image.
     *
     * @param {number}["hand"|"pencil"] type The type of the cursor.
     */
    setType(type) {
        this.type = type;
    }

    // update the image, its width and height, having the 'hand image' as our default.
    updateImage() {
        let image = this.handImage;

        if (this.type == "pencil" && this.pencilImage) {
            image = this.pencilImage;
        }

        this.image = image;
        if (this.image) {
            this.imageWidth = image.width;
            this.imageHeight = image.height;
        }
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
        this.updateImage();
        if (!this.image) return;

        if (!this.isHidden) {
            // update the image source x when clicked.
            let cursorSpriteX = 0;
            if (this.clicked && this.image == this.handImage) cursorSpriteX = 1;

            // adjust the image source width for the hand image.
            let imageWidth = this.imageWidth / 2 - 20;

            // image canvas x and y varies depend on the image.
            let canvasX = this.x;
            let canvasY = this.y;

            if (this.type == "pencil") {
                imageWidth = this.imageWidth;
                
                canvasX = this.x;
                canvasY = this.y - this.height;
            } 

            if (this.image) {
                context.drawImage(
                    this.image,
                    cursorSpriteX * (this.imageWidth / 2 - 30),
                    0,
                    imageWidth,
                    this.imageHeight,
                    canvasX,
                    canvasY,
                    this.width,
                    this.height
                );
                
                // the bounding box of the cursor.
                // context.strokeRect(this.x,this.y,this.width,this.height);
            }
        }
        // the target of the hand cursor.
   //     context.fillStyle = "red";
   //     context.fillRect(this.x,this.y,2,2);
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
 *
 * @param {number} The handler id.
 */


function addClickHandler(handler,{target} = {}) {
    const result = function(event) {
        if (target && !(target && isInTarget(event,target))) return;

        // call the handler passing the position x and y of the mouse.
        handler({x: event.clientX,y: event.clientY});
    }

    let handlerId = clickHandlerId++; // iterate to produce new id for other handlers

    mouseClickFunctions.push({
        id: handlerId, 
        action: result
    });

    return handlerId;
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
 * Removes a click handler based on id.
 *
 * @param {number} id The id of the click handler.
 */
function removeClickHandler(id) {
    // we use binary search bcoz, why not? yeahh I learned it so I use it. lol
    let min = 0;
    let max = mouseClickFunctions.length;

    let index = null; // the handler we are looking for.
   
    while (max >= min) {
        let mid = Math.floor((min + max) / 2);
        let midItem = mouseClickFunctions[mid];
        let midId = midItem.id;
        
        if (midId > id) max = mid - 1;
        else if (midId < id) min = mid + 1;
        else {
            index = mid;
            break;
        }
    }

    // throw an error if a handler with such id is not found.
    if (index == null) {
        console.log(mouseClickFunctions);
        throw new Error("Click handler with id: " + id + " is not found.");
    }

    mouseClickFunctions[index].toBeRemove = true; // set to be remove handler.
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
        if (cursor.type == "hand") {
            // the size of the click detection.
            const targetSize = 20;
            x += targetSize / 2;
            width = height = targetSize;
        }
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
    // reset the to be remove functions.
    toBeRemoveClickFunctions = [];

    mouseClickFunctions.forEach(func => {
        if (func.toBeRemove) toBeRemoveClickFunctions.push(func);
        else func.action(event);

    });

    // remove the to be remove handlers.
    for (let i = 0;i < toBeRemoveClickFunctions.length;i++) {
        const index = mouseClickFunctions.indexOf(toBeRemoveClickFunctions[i]);
            
        // remove the click handler
        mouseClickFunctions.splice(index,1);
    }
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


export { Cursor, addMouseMoveHandler, addClickHandler, addUnClickHandler, addKeyDownHandler,addKeyUpHandler,removeHandlers, removeClickHandler};
