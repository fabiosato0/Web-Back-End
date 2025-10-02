import fs from "fs";

class Logger {
  static log(error) {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] - ${error}\n`;
    fs.appendFileSync("log.txt", message);
  }
}

export default Logger;
