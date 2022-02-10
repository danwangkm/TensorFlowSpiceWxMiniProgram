import { SpiceModel } from '../../model/spiceModel';
import * as tf from '@tensorflow/tfjs-core';
// index.js
// 获取应用实例
const app = getApp()
const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();
const audioCtx = wx.createWebAudioContext(true)
const recordList = [];
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
      recordList.push(res.frameBuffer);
      // const CONF_THRESHOLD = 0.5;
      // const voiceData = new Uint8Array(res.frameBuffer);

      // console.log(`recorded frameBuffer: ${voiceData.length}`);
      // let inputLength = 1024;//voiceData.length - voiceData.length % 1024;
      // const trunckedVoiceData = Float32Array.from(voiceData).slice(0, inputLength);
      // console.log(`trunckedVoiceData data: ${trunckedVoiceData.length}`)
      // if (this.spiceModel) {
      //   console.log('start execute model...');
      //   const input = tf.reshape(tf.tensor(trunckedVoiceData), [inputLength]);
      //   console.log(`start my input: ${input}`);
      //   const output = this.spiceModel.getModel().execute({"input_audio_samples": input });
      //   console.log(`start my output: ${output}`);

      //   const uncertainties = output[0].dataSync();
      //   const pitches = output[1].dataSync();
      //   console.log(`uncertainties min: ${Math.min(...uncertainties)}`);
      //   // console.log(`pitches: ${pitches}`);
      //   for (let i = 0; i < pitches.length; ++i) {
      //     let confidence = 1.0 - uncertainties[i];
      //     if (confidence < CONF_THRESHOLD) {
      //       continue;
      //     }
      //     console.log(`getPitchHz: ${this.spiceModel.getPitchHz(pitches[i])}`);
        // }
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
  },
  onStartHandler(event) {
    console.log(`click: ${JSON.stringify(event)}`);

    recorderManager.start({
      duration: 12000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      frameSize: 5,
      format: "mp3"
    });
    recorderManager.onStop((res) => {
      this.tempFilePath = res.tempFilePath;
      console.log('停止录音', res.tempFilePath)
    });
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    });
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    });
    // source.connect(processor);
    // processor.connect(audioContext.destination);
    // source.start()
  },
  onEndHandler(event) {
    recorderManager.stop();
    console.log(`size of buffer: ${recordList.length}`);
    
  },
  onPlayHandler(e) {
    innerAudioContext.autoplay = true;
    innerAudioContext.src = this.tempFilePath;
    
  },
  async onPlayFlamesHandler(e) {
    console.log(`start size of buffer: ${recordList.length}`);
    let source = audioCtx.createBufferSource();
    var myArrayBuffer = audioCtx.createBuffer(1, 0, 16000);
    await recordList.forEach(async (arrayBuffer, index) => {
      console.log(`start play: ${new Uint8Array(arrayBuffer)}`);
      let input = Float32Array.from(new Uint8Array(arrayBuffer));
      // try {
      //   let res = await audioCtx.decodeAudioData(arrayBuffer);
      //   source.buffer = res;
      //   source.connect(audioCtx.destination);
      //   source.start();
      // } catch (error) {
      //   console.error(error);
      // }
      
      audioCtx.decodeAudioData(arrayBuffer, (res) => {
        // this can run in real phone and play a little sound
        console.log(`yes: ${res}`);
        myArrayBuffer = this.appendBuffer(myArrayBuffer, res);
        source.buffer = res;
        source.connect(audioCtx.destination);
        source.start();
      }, (error) => {
        console.error(error);
      });
      // myArrayBuffer.copyToChannel(input, 0, 16000 * index);
    });
    // source.buffer = myArrayBuffer;
    // source.connect(audioCtx.destination);
    // source.start();
  },
  /**
   * Appends two ArrayBuffers into a new one.
   * 
   * @param {ArrayBuffer} buffer1 The first buffer.
   * @param {ArrayBuffer} buffer2 The second buffer.
   */
  appendBuffer: (buffer1, buffer2) => {
    var numberOfChannels = Math.min( buffer1.numberOfChannels, buffer2.numberOfChannels );
    var tmp = context.createBuffer( numberOfChannels, (buffer1.length + buffer2.length), buffer1.sampleRate );
    for (var i=0; i<numberOfChannels; i++) {
      var channel = tmp.getChannelData(i);
      channel.set( buffer1.getChannelData(i), 0);
      channel.set( buffer2.getChannelData(i), buffer1.length);
    }
    return tmp;
  }
})
