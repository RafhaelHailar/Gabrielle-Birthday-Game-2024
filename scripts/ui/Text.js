import { canvas, context } from "../screen.js";
import Component from "./Component.js";

class Text extends Component {
/*
 * Create a text component.
 *
 * @param {string} text The text that you wanted to display.
 * @param {x} The x position of the text.
 * @param {y} The y position of the text.
 * @param {number} size The size of the text.
 * @param {string} color The color of the text.
 * @param {number} boxWidth The width of the container box of the text.
 *
 */
    constructor(text,x,y,size,color,boxWidth) {
        super(x,y,boxWidth,0,color);
        this.text = text;
        this.size = size; 
        this.linespace = 35; // the space of the lines when text have collapse in to new line.
        this.fontFamily = "Varela Round"; // the font family of the text.
        this.fontWeight = "normal"; // the text font weight
        this.boxWidth = boxWidth;
        this.alignment = "center"; // the text alignment, default is center.
    }

    /*
     * Change the container box width of the text.
     *
     * @param {number} boxWidth The new width of the container box.
     */
    setBoxWidth(boxWidth) {
        this.boxWidth = boxWidth;
    }

    /*
     * Change the horizontal alignment of the text.
     *
     * @param {string} alignment The new horizontal alignment.
     */
    setAlignment(alignment) {
        this.alignment = alignment;
    }
    
    /*
     * The space of the lines.
     *
     * @param {number} linespace The new space in lines.
     */
    setLineSpacing(linespace) {
        this.linespace = linespace;
    }

    /*
     * Change the font family of the text.
     *
     * @param {string} fontFamily The new font family of the text.
     */
    setFontFamily(fontFamily) {
        this.fontFamily = fontFamily;
    }

    /*
     * Set the font weight.
     * 
     * @param {number | string} weight The new font weight of the text.
     */
    setFontWeight(weight) {
        this.fontWeight = weight;
    }

    /*
     * Set multiple style of the text.
     *
     * @params {object} {family,weight} The object that contains new style of the text.
     *      :Object Properties: 
     *          "family The new font family.
     *          "weight The new font weight.
     *          "color The new color of the font.
     */
    setStyles({
        family = this.fontFamily,
        weight = this.fontWeight,
        color = this._color,
        linespace = this.linespace,
        alignment = this.alignment,
    } = {}) {
        this.setFontFamily(family);
        this.setFontWeight(weight);
        this.setColor(color);
        this.setLineSpacing(linespace);
        this.setAlignment(alignment);
    }

    // draw the text.
    draw() {
        // how long until the text collapse in to a new line.
        let width = this.boxWidth != null ? this.boxWidth : canvas.width;

        const texts = [""];
        const words = this.text.split(" ");
        context.fillStyle = this._color;
        context.font = `${this.fontWeight} ${this.size}px ${this.fontFamily ? this.fontFamily : 'Arial'}`;
        context.textAlign = this.alignment;
        context.textBaseline = "middle";

        let size = this.size / 2;
        for (let i = 0;i < words.length;i++) { 
           let word = words[i];  

           if (word == "") continue;

           let lastLineLength = texts[texts.length - 1].length;
           let totalWidth = lastLineLength * size;
           
           if (word.length * size + totalWidth <= width) 
               texts[texts.length - 1] += " " + word;
           else texts.push(word);
        }

        for (let i = 0;i < texts.length;i++) {
            const buffer = this.linespace;
            const text = texts[i];
            context.fillText(text,this.x,this.y + (size + buffer) * i );
        }
    }
}

export default Text;
