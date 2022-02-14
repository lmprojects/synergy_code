const user = {
    login: "gameuser@focusfactor.com",
    password: "FocusFactor@games",
  };
  
  //TODO: Each game has its own Game ID and CategoryId
  const COLLECTION = "GameScores";
  const GAME_ID = "4";
  const CATEGORY = "category1";
  
  export enum BRAIN_HEALTH_GAME_STATUS {
    Pause,
    Play,
    Quit,
    Preview,
  }
  export interface IBrainHealthSetGame {
    gameScore: number;
    correctAnswers: number;
    totalQuestions: number;
    longestStreak: number;
    difficultBonus: number;
    totalScore: number;
    streakBonus: number;
    timeBonus: number;
    errorMade: number;
    isPlaying?: boolean;
  }
  interface IBrainHealthGame extends IBrainHealthSetGame {
    playGameTapped?: boolean;
  }
  export class BrainHealthNet {
  private static _instance: BrainHealthNet;
  
  private _docId = "game" + GAME_ID;
  
  static get instance(): BrainHealthNet {
    if (BrainHealthNet._instance == null) {
      BrainHealthNet._instance = new BrainHealthNet();
    }
  
    return BrainHealthNet._instance;
  }
  
  get id() {
    return this._docId;
  }
  
  static get() {
    return window["Brainhealth"]?.firebase;
  }
  
  static getdb() {
    return window["Brainhealth"]?.db;
  }
  
  get userId() {
    return window["Brainhealth"]?.userId;
  }
  
  get difficultyLevel() {
    return window["Brainhealth"]?.difficultyLevel;
  }
  
  static async signin(): Promise<any> {
    if (!BrainHealthNet.get()) {
      return;
    }
    return BrainHealthNet.get()
      .auth()
      .signInWithEmailAndPassword(user.login, user.password);
  }
  
  static async changeGameStatus(
    status: BRAIN_HEALTH_GAME_STATUS
  ): Promise<any> {
    try {
      if (!BrainHealthNet.get() || !BrainHealthNet.instance.userId) {
        return;
      }
  
      let data = {};
  
      switch (status) {
        case BRAIN_HEALTH_GAME_STATUS.Play:
          data["status"] = "playing";
          data["isPlaying"] = true;
          break;
        case BRAIN_HEALTH_GAME_STATUS.Pause:
          data["status"] = "paused";
          break;
        case BRAIN_HEALTH_GAME_STATUS.Quit:
          data["status"] = "quit";
          data["isPlaying"] = false;
          break;
        case BRAIN_HEALTH_GAME_STATUS.Preview:
          data["status"] = "preview";
          data["isPlaying"] = false;
          data["playGameTapped"] = false;
          break;
        default:
          return;
      }
  
      return BrainHealthNet._getCollection()
        .doc(BrainHealthNet.instance.id)
        .set(data, { merge: true });
    } catch (err) {
      console.log(err);
    }
  }
    
  static async playTappedToFalse(): Promise<any> {
    try {
      if (!BrainHealthNet.get() || !BrainHealthNet.instance.userId) {
        return;
      }

      let data = {};

      data["playGameTapped"] = false;

      return BrainHealthNet._getCollection()
        .doc(BrainHealthNet.instance.id)
        .set(data, { merge: true });
    } catch (err) {
      console.log(err);
    }
  }

  static async setGame(opts: IBrainHealthSetGame) {
    if (!BrainHealthNet.get() || !BrainHealthNet.instance.userId) {
      return;
    }
    try {
      let data = {
        ...opts,
        id: GAME_ID,
      };
  
      return BrainHealthNet._getCollection()
        .doc(BrainHealthNet.instance.id)
        .set(data, { merge: true });
    } catch (err) {
      console.log(err);
    }
  }
  static async isFirstGame() {
    try {
      if (!BrainHealthNet.get() || !BrainHealthNet.instance.userId) {
        return false;
      }
      const res = await BrainHealthNet._getCollection()
        .doc(BrainHealthNet.instance.id)
        .get();
  
      console.log(!res.exists, res.data());
  
      return (
        !res.exists || !("status" in res.data()) || !("isPlaying" in res.data())
      );
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  static async waitForUser() {
    if (!BrainHealthNet.get() || !BrainHealthNet.instance.userId) {
      return;
    }
  
    try {
      const res = await BrainHealthNet._getCollection()
        .doc(BrainHealthNet.instance.id)
        .get();
      cc.log(" data: ", res.data());
  
      if ((res.data() as IBrainHealthGame).playGameTapped) {
        return;
      }
    } catch (err) {
      console.log(err);
    }
  
    return new Promise((res, rej) => {
      const unsubscribe = BrainHealthNet._getCollection()
        .doc(BrainHealthNet.instance.id)
        .onSnapshot(function (doc) {
          const data: IBrainHealthGame = doc.data();
          cc.log(" data: ", doc, data);
  
          if (data.playGameTapped) {
            res();
            unsubscribe();
          }
        });
    });
  }
  
  private static _getCollection = function () {
    return BrainHealthNet.getdb()
      .collection(COLLECTION)
      .doc(BrainHealthNet.instance.userId)
      .collection(CATEGORY);
  };
  }