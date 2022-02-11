import { SpiceModel } from '../../model/spiceModel';
import * as tf from '@tensorflow/tfjs-core';
const fs = wx.getFileSystemManager()
// index.js
// 获取应用实例
const app = getApp()
const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext(true);
const audioCtx = wx.createWebAudioContext(true);
let recordList = [];
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
      console.log(`bytelength: ${res.frameBuffer.byteLength}`);
      
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
    recordList = [];

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
      const duration = res.duration;
      console.log('停止录音', res.tempFilePath);
      fs.readFile({
        filePath: this.tempFilePath,
        // encoding: 'base64',
        position: 0,
        success(res) {
          // console.log(`filedata: ${res.data}`)
          // console.log(`filearray: ${new Uint8Array(res.data)}`);
          // it worked
          let source = audioCtx.createBufferSource();
          audioCtx.decodeAudioData(res.data, (buffer) => {
            console.log(`ok: ${buffer.getChannelData(0)}`);
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start();
          }, (e) => {console.error(e)});
        },
        fail(res) {
          console.error(res)
        }
      })
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
    
    var _appendBuffer = function(buffer1, buffer2) {
      var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
      tmp.set(new Uint8Array(buffer1), 0);
      tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
      return tmp.buffer;
    };
    let prefix;
    let finalAudio;
    for (let index = 0; index<recordList.length; index++) {
      let arrayBuffer = recordList[index];
      let temp = arrayBuffer.slice(0);
      if (index === 0) {
        prefix = arrayBuffer.slice(0, 4);
      } else {
        temp = _appendBuffer(prefix, arrayBuffer);
      }
      
      audioCtx.decodeAudioData(temp, (res) => {
        console.log(`yes ${index}: ${res.getChannelData(0)}`);
        if (!finalAudio) {
          finalAudio = res;
        } else {
          let tmp = audioCtx.createBuffer(1, (finalAudio.length + res.length), finalAudio.sampleRate );
          let channel = tmp.getChannelData(0);
          channel.set( finalAudio.getChannelData(0), 0);
          channel.set( res.getChannelData(0), finalAudio.length);
          finalAudio = tmp;
        }
        if (index === recordList.length - 1) {
          console.log('final index');
          source.buffer = finalAudio;
          source.connect(audioCtx.destination);
          source.start();
        }
      }, (error) => {
        console.error(error);
      });
    }
  },
  
})
