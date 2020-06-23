/**
 * This module contains only {@link Converter}, a class to do operations on files
 * @packageDocumentation
 */

import File from "./File";
import path from 'path';
import exec from '../utils/exec';

/** Class that contains common functions to perform operations on files.
 * All of them are acomplished by executing either FFmpeg or FFedit. 
 */
class Converter {
  private ffmpegPath: string;
  private ffeditPath: string;

  constructor(ffmpegPath: string, ffeditPath: string) {
    this.ffmpegPath = ffmpegPath;
    this.ffeditPath = ffeditPath;
  }

  /** Extracts a given feature from {@link File} */
  async extractFeature(file: File) {
    await exec([this.ffeditPath, "mpeg2_temp.raw -f mv -e feature.json"], {
      timeout: 0,
      cwd: file.tempDir,
    });
    file.setExtractedFeaturePath(path.join(file.tempDir, "feature.json"));
  }

  /** Extracts audio from {@link File} */
  async extractAudio(file: File) {
    await exec(
      [
        this.ffmpegPath,
        "-i",
        file.originalPath,
        "-vn -acodec copy extractedAudio.aac",
      ],
      {
        timeout: 0,
        cwd: file.tempDir,
      }
    );
    file.setExtractedAudioPath(path.join(file.tempDir, "extractedAudio.aac"));
  }

  /** Converts {@link File} to raw MPEG2 video */
  async toRawMPEG(file: File) {
    await exec(
      [
        this.ffmpegPath,
        "-i",
        file.originalPath,
        "-an -mpv_flags +nopimb+forcemv -b:v 10M -g 600 -vcodec mpeg2video -f rawvideo -y mpeg2_temp.raw",
      ],
      { timeout: 0, cwd: file.tempDir }
    );
    file.setRawPath(path.join(file.tempDir, "mpeg2_temp.raw"));
  }

  /** Applies glitched data to original file and generates a new one */
  async bakeFeature(file: File) {
    await exec(
      [
        this.ffeditPath,
        "mpeg2_temp.raw -f mv -a modifiedFeature.json mpeg2_modified.raw",
      ],
      { timeout: 0, cwd: file.tempDir }
    );
  }

  /**
   * Converts the modified raw MPEG2 video to the requested format and, if `withAudio` is true, reapplies audio
   * @param outputPath Path where FFmpeg should output the final file
   * @param withAudio If true glitbox will reapply extracted audio
   */
  async makePlayable(file: File, outputPath: string, withAudio: boolean) {
    const options = withAudio
      ? `-i mpeg2_modified.raw -i "${file.extractedAudioPath}" -c copy -map 0:v:0 -map 1:a:0 -y`
      : "-i mpeg2_modified.raw -codec copy -y";
    await exec([this.ffmpegPath, options, outputPath], {
      timeout: 0,
      cwd: file.tempDir,
    });
  }
}

export default Converter;