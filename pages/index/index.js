import { SpiceModel } from '../../model/spiceModel';
import * as tf from '@tensorflow/tfjs-core';
// index.js
// 获取应用实例
const app = getApp()
const recorderManager = wx.getRecorderManager();

let audioContext = wx.createWebAudioContext();
console.log(`haha ${audioContext.sampleRate}`);
const CONF_THRESHOLD = 0.8;
const sampleSize = 512 * 2;
let source = audioContext.createBufferSource();
let processor = audioContext.createScriptProcessor(sampleSize, 1, 1);
processor.channelInterpretation = 'speakers';
processor.channelCount = 1;

Page({
  spiceModel: undefined,
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }

    recorderManager.onFrameRecorded((res) => {
      console.log(`res: ${JSON.stringify(res)}`);
      if (res.isLastFrame == true) {
        console.log('input onyeah stop');
        source.disconnect(processor);
        processor.disconnect(audioContext.destination);
        source.stop();
        return;
      }
      source = audioContext.createBufferSource();
      var myArrayBuffer = audioContext.createBuffer(1, 16000, 16000);
      let vector = 327.68;
      let input = Float32Array.from(new Uint8Array(res.frameBuffer), num => num / vector);
      // let input = new Float32Array(res.frameBuffer);
      console.log(`inputMax from rm: ${Math.max(...input)}`);
      myArrayBuffer.copyToChannel(input, 0, 0);
      source.buffer = myArrayBuffer;
      source.connect(processor);
      processor.connect(audioContext.destination);
      source.start();
      // console.log(`myArrayBuffer: ${myArrayBuffer}`);
      // audioContext.decodeAudioData(res.frameBuffer, buffer => {
      //   console.log(`get buffer: ${buffer}`);
      //   source.buffer = buffer;
      // }, err => {
      //   console.error('decodeAudioData fail', err);
      // });
      // const NUM_INPUT_SAMPLES = 1024;
      // const CONF_THRESHOLD = 0.1;
      // const voiceData = new Uint8Array(res.frameBuffer);
      // // console.log(`recorded frameBuffer: ${voiceData}`);
      // // const average = (array) => array.reduce((a,b) => a + b) / array.length;
      // // console.log(`recorded frameBuffer: ${average(voiceData)}`);

      // console.log(`recorded frameBuffer: ${voiceData.length}`);
      // const trunckedVoiceData = Float32Array.from(voiceData).slice(0, NUM_INPUT_SAMPLES);
      // console.log(`trunckedVoiceData data: ${trunckedVoiceData.length}`)
      // if (this.spiceModel) {
      //   console.log('start execute model...');
      //   const input = tf.reshape(tf.tensor(trunckedVoiceData), [NUM_INPUT_SAMPLES])
      //   const output = this.spiceModel.getModel().execute({"input_audio_samples": input });
      //   const uncertainties = output[0].dataSync();
      //   const pitches = output[1].dataSync();
      //   // console.log(`uncertainties: ${uncertainties}`);
      //   // console.log(`pitches: ${pitches}`);
      //   for (let i = 0; i < pitches.length; ++i) {
      //     let confidence = 1.0 - uncertainties[i];
      //     if (confidence < CONF_THRESHOLD) {
      //       continue;
      //     }
      //     console.log(`getPitchHz: ${this.spiceModel.getPitchHz(pitches[i])}`);
      //   }
      // }
      
    });
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  async onReady() {
    if (this.spiceModel == null) {
      console.log('loading spice model...');
      const model = new SpiceModel(this);
      model.load().then(() => {
        // this.setData({ result: 'loading spice model...' });
        this.spiceModel = model;
        console.log('loaded spice model successfully');
        // this.setData({ result: 'model loaded.' });
        wx.showToast({
          title: '模型加载成功',
          icon: 'success',
          duration: 1500,
        });
      }).catch((e) => {
        console.error(e);
        wx.showToast({
          title: '模型加载失败',
          icon: 'error',
          duration: 1500,
        });
      });
    }
    let that = this;
    processor.onaudioprocess = function(e) {
      if (!that.spiceModel) {
        return;
      }
      console.log('start execute model...');
      // console.log(`event: ${JSON.stringify(e)}`);
      // console.log(`inputBuffer: ${JSON.stringify(e.inputBuffer)}`);
      const inputData = e.inputBuffer.getChannelData(0);
      console.log(`inputDataMax: ${Math.max(...inputData)}`);
      // console.log(`inputData: ${inputData}`);
      const input = tf.reshape(tf.tensor(inputData), [sampleSize])
      const output = that.spiceModel.getModel().execute({"input_audio_samples": input });
      const uncertainties = output[0].dataSync();
      const pitches = output[1].dataSync();
      // console.log(`result pitches: ${pitches}`);
      console.log(`result uncertainties min: ${Math.min(...uncertainties)}`);

  
      for (let i = 0; i < pitches.length; ++i) {
        let confidence = 1.0 - uncertainties[i];
        if (confidence < CONF_THRESHOLD) {
          continue;
        }
        console.log(`result: ${that.spiceModel.getPitchHz(pitches[i])}`);
      }
    }
  },
  onStartHandler(event) {
    console.log(`click: ${JSON.stringify(event)}`);

    recorderManager.start({
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      frameSize: 1,
      format: "pcm"
    });
    // source.connect(processor);
    // processor.connect(audioContext.destination);
    // source.start()
  },
  onEndHandler(event) {
    
    recorderManager.stop();
    source.disconnect(processor);
    processor.disconnect(audioContext.destination);
    source.stop();
  },
})
