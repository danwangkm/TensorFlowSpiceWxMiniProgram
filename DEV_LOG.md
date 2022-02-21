目前小程序能够用录音进行频率解析，但是现在很慢，质量也很差。
最主要有两个方面的原因：
1. audio 的输入，目前是不断调用开始录音 然后从录音文件中去切分数据。这样录音开始和文件保存读取所用时间很长，有overhead。应该使用onframerecorded的方法，例如 https://github.com/danwangkm/TensorFlowSpiceWxMiniProgram/blob/tempForSoundRecord/pages/index/index.js 可以试试
2. tf模型的判断执行，这一步在手机端运行极为缓慢。作为实时调用效率很低。其实可以考虑使用别的FFT/Pitch detaction 算法，应该可以实现类似功能。目前找到一些材料可以研究一下:
    1. FFT
        * https://github.com/xiangyuecn/Recorder/blob/master/src/extensions/lib.fft.js
        * https://github.com/vail-systems/node-fft
        * https://github.com/indutny/fft.js/ (ex. https://stackoverflow.com/questions/61547281/how-to-get-frequency-spectrum-from-an-audio-wav-file-using-fft-js-with-node-js and https://cjting.me/2021/08/07/fourier-transform-and-audio-visualization)
        * https://github.com/dntj/jsfft
        * https://gist.github.com/corbanbrook/4ef7ce98fe4453d754cd7e4a341d6e5b
    2. Pitch
        * https://github.com/peterkhayes/pitchfinder (more faster? https://www.npmjs.com/package/node-pitchfinder) pitchFinder is a workable solution when we use ADMS. YIN is not working. 但真机检测的时候读入文件太大，还是会卡住，需要用onframe的callback试试
        * https://stackoverflow.com/questions/69237143/how-do-i-get-the-audio-frequency-from-my-mic-using-javascript 这里有一些论文连接
        * https://stackoverflow.com/questions/45397325/js-audio-audiobuffer-getchanneldata-to-frequency (https://github.com/audiocogs/pitch.js/)

current working on
* 替换onframe callback, create new page 

Next Step
* 研究一下pitch.js的使用
* 将pitch.js里面的fft替换成node-fft试试
* 研究一下p5里面的fft好不好用以及原理 (p5 实际使用了[Web API 的 AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) 来[获取fft频域数据](https://github.com/processing/p5.js/blob/v1.4.1/lib/addons/p5.sound.js#L3641)，即fft的实现依赖于webapi而不是p5 package。不过可以在研究一下p5基于频域数据的处理，例如getCentroid()，getEnergy())
    * p5 文件近6MB （https://www.npmjs.com/package/p5）不适合小程序，不过其频域数据的处理思路和理论可以参考。开源模式为LGPL-2.1。
* remove tf dependency to reduce size of program

学习
* FFT的代码实现以及意义
* 从FFT里面如何获得Pitch detact
  * 一种简单的频域音高检测算法就是HPS(harmonic product spectrum)
    * http://catx.me/2014/08/26/html5-sound-visualization-experiment-with-processingjs/
    * https://cnx.org/contents/aY7_vV4-@5.8:i5AAkZCP@2/Pitch-Detection-Algorithms
* 音乐理论学习
    * https://www.lightnote.co/music-theory/harmony
* 音频预处理
    * https://www.jianshu.com/p/5031635a4fbd