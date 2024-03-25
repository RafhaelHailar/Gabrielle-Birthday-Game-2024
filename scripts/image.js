// get an image by an id.
function get(id) {
    return document.getElementById(id);
}

// a class the hold all of the images
class ImageHolder {
    static MENU = get("game-menu-bg");
    static HAND_CURSOR = get("hand-cursor-image");
    static STORY = get("story-bg");
    static PAUSE = get("pause-bg");
    static MODAL = get("modal-bg");
    static RESULT = get("result-bg");
    static SOUND_ON = get("sound-on-image");
    static SOUND_OFF = get("sound-off-image");
    static GAME_1 = get("game-1-bg");
    static CAR_TOY_GAME_1 = get("car-toy-image-game-1");
    static TEDDY_BEAR_GAME_1 = get("teddy-bear-image-game-1");
    static CELLPHONE_GAME_1 = get("cellphone-image-game-1");
    static GAME_2 = get("game-2-bg");
    static PLAYER_NORMAL_GAME_2 = get("player-normal-image-game-2");
    static PLAYER_DAMAGE_GAME_2 = get("player-damage-image-game-2");
    static PLAYER_HOUSE_GAME_2 = get("player-house-image-game-2");
    static CAT_ANNOYED_GAME_2 = get("cat-annoyed-cute-rectangle-image-game-2");
    static CAT_SERIOUS_GAME_2 = get("cat-serious-cute-rectangle-image-game-2");
    static CAT_SMILE_GAME_2 = get("cat-smile-cute-rectangle-image-game-2");
    static CAT_STILL_GAME_2 = get("cat-still-cute-rectangle-image-game-2");
    static GAME_3 = get("game-3-bg");
    static PENCIL_CURSOR_GAME_3 = get("pencil-cursor-image-game-3");
    static DISTRACTION_GAME_3 = get("distracting-image-game-3");
    static TO_DRAW_GAME_3 = get("to-draw-image-game-3");
}

export default ImageHolder;
