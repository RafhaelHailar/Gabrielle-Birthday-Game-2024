import Button from "./Button.js";
import {context} from "../screen.js";

class Modal {
/*
 * Creates a modal, which is a rectangular shape thing that contains contents, and a buttons for closing or other actions.
 *
 * @params [x-color] The positions(x,y), dimensions(width,height), and the color.
 */
    constructor(x,y,width,height,color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.image = null;
        this.isHide = false; // tells whether this modal is not shown or not.
        this.contents = []; // the contents inside the modal, which is just other ui's.
        this.closeButton = new Button(x + width / 2 - 100,y + height - 50,200,100,"CLOSE");
        this.closeButton.attachClick(() => this.isHide = true);
    }

    /*
     * Add contents of the modal.
     *
     * first idea: I first go with a function that have a rest parameter because I think it will make adding all the contents of this,
     * modal be easier to make the job done, but then I remember that when I'm going to add a button on it I have to attach an handler for that button,
     * and when I do that I had to put the button in a variable first making it take names for variable (and naming things kinda painful when you have limited names you can use),
     * then I add it to the addContent function like this.
     *
     * var otherButton = new Button(...);
     * var button = new Button(...);
     * button.attachClick(function() {do something...});
     *
     * modal.addContent(other content,other content,button);
     *
     * that's why I decided to instead of accepting a rest parameter, this function will accept a function that will return the ui of the modals.
     * so it's kinda like this.
     *
     * var otherButton = new Button(...);
     * addContent(function() {
     *    var button = new Button(...)
     *    button.attachClick(function() {do something...});
     *      
     *    return [other ui,...,button];
     * });
     *
     * making it not only doesn't take too much of the names but also helping us to make it easier to read.
     *
     * first idea: @param {ui[]} Collections of ui that can be added in the modal.
     * @param {function} getContents A function that gives that contents of this modal.
     */
    addContent(getContents) {
        if (!getContents) return;
        if (typeof getContents != "function") throw new Exception("getContents is anything but a function!");
        
        const contents = getContents().map(content => {
           // make every content position relative to the modal.
           const x = this.x + content.y;
           const y = this.y + content.y;
           if (content.setPosition) {
               content.setPosition(x,y);
           } else {
               content.x = x;
               content.y = y;
           }

           return content;
        });

        this.contents.push(...contents);
    }

    /*
     * Set the background as an image.
     *
     * @param {string} The source of the image.
     */
    setImage(image) {
        this.image = new Image();
        this.image.src = image;
    }

    // set the hide or not of the modal.
    setIsHide(isHide) {
        this.isHide = isHide;
    }

    draw() {
        if (this.isHide) return;
        if (this.image) {
            context.drawImage(this.image,this.x,this.y,this.width,this.height);
        } else {
            context.fillStyle = this.color;
            context.fillRect(this.x,this.y,this.width,this.height);
        }

        this.contents.forEach(content => {
            // if the content have an update, update it instead of just draw, otherwise just draw it.
            if (content.update) content.update();
            else content.draw();
        });

        this.closeButton.update();
    }
}


export default Modal;
