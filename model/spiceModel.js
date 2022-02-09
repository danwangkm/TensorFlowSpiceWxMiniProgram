import * as tfc from '@tensorflow/tfjs-converter';
const NUM_INPUT_SAMPLES = 1024;
const MODEL_SAMPLE_RATE = 16000;
const PT_OFFSET = 25.58
const PT_SLOPE = 63.07
const CONF_THRESHOLD = 0.9;
const MODEL_URL = 'https://tfhub.dev/google/tfjs-model/spice/2/default/1';

const STORAGE_PATH = 'spice_model';
export class SpiceModel {
  model = tfc.GraphModel;
  constructor() { }

  async load() {
    console.log(`path: ${STORAGE_PATH}`);
    const storageHandler = getApp().globalData.fileStorageIO(STORAGE_PATH, wx.getFileSystemManager());
    try {
      console.log("try to load model from local storage");
      this.model = await tfc.loadGraphModel(storageHandler);
    } catch (e) {
      console.log(`failed loading model from local storage because: ${e}, try to load from TF hub...`);
      this.model = await tfc.loadGraphModel(
        MODEL_URL,
        { fromTFHub: true }
      );
      console.log("finishe loaded model from tfhub");
      // TODO: if we use local storage, we will get error that the file is larger than 10MB
      // if we use file storage, we will get mkdir:fail permission denied error
      // this.model.save(storageHandler);
    }
    console.log("finish loading model");
  }

  getPitchHz(modelPitch) {
    const fmin = 10.0;
    const bins_per_octave = 12.0;
    const cqt_bin = modelPitch * PT_SLOPE + PT_OFFSET;
    return fmin * Math.pow(2.0, (1.0 * cqt_bin / bins_per_octave))
  }
}