/**
 * This module is responsible for processing and glitching extracted feature data.
 * @packageDocumentation
 */

import File from './File';
import bfj from 'bfj'
import fs from 'fs';
import path from 'path';
import bigJSON from 'big-json';
// import { NodeVM } from "vm2";

/** This class loads, saves and glitches data */
export class Processor {
  /** Path to JSON file containing extracted feature data */
  private JSONPath: string;
  /** Path of the temporary directory */
  private tempDir: string;
  /** Function that will be used to process feature data*/
  private glitchingFunction;

  constructor() {}

  /** Loads the glitching function module from disk
   * @param path Path to script file
   */
  loadGlitchingFunction(path: string) {
    this.glitchingFunction = require(path);
  }

  /** Parses feature data from JSON exported by `ffedit`.
   * These JSON files tend to be quite large therefore we try to use some streaming JSON implementation insted of just require'ing it.
   */
  async loadFeature() {
    return new Promise((res, rej) => {
      const readStream = fs.createReadStream(this.JSONPath);
      const parseStream = bigJSON.createParseStream();
      parseStream.on("data", function (feature) {
        res(feature);
      });
      readStream.pipe(parseStream);
    });
  }

  /** 
   * Basically serializes a huge *Object* and saves it to disk.
   * @todo This is now the most time-consuming step (up to 2 minutes!),
   * rewrite the whole glitching system that walks over JSON files, instead of loading them to memory.
   * @param feature A huge *Object* to be serialized
   */
  async saveFeatureToDisk(feature) {
    await bfj.write(
      path.join(this.tempDir, "modifiedFeature.json"),
      feature
    );
  }

  /**
   * This function loads feature data, executes a provided glitching function and saves it all to disk.
   * @param file A {@link File} to be glitched
   * @param glitchingFunction A function that processes glitch data to be executed in sandbox
   */
  async glitch(file: File) {
    this.JSONPath = file.extractedFeaturePath;
    this.tempDir = file.tempDir;
    const feature: any = await this.loadFeature();
    let g = new Frames(feature.streams[0].frames)
    this.glitchingFunction(g);
    feature.streams[0].frames = g.extractAllFrames();
    await this.saveFeatureToDisk(feature);
  }
}

/**
 * This class is passed to the provided glitching function and manages exported frames.
 * Iteration works a bit like [Scanner in Java](https://docs.oracle.com/javase/8/docs/api/java/util/Scanner.html).
 */
export class Frames {
  /** An array of frames to be processed */
  protected frames;
  public frameCount: number;
  public currentFrameIndex = 0;

  /** @param frames An array of frames */
  constructor(frames) {
    this.frames = frames;
    this.frameCount = frames.length;
  }

  /** Returns next frame and increments {@link currentFrameIndex}*/
  nextFrame() {
    this.currentFrameIndex++;
    return this.frames[this.currentFrameIndex];
  }

  /** Returns previous frame **without** decrementing {@link currentFrameIndex}*/
  prevFrame() {
    return this.frames[this.currentFrameIndex - 1];
  }

  /** Resets {@link currentFrameIndex} back to 0*/
  reset() {
    this.currentFrameIndex = 0;
  }

  /** Returns true if there is a next frame */
  hasNextFrame() {
    return this.currentFrameIndex < this.frames.length - 1;
  }

  /** This **replaces** the frame at {@link currentFrameIndex} with the provided one*/
  saveFrame(frame) {
    this.frames[this.currentFrameIndex] = frame;
  }

  /** Returns all frames */
  extractAllFrames() {
    return this.frames;
  }
}