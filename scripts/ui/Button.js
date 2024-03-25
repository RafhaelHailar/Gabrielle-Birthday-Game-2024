import { canvas, context } from "../screen.js";
import Text from "./Text.js";
import Component from "./Component.js";
import { addMouseMoveHandler, addClickHandler } from "../eventHandlers.js";
import SoundHandler from "../sound.js";

class Button extends Component {
/*
 * Creates a button component for ui.
 *
 * @params [x-height] The same as the component class [x-height] params.
 * @param {string} text The text that will be inserted in the button.
 */
    constructor(x,y,width,height,text,color = "black") {
        super(x,y,width,height,color);

        this._textColor = "white"; //color of the text default to 'white'.
        this._textSize = 16; // size of the text.
        
        //text text that was inside the button.
        //centering the text in the button.
        this.text = new Text(text, x + (width / 2), y + (height / 2), 16, this._textColor);

        this.prevMouseOver = this.mouseOver = false;
        this.animationSpan = 700; // how fast the animation is for changing color.

        /*
         * Button color animation handler.
         *
         * @param {number} x The x position of mouse.
         * @param {number} y The y position of mouse.
         */
        function handleHover({x,y}) {
            if (x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height) {
                this.mouseOver = true;
            } else this.mouseOver = false;
        }
        const hoverOnButton = handleHover.bind(this);
        addMouseMoveHandler(hoverOnButton);
        
    }

    // attach a click event, the same as the parent class 'Component', but add with button sound.
    attachClick(action,isOnce) {
        const sound = new SoundHandler();
        const handler = () =>  {
            action.bind(this)();

            sound.play("./sounds/button-click.mp3",{
                volume: 0.2
            });
        }
        super.attachClick(handler,isOnce);
    }

    /*
     * Change or update the color of the text.
     *
     * @param {string} color The color of the text you wanted to change into.
     */
    setTextColor(color) { 
        this._textColor = color;
        this.text.setColor(color);
    }
    

    /*
     * Set the new position of the button, changing the position of the text also.
     * @param {x} The new x position.
     * @param {y} the new y position.
     */
    setPosition(x,y) {
        this.x = x;
        this.y = y;
        this.text.x = x + this.width / 2;
        this.text.y = y + this.height / 2;
    }

    /*
     * Set the size of the text.
     *
     * @param {number} size The size of the text.
     */
    setTextSize(size) {
        console.log("NEW SIZE " + size);
        this._textSize = size;
        this.text.size = this._textSize;
    }

    /*
     * Set multiple style of the text.
     *
     * @params {object} {color,textColor,textSize,textFamily} The object that contains new style of the text.
     *      :Object Properties: 
     *          "color The new color of the button.
     *          "origColor The new original color of the button for animation.
     *          "hoverColor The new hover color of the button.
     *          "textColor The new color of the text.
     *          "textSize The new size of the text.
     *          "textWeight The new weight of the text.
     *          "textFamily The new font family of the text.
     *          "isHide Tells whether the button is gonna be hidden or not.
     */
    setStyles({
        color = this._color,
        origColor = this.origColor,
        hoverColor = this.hoverColor,
        textColor = this._textColor,
        textSize = this._textSize,
        textWeight = this.text.fontWeight,
        textFamily = this.text.fontFamily,
        isHide = this.isHide
    } = {}) {
        this.setColor(color);
        this.setOriginalColor(origColor);
        this.setHoverColor(hoverColor);
        this.setTextColor(textColor);
        this.setTextSize(textSize);
        this.text.setFontWeight(textWeight);
        this.text.setFontFamily(textFamily);
        this.setIsHide(isHide);
    }


    // draw the button and the text.
    draw() {
        context.fillStyle = this._color;
        context.fillRect(this.x,this.y,this.width,this.height);

        this.text.draw();
    }

    // draw the buttons and keep track for hovering on the button.
    update() {
        this.draw();

        if (this.prevMouseOver != this.mouseOver) {

           if (this.mouseOver) {
               this.animateChangeColor(this.hoverColor,(
                   () => {
                       return !this.mouseOver;             
                   }).bind(this)
               );
           } else {
               let duration = this.animationSpan * 1;
               this.animateChangeColor(this.origColor,duration);
           }
           this.prevMouseOver = this.mouseOver;
        }
    }
}

export default Button;
