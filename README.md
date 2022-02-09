# TensorFlowSpiceWxMiniProgram
Wx mini program integrated with TensorFlow SPICE model: https://tfhub.dev/google/tfjs-model/spice/2/default/1

# Note
We would need to run `npm install` first to install all the tf dependencies. Then we need `构建 npm` to build the npm. After it, we need to **DELETE** directory `miniprogram_npm/tr46/` due to https://github.com/tensorflow/tfjs-wechat/issues/110 before we start build/compile.

# References:
* https://tfhub.dev/google/tfjs-model/spice/2/default/1
* https://discuss.tf.wiki/t/topic/926
* https://github.com/tensorflow/tfjs-wechat
* https://cloud.tencent.com/developer/article/1468686
* https://developers.weixin.qq.com/community/develop/article/doc/0004e82a258fe8c33dda9b8c95b013
