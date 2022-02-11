import { SpiceModel } from '../../model/spiceModel';
import * as tf from '@tensorflow/tfjs-core';
const fft = require('fft-js').fft;
const fftUtil = require('fft-js').util
const fs = wx.getFileSystemManager()
// index.js
// 获取应用实例
const app = getApp()
const recorderManager = wx.getRecorderManager();
const audioCtx = wx.createWebAudioContext(true);
const sampleSize = 512 * 2;
let source = audioCtx.createBufferSource();
let processor = audioCtx.createScriptProcessor(sampleSize, 1, 1);
processor.channelInterpretation = 'speakers';
processor.channelCount = 1;
Page({
  spiceModel: undefined,
  data: {
    motto: '---',
    isRecording: false,
  },
  onLoad() {
    recorderManager.onStart((event) => {
      console.log('start录音');
    }); 
    let that = this;
    processor.onaudioprocess = function(e) {
      const NUM_INPUT_SAMPLES = sampleSize;
      const CONF_THRESHOLD = 0.9;
      const channelData = e.inputBuffer.getChannelData(0);
      // console.log(`channel data length: ${channelData.length}`);
      var phasors= fft(channelData);
      // console.log(`phasors: ${phasors}`);
      var frequencies = fftUtil.fftFreq(phasors, 16000);
      // var magnitudes = fftUtil.fftMag(phasors); 
      // const result = {
      //   frequencies,
      //   magnitudes
      // };
      // const sum = frequencies.reduce((a, b) => a + b, 0);
      // const avg = sum / frequencies.length;
      console.log(JSON.stringify(frequencies));
      // const data = Math.max(...frequencies);
      // frequencies.forEach((item) => {
      //   that.setData({
      //     motto: item
      //   })
      // });
      that.setData({
            motto: frequencies[frequencies.length / 2]
          })
      // console.log(`frequencies avg: ${data}`)
      

      if (that.spiceModel) {
        console.log('start execute model...');
        const input = tf.reshape(tf.tensor(channelData), [NUM_INPUT_SAMPLES])
        const output = that.spiceModel.getModel().execute({"input_audio_samples": input });
        const uncertainties = output[0].dataSync();
        const pitches = output[1].dataSync();
        // console.log(`uncertainties: ${uncertainties}`);

        for (let i = 0; i < pitches.length; ++i) {
          let confidence = 1.0 - uncertainties[i];
          if (confidence < CONF_THRESHOLD) {
            continue;
          }
          const pitch = that.spiceModel.getPitchHz(pitches[i]);
          console.log(`getPitchHz: ${pitch}`);
          that.setData({
            motto: pitch
          })
        }
      }
    }
    recorderManager.onStop((res) => {
      let mySource = audioCtx.createBufferSource();
      mySource.onended = function() {
        console.log("source end");
        mySource.disconnect(processor);
        processor.disconnect(audioCtx.destination);
      }
      
      this.tempFilePath = res.tempFilePath;
      console.log('停止录音', res.tempFilePath);
      fs.readFile({
        filePath: this.tempFilePath,
        position: 0,
        success(res) {
          
          audioCtx.decodeAudioData(res.data, (buffer) => {
            console.log(`ok: ${buffer.length}`);
            
            mySource.loop = false;
            mySource.buffer = buffer;
            mySource.connect(processor);
            processor.connect(audioCtx.destination);
            mySource.start();
            
          }, (e) => {console.error(e)});
        },
        fail(res) {
          console.error(res)
        }
      });
      if (this.data.isRecording) {
        recorderManager.start({
          duration: 1000,
          sampleRate: 16000,
          numberOfChannels: 1,
          encodeBitRate: 96000,
          format: "mp3"
        });
      }
    });
  },
  async onReady() {
    // if (this.spiceModel == null) {
    //   console.log('loading spice model...');
    //   const model = new SpiceModel(this);
    //   model.load().then(() => {
    //     this.spiceModel = model;
    //     console.log('loaded spice model successfully');
    //     wx.showToast({
    //       title: '模型加载成功',
    //       icon: 'success',
    //       duration: 1500,
    //     });
    //   }).catch((e) => {
    //     console.error(e);
    //     wx.showToast({
    //       title: '模型加载失败',
    //       icon: 'error',
    //       duration: 1500,
    //     });
    //   });
    // }
  },
  onRecordTouchStartHandler(event) {
    console.log(`start record: ${JSON.stringify(event)}`);
    this.setData({
      isRecording: true,
    })
    recorderManager.start({
      duration: 300,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: "mp3"
    });
  },
  onRecordTouchEndHandler(event) {
    this.setData({
      isRecording: false,
    })
    recorderManager.stop();
  },
})
