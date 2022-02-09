import { SpiceModel } from '../../model/spiceModel';
// index.js
// 获取应用实例
const app = getApp()
const recorderManager = wx.getRecorderManager();

Page({
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
      const voiceData = new Float32Array(res.frameBuffer);
      console.log(`recorded frameBuffer: ${voiceData}`);
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
    console.log('I am ready');
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
      duration: 60000,
      // sampleRate: 22050,
      numberOfChannels: 1,
      // encodeBitRate: 32000,
      frameSize: 5,
      format: "mp3"
    });
  },
  onEndHandler(event) {
    recorderManager.stop();
  },
})
