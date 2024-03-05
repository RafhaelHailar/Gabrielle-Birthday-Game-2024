/*
 * Hold all the schedules in our entire program, which are 'Timeout's,
 * and have the action you can perform on the collection.
 *
 * Will only be initialize by once.
 */
class SchedulesHolder {
    static instance = null;
    constructor() {
        if (SchedulesHolder.instance == null) {
            SchedulesHolder.instance = this;
        } else return SchedulesHolder.instance;

        this._schedules = []; // the schedules or 'Timeout's.
    }

    // get the index of a schedule.
    getIndexOfSchedule(schedule) {
        return this._schedules.indexOf(schedule);
    }

    // add the schedule in the collection.
    addSchedule(schedule) {
        this._schedules.push(schedule);
        console.log(this._schedules.length,schedule);
        setTimeout(() => console.log(this._schedules),100);
    }

    // remove a schedule.
    removeSchedule(schedule) {
        const index = this.getIndexOfSchedule(schedule);

        if (index > -1) 
            this._schedules.splice(index,1);
    }

    // update all the schedule.
    checkSchedules() {
        this._schedules.forEach(schedule => {
            schedule.update();
        });
    }
}

/*
 * Hold the delta time that will be seen by our entire program.
 *
 * Will only be initialize by once.
 */
class DeltaTime {
    static instance = null;

    constructor() {
        if (DeltaTime.instance == null) {
            DeltaTime.instance = this;
        } else return DeltaTime.instance;

        this._deltatime = 0;
    }

    set(time) {
        this._deltatime = time;
    }

    get() {
        return this._deltatime;
    }
}

class Timeout {
/*
 * Create a 'Timeout', act as a timer that will perform a specific action,
 * for a given period of time or until a specific event happen and can perform,
 * an action after it ends.
 *
 * @param {function} action The action that will be perform repeatedly.
 */
    constructor(action) {
        this.counter = 0; // the current time until the span is reached.

        this.action = action;
        this.isEnd = false; // is this timer ends.
        this.span = 0; // how fast it will be called.
    }

    setSpan(span) {
        this.span = span;
    }

    // re initialize the counters and the boolean that will tell if it ends.
    restart() {
        this.counter = 0;
        this.endCounter = 0;
        this.isEnd = false;
    }

    /*
     * Update the counters, call the action to be performed, check whether the timer ends,
     * then call the callback when it ends, after which removed in the 'schedules' if present it if it ends.
     */
    update() {
        const deltatime = new DeltaTime(); 
        const schedule = new SchedulesHolder();

        if (this.isEnd) return;

        if (this.counter < this.span) this.counter += deltatime.get();
        else {
            this.action();
            this.counter = 0;
        }

        if (this.duration != null) {
            if (this.endCounter < this.duration) this.endCounter += deltatime.get();
            else {
                this.isEnd = true;
            }
        }

        if ((this.ender && this.ender()) || this.isEnd) {

            if (this.callback) 
               this.callback();
            
            schedule.removeSchedule(this);
        } 
    }
}

class TimeoutBuilder {
/*
 * Build the 'Timeout' based on the specifications you wanted it to do.
 */
    constructor(action) {
        this.timeout = new Timeout(action);
    }

    setCallback(callback) {
        this.timeout.callback = callback;
        return this;
    }

    setDuration(duration) {
        this.timeout.endCounter = 0; // same as counter, but until the duration.

        this.timeout.duration = duration;
        return this;
    }

    setEnder(ender) {
        this.timeout.ender = ender;
        return this;
    }
    
    build() {
        return this.timeout;
    }
}

export {DeltaTime,TimeoutBuilder,SchedulesHolder};
