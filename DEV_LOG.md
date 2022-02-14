目前小程序能够用录音进行频率解析，但是现在很慢，质量也很差。
最主要有两个方面的原因：
1. audio 的输入，目前是不断调用开始录音 然后从录音文件中去切分数据。这样录音开始和文件保存读取所用时间很长，有overhead。应该使用onframerecorded的方法，例如 https://github.com/danwangkm/TensorFlowSpiceWxMiniProgram/blob/tempForSoundRecord/pages/index/index.js 可以试试
2. tf模型的判断执行，这一步在手机端运行极为缓慢。作为实时调用效率很低。其实可以考虑使用别的FFT/Pitch detaction 算法，应该可以实现类似功能。目前找到一些材料可以研究一下:
    1. FFT
        * https://github.com/xiangyuecn/Recorder/blob/master/src/extensions/lib.fft.js
        * https://github.com/vail-systems/node-fft
        * https://github.com/indutny/fft.js/ (ex. https://stackoverflow.com/questions/61547281/how-to-get-frequency-spectrum-from-an-audio-wav-file-using-fft-js-with-node-js)
        * https://github.com/dntj/jsfft
        * https://gist.github.com/corbanbrook/4ef7ce98fe4453d754cd7e4a341d6e5b
    2. Pitch
        * https://github.com/peterkhayes/pitchfinder (more faster? https://www.npmjs.com/package/node-pitchfinder) pitchFinder is a workable solution when we use ADMS. YIN is not working. 但真机检测的时候读入文件太大，还是会卡住，需要用onframe的callback试试
        * https://stackoverflow.com/questions/69237143/how-do-i-get-the-audio-frequency-from-my-mic-using-javascript 这里有一些论文连接
        * https://stackoverflow.com/questions/45397325/js-audio-audiobuffer-getchanneldata-to-frequency (https://github.com/audiocogs/pitch.js/)
        