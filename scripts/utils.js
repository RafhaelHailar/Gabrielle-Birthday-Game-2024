/*
 * Turn a non rgb color to a rgb.
 *   Example:   
 *      "red" -> [255,0,0]
 *  
 * @param {string} color The color value we wanted to change to rgb.
 * @return {int[]} The rgb value of the color.
 */

function toRGB(color) {
   // create a canvas to get the rgb value of the 'color' argument given.
   const canvas = document.createElement("canvas");
   canvas.width = canvas.height = 1;

   const context = canvas.getContext("2d");
   context.fillStyle= color;
   context.fillRect(0,0,1,1);

   const colors = context.getImageData(0,0,1,1).data; // the rgb data color of 'color'.

   return [colors[0],colors[1],colors[2]]; 
}

/*
 * Find the biggest number in the array.
 *
 * @param {number[]} numbers The collection of numbers we will look for the biggest number on.
 * @return {number} The biggest number.
 */
function max(...numbers) {
    let maximum = numbers[0];

    for (let i = 1;i < numbers.length;i++) {
        if (numbers[i] > maximum) maximum = numbers[i];
    }

    return maximum;
}

/*
 * Turn a rgb value to hexadecimal.
 *
 * @param {number} r The red value of rgb.
 * @param {number} g The green value of rgb.
 * @param {number} b The blue value of rgb.
 * @return {string} The resulting hexadecimal.
 */
function rgbToHex(r,g,b) {
    if (r > 255) r = 255;
    if (g > 255) g = 255;
    if (b > 255) b = 255;
    return ((r << 16) | (g << 8) | b).toString(16);
}

export { rgbToHex, toRGB, max };
