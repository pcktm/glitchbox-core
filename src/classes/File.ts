import * as jetpack from "fs-jetpack";
import path from 'path';

/** This class holds all the info about the file to be processed */
class File {
  public originalPath: string;
  public tempDir: string;
  /** Path to the converted raw MPEG2 video*/
  public RAWpath: string;
  public filename: string;
  public extractedFeaturePath: string;
  public extractedAudioPath: string;

  constructor(inputPath: string, tempDir: string) {
    this.tempDir = tempDir;
    this.originalPath = path.resolve(process.cwd(), inputPath);
    this.filename = path.basename(this.originalPath);
  }

  setRawPath(path: string) {this.RAWpath = path};

  // async copyToTempDir() {
  //   await jetpack.copyAsync(this.originalPath, path.join(this.tempDir, this.filename));
  //   this.path = path.join(this.tempDir, this.filename);
  // }

  setExtractedAudioPath(path: string) {
    this.extractedAudioPath = path;
  }

  setExtractedFeaturePath(feature: string) {
    this.extractedFeaturePath = feature;
  }
}

export default File;