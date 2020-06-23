/**
 * Executes a given command
 * @packageDocumentation
 */

import { exec } from "child_process";

/**
 * This function concatenates the given string array and executes a result
 * @param command a string array to concatenate and execute
 * @param setting standard child_process settings object
 */
export default function(command: string[], settings) {
  const commandConcat = command.join(" ");

  return new Promise<string>((res, rej) => {
    let timeout = null;
    const process = exec(commandConcat, settings, function(
      error,
      stdout,
      stderr
    ) {
      if (error) rej(stderr);
      if (timeout !== null) clearTimeout(timeout);
      res(stdout.toString());
    });
    if (settings.timeout > 0) {
      timeout = setTimeout(function() {
        process.kill();
        rej("Process timed out");
      }, 100);
    }
  });
};
