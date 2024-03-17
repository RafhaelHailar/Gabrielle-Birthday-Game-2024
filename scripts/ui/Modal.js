import Component from "./Component.js";
import Button from "./Button.js";
import {context} from "../screen.js";

class Modal extends Component{
/*
 * Creates a modal, which is a rectangular shape thing that contains contents, and a buttons for closing or other actions.
 *
 * @params [x-color] The positions(x,y), dimensions(width,height), and the color.
 */
    constructor(x,y,width,height,color) {
        super(x,y,width,height,color);
        this.image = null;
        this.isHide = false; // tells whether this modal is not shown or not.
        this.contents = []; // the contents inside the modal, which is just other ui's.
        this.closeButton = new Button(x + width / 2 - 100,y + height - 50,200,100,"CLOSE");
        this.closeButton.isHide = false; // tells whether we hide the close button or not.
    }

    /*
     * Add contents of the modal.
     *
     * this is my first time I ever write my previous ideas, don't know why I didn't think of it before, I should have done it before, because
     * it might help me when I get old and for some reason I get amnesia or easily forgot things woo hoo hoo.
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
        this.getContents = getContents;    
    }

    setContents() {
        const contents = this.getContents().map(content => {
           // make every content position relative to the modal.
           const x = this.x + content.x;
           const y = this.y + content.y;
           if (content.setPosition) {
               content.setPosition(x,y);
           } else {
               content.x = x;
               content.y = y;
           }

           return content;
        });

        this.contents = contents;
    }

    /* 
     * Set the style for close button.
     *
     * @param {object} The styles that's going to be applied to the close button.
     *      :properties:
     *         .isHide Sets whether we show or hide the close button
     * Note might add some later.
     */
    setCloseStyle({isHide} = {}) {
       this.closeButton.isHide = isHide; 
    }


    // set up the modal.
    init() {
        this.setContents();
        this.setIsHide(false);
        this.closeButton.attachClick(() => this.setIsHide(true));
    }

    // restart the setup
    restart() {
        this.init();
    }

    // set the hide or not of the modal.
    setIsHide(isHide) {
        this.isHide = isHide;
    }

    draw() {
        if (this.isHide) return;

        if (this.image) this.drawImage();
        else this.drawRect();

        this.contents.forEach(content => {
            // if the content have an update, update it instead of just draw, otherwise just draw it.
            if (content.update) content.update();
            else if (content.draw) content.draw();
            else if (content.drawImage) content.drawImage();
        });

        if (!this.closeButton.isHide)
            this.closeButton.update();
    }
}


export default Modal;
