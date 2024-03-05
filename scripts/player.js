class PlayerStats {
    static instance = null;

    constructor() {
        if (PlayerStats.instance == null) {
            PlayerStats.instance = this;
        } else return PlayerStats.instance;

        this._attentionSpan = 1; // 100%
        this._confidence = 1;
    }

   setAttentionSpan(span) {
      this._attentionSpan = span;
   }

   setConfidence(confidence) {
      this._confidence = confidence;
   }

   getAttentionSpan() {
        return this._attentionSpan;
   }

   getConfidence() {
        return this._confidence;
   }
}

export default PlayerStats;
