const fs = wx.getFileSystemManager();
const Pitchfinder = require("pitchfinder");

// index.js
// 获取应用实例
const app = getApp()
const recorderManager = wx.getRecorderManager();
const audioCtx = wx.createWebAudioContext();

Page({
  data: {
    motto: '---',
    isRecording: false,
  },
  onLoad() {
    recorderManager.onStart((event) => {
      console.log('start录音');
    }); 
    const detectPitch = Pitchfinder.AMDF();
    // const detectors = [detectPitch, Pitchfinder.AMDF()];
    recorderManager.onStop((res) => {
      this.tempFilePath = res.tempFilePath;
      console.log('停止录音', res.tempFilePath);
    });
    let prefix;
    let finalAudio;
    recorderManager.onFrameRecorded((res) => {
      // recordList.push(res.frameBuffer);
      console.log(`bytelength: ${res.frameBuffer.byteLength}`);
      let arrayBuffer = res.frameBuffer;
      let temp = arrayBuffer.slice(0);
      if (prefix === undefined) {
        prefix = arrayBuffer.slice(0, 4);
      } else {
        temp = this.appendBuffer(prefix, arrayBuffer);
      }
      audioCtx.decodeAudioData(temp, (res) => {
        console.log(`yes: ${res.getChannelData(0)}`);
        // if (!finalAudio) {
        //   finalAudio = res;
        // } else {
        //   let tmp = audioCtx.createBuffer(1, (finalAudio.length + res.length), finalAudio.sampleRate );
        //   let channel = tmp.getChannelData(0);
        //   channel.set( finalAudio.getChannelData(0), 0);
        //   channel.set( res.getChannelData(0), finalAudio.length);
        //   finalAudio = tmp;
        // }
        // if (index === recordList.length - 1) {
        //   console.log('final index');
        //   source.buffer = finalAudio;
        //   source.connect(audioCtx.destination);
        //   source.start();
        // }
      }, (error) => {
        console.error(error);
      });
    });
  },
  appendBuffer(buffer1, buffer2) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
  },
  onPlayFlamesHandler(e) {
    console.log(`start size of buffer: ${recordList.length}`);
    let source = audioCtx.createBufferSource();
    
    
    
    for (let index = 0; index<recordList.length; index++) {
      
    }
  },
  onStartTapHandler(event) {
    console.log(`start record: ${JSON.stringify(event)}`);
    this.setData({
      isRecording: true,
    })
    recorderManager.start({
      duration: 6000,
      sampleRate: 44100,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      frameSize: 2,
      format: "mp3"
    });
  },
  onEndTapHandler(event) {
    this.setData({
      isRecording: false,
    })
    recorderManager.stop();
  },
})
