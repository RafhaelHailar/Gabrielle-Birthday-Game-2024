import Component from "./ui/Component.js";


// sounds for each frame.
const FRAME_SOUNDS = {
    menu: "./sounds/menu.mp3",
    story: "./sounds/story.mp3",
    attention: "./sounds/attention.mp3",
    confidence: "./sounds/confidence.mp3",
    passion: "./sounds/passion.mp3",
    result: "./sounds/result.mp3",
    message: "./sounds/message.mp3"
};

class SoundHandler {
/*
 * It will handle all the sound in the game.
 *
 * @param {CanvasElement} canvas The canvas where this will be put on.
 *
 */
   static instance = null;

   constructor(canvas) {
      if (SoundHandler.instance == null) SoundHandler.instance = this;
      else return SoundHandler.instance;

      // the sound element, use for playing the sound.
      this.sound = new Audio();

      this.sound.src = "./sounds/menu.mp3";
      this.sound.loop = true;
      this.sound.volume = 0.3;

      // icon size.
      const SIZE = canvas.width * 0.03;

      // image icon
      this.images = {
         on: "./images/sound-on.png",
         off: "./images/sound-off.png"
      };

      this.imageSrc = this.images.on;

      this.isOn = true; // tells whether the sound is on or off.

      // the icon that will allow the off and on of the sound.
      this.icon = new Component(canvas.width * 0.5 - SIZE / 2,canvas.height * 0.01,SIZE,SIZE);
      this.icon.setImage(this.imageSrc);

      this.isPlayable = true;

      this.addHandler();

   }

    /*
     * Let the sound handler what are the index of frames to add the sound on them.
     *
     * @param {object} frames An object that tells what each frame is.
     */
   setFrames(frames) {
      const result = [];
      for (let frame in frames) {
         const indexes = frames[frame];
         for (let i = 0;i < indexes.length;i++) {
             const index = indexes[i];
             result[index] = FRAME_SOUNDS[frame];
         }
      }

      this.frames = result;
   }

   /*
    * Replace the sound depend on what current frame it is.
    *
    * @param {number} currentFrame The current frame being displayed.
    */
   playFrame(currentFrame) {
      const currentSound = this.sound.src.split("/sounds/")[1]; // get the current played sound name.
      const nextSound = this.frames[currentFrame] && this.frames[currentFrame].split("sounds/")[1]; // the next sound name.
      
      // play the next sound if they are not the same.
      // and if the sound source is valid.
      if (currentSound == nextSound || nextSound == null || nextSound == undefined) return;
      this.sound.src = this.frames[currentFrame];

      if (this.isOn)
          this.sound.play();
   }

   /*
    * Set how fast the sound is playing.
    *
    * @param {number} speed The speed of the sound from 0 to 1.
    */
   setSpeed(speed) {
     this.sound.playbackRate = speed;
   }

   /*
    * Set the volume of the sound playing.
    *
    * @param {number} volume A number between 0 and 1 that tells the volume of the sound.
    */
   setVolume(volume) {
       this.sound.volume = volume;
   }

   /*
    * Set whether the sound is playable when the sound icon is click.
    *
    * @param {boolean} isPlayable Tells whether we the sound is playable or not.
    */
   setIsPlayable(isPlayable) {
        this.isPlayable = isPlayable;
   }

   // add the handler of the sound icon.
   addHandler() {
     this.icon.attachClick(() => {
        this.setFrameIsPlayState(!this.isOn);
      });
   }

   // draw the icon
   draw() {
      this.icon.drawImage(); 
   }

   /*
    * Play a sound.
    *
    * @param {string} sound The source of the audio that will be played.
    * @param {object} The attributes of the sound.
    *      .volume - the volume of the sound.
    */
   play(sound,{
       volume = 1
   } = {}) {
      const audio = new Audio();
      audio.src = sound;
      audio.volume = volume;
      
      if (this.isOn)
          audio.play();
   }

   // first play of the sound.
   init() {
      if (this.isOn) this.sound.play();
      this.isStart = true;
   }

   /*
    * Change the state of the current frame sound either pause or playing.
    *
    * @param {boolean} isPlay Is the state of the current frame sound playing or not.
    */
   setFrameIsPlayState(isPlay) {
      this.isOn = isPlay;

      if (isPlay) {
        if (this.isPlayable)
            this.sound.play();
      } else this.sound.pause();

      this.icon.setImage(this.images[this.isOn?"on":"off"]);
   }
}

export default SoundHandler;
