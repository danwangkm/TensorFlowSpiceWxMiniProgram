import * as tfc from '@tensorflow/tfjs-converter';
const NUM_INPUT_SAMPLES = 1024;
const MODEL_SAMPLE_RATE = 16000;
const PT_OFFSET = 25.58
const PT_SLOPE = 63.07
const CONF_THRESHOLD = 0.9;
const MODEL_URL = 'https://tfhub.dev/google/tfjs-model/spice/1/default/1'; // Simple
// const MODEL_URL = 'https://tfhub.dev/google/tfjs-model/spice/2/default/1'; // Advanced

const STORAGE_KEY = 'spice_model';
export class SpiceModel {
  model = tfc.GraphModel;
  constructor() { }

  async load() {
    // const storageHandler = getApp().globalData.fileStorageIO(`${wx.env.USER_DATA_PATH}/mymodel`, wx.getFileSystemManager());
    const storageHandler = getApp().globalData.localStorageIO(STORAGE_KEY);
    try {
      console.log("try to load model from local storage");
      this.model = await tfc.loadGraphModel(storageHandler);
    } catch (e) {
      console.log(`failed loading model from local storage because: ${JSON.stringify(e)}, try to load from TF hub...`);
      this.model = await tfc.loadGraphModel(
        MODEL_URL,
        { fromTFHub: true }
      );
      console.log("finishe loaded model from tfhub");
      try {
        // TODO: if we use local storage, we will get error that the file is 
        // larger than 10MB. If we use file storage, we will get mkdir:fail permission denied error
        await this.model.save(storageHandler)
      } catch (e) {
        console.warn(e);
      }
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