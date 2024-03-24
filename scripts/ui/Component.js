import { TimeoutBuilder, SchedulesHolder, DeltaTime  } from "../timer.js";
import { toRGB, rgbToHex, max } from "../utils.js";
import { addClickHandler, removeClickHandler } from "../eventHandlers.js";
import { context } from "../screen.js";

// scheduler
const schedules = new SchedulesHolder();
// delta time of the game
const deltatime = new DeltaTime();

class Component {
/*
 * Create a display component.
 *
 * @param {number} x The x position of the display.
 * @param {number} y The y position of the display.
 * @param {number} width The width of the display.
 * @param {number} height The height of the display.
 * @param {string} color The color of the display.
 *
 */
    constructor(x,y,width,height,color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        //keep tracks the original color, for the animating color.
        this.origColor = this._color = color;
    }

    /*
     * Change or update the color of the display.
     *
     * @param {string} color The color the display will change into.
     */
    setColor(color) {
        this._color = color;
    }

    /*
     * Set the original color of the component for animating color and also updates the current and hover color.
     *
     * @param {string} color The original color of the component.
     */
    setOriginalColor(color) {
        this.setColor(color);
        this.setHoverColor("black");
        this.origColor = color;
    }

    /*
     * Set the color of the component when hover for animating color.
     *
     * @param {string} color The color of the component when hovering.
     */
    setHoverColor(color) {
        this.hoverColor = color;
    }

    // set whether its hidden or not, for disabling event handler when it was hidden.
    setIsHide(isHide) {
        this.isHide = isHide;
    }

    /*
     * Add image as the backgronud of the component.
     *
     * @param {string} imgSrc The source of the image.
     * @param {object} filters The filters of the image.
     */
    setImage(imgSrc,{opacity = 1,grayscale = 0,brightness = 1} = {}) {
        const image = new Image();
        image.src = imgSrc;
        image.addEventListener("load",(() => {
            this.image = image;
            this.imageFilters = {opacity,grayscale,brightness}; 
        }));
    }

    /*
     * Make the display clickable.
     *
     * @param {function} action The action that will happen when the display is clicked.
     * @param {boolean} isOnce Tells whether the handler on the component only happen once, so the component is clickable only once.
     */
    attachClick(action,isOnce) {
        let handlerId;
        const clickOnButton = (() => {
            if (!this.isHide)
            action.bind(this)();

            if (isOnce)
                removeClickHandler(handlerId);
        });
        handlerId = addClickHandler(clickOnButton,{target: this});
    }
    
    // draw the image background if it exists.
    drawImage() {
        // if it is hidden don't draw.
        if (this.isHide) return;

        context.save();
        if (this.imageFilters) {
            const {opacity,grayscale,brightness} = this.imageFilters;
            context.filter = `brightness(${brightness * 100}%) grayscale(${grayscale * 100}%)`;
            context.globalAlpha = opacity;
        }
        if (this.image)
            context.drawImage(this.image,this.x,this.y,this.width,this.height);
        context.restore();

        if (this.borderColor) 
            this.drawBorder();
    }


    // draw the rectangle of the component.
    drawRect() {
        // if it is hidden don't draw.
        if (this.isHide) return; 

        context.fillStyle = this._color;
        context.fillRect(this.x,this.y,this.width,this.height);
    }   

    // draw the border of the component.
    drawBorder() {
        // if it is hidden don't draw.
        if (this.isHide) return; 

        context.strokeStyle = this.borderColor;
        context.strokeRect(this.x,this.y,this.width,this.height);
    }

    /*
     * Add border for the component
     *
     * @param {color} The color of border.
     */
    borderize(color) {
        this.borderColor = color;
    }

    /*
     * Change the color of the display to a target color slowly.
     *
     * @param {string} color The color the display will slowly change into.
     * @param {function | number} endAt A function the tells when the animation ends or the duration of the animation.
     * @param {function} callback A action that will happen after the color animation ends.
     */
    animateChangeColor(color,endAt,callback) {
       let span = this.animationSpan; // how fast the color changes.
       let duration; // how long will the animation last.
       let ender; // when will the animation ends.

       // get the current color of the display in rgb.
       const componentColors = context.getImageData(this.x,this.y,this.width,this.height).data;
       // get the rgb of the color we wanted to change into.
       const targetColors = toRGB(color);

       // calculate the initial difference of the values of two colors.
       const deltaR = Math.abs(targetColors[0] - componentColors[0]); // the difference of red data
       const deltaG = Math.abs(targetColors[1] - componentColors[1]); // the difference of green data
       const deltaB = Math.abs(targetColors[2] - componentColors[2]); // the difference of blue data

       // find the absolute maximum number of the diffrence
       // for calculating how much we will add to the changing of color.
       const deltaMax = max(deltaR,deltaG,deltaB);

       // set how the 'Timeout' will behave.
       if (typeof endAt == "number") duration = endAt;
       else if (typeof endAt == "function") ender = endAt;

       // the 'Timeout' of animation.
       const changeColor = () => {
           // get the current color
           const componentColors = toRGB(this._color);  
        
           // get the difference between the color we wanted to current color.
           const deltaR = targetColors[0] - componentColors[0]; // the difference of red data
           const deltaG = targetColors[1] - componentColors[1]; // the difference of green data
           const deltaB = targetColors[2] - componentColors[2]; // the difference of blue dat

           // the new color we computed.
           let newR = componentColors[0];
           let newG = componentColors[1];
           let newB = componentColors[2];

           // how much will be added to the new colors every time.
           const amount = (deltaMax / span) * deltatime.get();

           // when the difference is negative we increase the new color.
           // when it was positive we decrease.
           // we wanted it to keep close to 0.
           if (deltaR < 0) newR -= amount;
           else if (deltaR > 0) newR += amount;

           if (deltaG < 0) newG -= amount;
           else if (deltaG > 0) newG += amount;

           if (deltaB < 0) newB -= amount;
           else if (deltaB > 0) newB += amount;

           // apply the new color.
           this.setColor(`rgb(${newR},${newG},${newB})`);
       };

       // create the 'Timeout'.
       let timer = new TimeoutBuilder(changeColor);

       if (duration) timer = timer.setDuration(duration);
       else if (endAt) timer = timer.setEnder(endAt);

       timer = timer.setCallback(callback)
       .build();

       schedules.addSchedule(timer);
    }

}

export default Component;
