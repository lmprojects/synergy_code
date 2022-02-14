const {ccclass, property} = cc._decorator;

@ccclass
export default class SoundManager extends cc.Component {

    @property(cc.AudioSource)
    audioSourceBackground:cc.AudioSource = null

    @property(cc.AudioSource)
    audioSourceSFX:cc.AudioSource = null

    @property({type:cc.AudioClip})
    clipClick:cc.AudioClip = null

    @property({type:cc.AudioClip})
    clipOk:cc.AudioClip = null

    @property({type:cc.AudioClip})
    clipNo:cc.AudioClip = null

    @property({type:cc.AudioClip})
    clipNewGame:cc.AudioClip = null

    @property({type:cc.AudioClip})
    clipGameOver:cc.AudioClip = null

    @property({type:cc.AudioClip})
    clipRemember:cc.AudioClip = null

    playEffect(clip:cc.AudioClip){
        this.audioSourceSFX.clip = clip
        this.audioSourceSFX.play()
    }

    playClick(){
        this.playEffect(this.clipClick)
    }

    _mute:boolean = false

    set mute(value:boolean){

        this._mute = value

        if(!this.audioSourceBackground.isPlaying && !this._mute)
            this.audioSourceBackground.play()
        else if(this.audioSourceBackground.isPlaying && !this._mute)
            this.audioSourceBackground.pause()

        this.audioSourceBackground.mute = value
        this.audioSourceSFX.mute = value
    }

    get mute():boolean{
        return this._mute
    }

    playBackground(clip:cc.AudioClip) {}
}
