import { SchedulesHolder, DeltaTime } from "./timer.js";
import { Display } from "./screen.js";

let startTime = performance.now(); // used for comparing the current time to previous time.
const display = new Display();
const schedules = new SchedulesHolder();
const deltatime = new DeltaTime();

// tells whether all the resources is loaded, and the game started.
let isGameStarted = false;

function update(currentTime) {
    const deltaTime = currentTime - startTime; // difference from starts to end. 
    deltatime.set(deltaTime);

    if (currentTime != startTime) {
        startTime = currentTime;
    }

    display.update(); 
    schedules.checkSchedules();
    requestAnimationFrame(update);
}

// all the game resources
// [html id,source]
const RESOURCES = [
    ["game-menu-bg","./images/game-menu-bg.jpg"],
    ["hand-cursor-image","./images/mickey-mouse-hand-inflated-glove-custom-cursor.png"],
    ["story-bg","./images/story-bg.jpg"],
    ["pause-bg","./images/pause-bg.jpg"],
    ["modal-bg","./images/modal-bg.webp"],
    ["result-bg","./images/result-bg.jpg"],
    ["sound-on-image","./images/sound-on.png"],
    ["sound-off-image","./images/sound-off.png"],
    ["game-1-bg","./images/game-1-bg.jpg"],
    ["car-toy-image-game-1","./images/car-toy-game-1.png"],
    ["teddy-bear-image-game-1","./images/teddy-bear-game-1.png"],
    ["cellphone-image-game-1","./images/cellphone-game-1.png"],
    ["game-2-bg","./images/game-2-bg.jpg"],
    ["player-normal-image-game-2","./images/player-normal-game-2.jpg"],
    ["player-damage-image-game-2","./images/player-damage-game-2.jpg"],
    ["player-house-image-game-2","./images/squirrel-house-game-2.png"],
    ["cat-annoyed-cute-rectangle-image-game-2","./images/cat-annoyed-cute-rectangle-game-2.png"],
    ["cat-serious-cute-rectangle-image-game-2","./images/cat-serious-cute-rectangle-game-2.png"],
    ["cat-smile-cute-rectangle-image-game-2","./images/cat-smile-cute-rectangle-game-2.png"],
    ["cat-still-cute-rectangle-image-game-2","./images/cat-still-cute-rectangle-game-2.png"],
    ["game-3-bg","./images/game-3-bg.jpg"],
    ["pencil-cursor-image-game-3","./images/pencil-cursor.png"],
    ["distracting-image-game-3","./images/monkey-smiling-distraction.jpg"],
    ["to-draw-image-game-3","./images/ice-cream-drawing.jpg"],
    ["button-click-audio","./sounds/button-click.mp3"],
    ["menu-audio","./sounds/menu.mp3"],
    ["story-audio","./sounds/story.mp3"],
    ["result-audio","./sounds/result.mp3"],
    ["game-1-audio","./sounds/attention.mp3"],
    ["safe-click-game-1-audio","./sounds/safe-click-game-1.mp3"],
    ["danger-click-game-1-audio","./sounds/danger-click-game-1.mp3"],
    ["game-2-audio","./sounds/confidence.mp3"],
    ["hit-game-2-audio","./sounds/hit-game-2.mp3"],
    ["game-3-audio","./sounds/passion.mp3"],
    ["message-audio","./sounds/message.mp3"]
]

/*
 * Load our resources.
 *
 * @param {array[]} [html id,resources source][] resources A collection of resources, html id and their source.
 * @param {function} progressCallback An action that will happen everytime a request for a resource progress.
 */
function loadResources(resources,progressCallback) {
    let end = 0;
    let current = 0;
    const Progress = {};
    const resourcesContainer = document.getElementById("resources");

    for (let resource of resources) {
        const [id,src] = resource;

        const xhr = new XMLHttpRequest();
        xhr.open("GET",src,true);
        xhr.responseType = "arraybuffer";

        xhr.onprogress = function(e) {
            if (e.lengthComputable) {
                if (!Progress[id]) {
                    Progress[id] = {loaded: e.loaded,total: e.total};
                    end += e.total;
                    current += e.loaded;
                } else {
                    current += e.loaded - Progress[id].loaded;
                    Progress[id].loaded = e.loaded;
                }

                progressCallback(current / end);
            }
        }

        xhr.onloadend = function(e) {
            const option = {};
            const headers = xhr.getAllResponseHeaders();
            const type = headers.match(/^Content-Type\:\s*(.*?)$/mi);

            if (type && type[1]) {
                option.type = type[1];
            }

            const blob = new Blob([this.response],option);
            const blobURL = URL.createObjectURL(blob);

            if (type[1].split("/")[0] == "image") {
                const image = document.createElement("img");
                image.src = blobURL;
                resourcesContainer.appendChild(image);
            } else {
                const audio = document.createElement("audio");
                audio.src = blobURL;
                resourcesContainer.appendChild(audio);
            }
            progressCallback(current / end);
        }

        xhr.send();
    }
}

/*
 * Update the size of the progressbar and start the game when the resources already loaded.
 *
 * @param {number} progress A number from 0 to 1 that will tell the width of the progress bar.
 */
const progressbar = document.querySelector("#progressbar > div");
const dotsContainer = document.querySelector("#loader .loading-text span");
function updateProgressBar(progress) {
    progressbar.style.width = `${progress * 100}%`;

    if (dotsContainer.innerHTML.length < 3) dotsContainer.innerHTML += ".";
    else dotsContainer.innerHTML = "";

    if (!isGameStarted && progress == 1) {
        const loader = document.getElementById("loader");
        loader.style.display = "none";
        requestAnimationFrame(update);
    }
}

loadResources(RESOURCES,updateProgressBar);

/*
window.addEventListener("DOMContentLoaded",function() {
    requestAnimationFrame(update);
});
*/
