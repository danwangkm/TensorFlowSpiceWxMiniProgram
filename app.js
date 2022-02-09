const fetchWechat = require('fetch-wechat');
const tf = require('@tensorflow/tfjs-core');
const webgl = require('@tensorflow/tfjs-backend-webgl');
const plugin = requirePlugin('tfjsPlugin');
const ENABLE_DEBUG = true;
// app.js
App({
  async onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })

    plugin.configPlugin(
      {
        fetchFunc: fetchWechat.fetchFunc(),
        tf,
        webgl,
        canvas: wx.createOffscreenCanvas()
      },
      ENABLE_DEBUG);
    const info = wx.getSystemInfoSync();
    console.log(info.platform);
  },
  globalData: {
    userInfo: null,
    fileStorageIO: plugin.fileStorageIO,
    localStorageIO: plugin.localStorageIO
  }
})
