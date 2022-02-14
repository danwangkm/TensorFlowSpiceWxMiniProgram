import { SpiceModel } from '../../model/spiceModel';
import * as tf from '@tensorflow/tfjs-core';
const fs = wx.getFileSystemManager();
const Pitchfinder = require("pitchfinder");

// index.js
// 获取应用实例
const app = getApp()
const recorderManager = wx.getRecorderManager();
const audioCtx = wx.createWebAudioContext();

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
    const detectPitch = Pitchfinder.AMDF();
    // const detectors = [detectPitch, Pitchfinder.AMDF()];
    recorderManager.onStop((res) => {
      this.tempFilePath = res.tempFilePath;
      console.log('停止录音', res.tempFilePath);
      fs.readFile({
        filePath: this.tempFilePath,
        position: 0,
        success(res) {
          audioCtx.decodeAudioData(res.data, (buffer) => {
            // console.log(`ok: ${buffer.length}`);
            const NUM_INPUT_SAMPLES = 512 * 2;
            const CONF_THRESHOLD = 0.9;
            const channelData = buffer.getChannelData(0);
            console.log(`channel data length: ${channelData.length}`);
            const pitch = detectPitch(channelData);
            console.log(`pitch: ${pitch}`);
            that.setData({
              motto: pitch
            });
            // could not detact using following method, maybe config wrong?
            // const moreAccurateFrequencies = Pitchfinder.frequencies(
            //   detectors,
            //   channelData,
            //   {
            //     tempo: 120, // in BPM, defaults to 120
            //     quantization: 4, // samples per beat, defaults to 4 (i.e. 16th notes)
            //   }
            // );
            // console.log(`more accurate pitch: ${moreAccurateFrequencies}`);

            // if (that.spiceModel) {

            //   for (let i=0; i < Math.floor(channelData.length / NUM_INPUT_SAMPLES); i++) {
            //     const start = i * NUM_INPUT_SAMPLES;
            //     console.log(`start execute model for [${start} to ${start + NUM_INPUT_SAMPLES}] blocke...`);
            //     const input = tf.reshape(tf.tensor(channelData.slice(start, start + NUM_INPUT_SAMPLES)), [NUM_INPUT_SAMPLES])
            //     const output = that.spiceModel.getModel().execute({"input_audio_samples": input });
            //     const uncertainties = output[0].dataSync();
            //     const pitches = output[1].dataSync();
            //     // console.log(`uncertainties: ${uncertainties}`);

            //     for (let i = 0; i < pitches.length; ++i) {
            //       let confidence = 1.0 - uncertainties[i];
            //       if (confidence < CONF_THRESHOLD) {
            //         continue;
            //       }
            //       const pitch = that.spiceModel.getPitchHz(pitches[i]);
            //       console.log(`getPitchHz: ${pitch}`);
            //       that.setData({
            //         motto: pitch
            //       })
            //     }
            //   }
              
            // }
            
            
          }, (e) => {console.error(e)});
        },
        fail(res) {
          console.error(res)
        }
      });
      if (this.data.isRecording) {
        recorderManager.start({
          duration: 32,
          sampleRate: 44100,
          numberOfChannels: 1,
          encodeBitRate: 96000,
          format: "mp3"
        });
      }
    });
  },
  async onReady() {
    if (this.spiceModel == null) {
      console.log('loading spice model...');
      const model = new SpiceModel(this);
      model.load().then(() => {
        this.spiceModel = model;
        console.log('loaded spice model successfully');
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
  onRecordTouchStartHandler(event) {
    // console.log(`start record: ${JSON.stringify(event)}`);
    this.setData({
      isRecording: true,
    })
    recorderManager.start({
      duration: 32,
      sampleRate: 44100,
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
