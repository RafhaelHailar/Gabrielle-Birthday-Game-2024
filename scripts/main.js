import { SchedulesHolder, DeltaTime } from "./timer.js";
import { Display } from "./screen.js";

let startTime = performance.now(); // used for comparing the current time to previous time.
const display = new Display();
const schedules = new SchedulesHolder();
const deltatime = new DeltaTime();

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

requestAnimationFrame(update);


