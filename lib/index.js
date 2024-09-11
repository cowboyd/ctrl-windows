const { platform, arch } = require("os");
const { join } = require("path");

const archDistDirName = arch() === "arm64" ? "arm64" : "x64";

const native =
  platform() === "win32"
    ? require(`../dist/${archDistDirName}/ctrlc-windows.node`)
    : require("./posix");

module.exports = {
  ctrlc(pid) {
    try {
      // don't even attempt if the
      // process is not running
      if (process.kill(pid, 0)) {
        const processKillerPath = join(__dirname, "..", `dist/${archDistDirName}/process-killer.exe`);
        native.ctrlc(pid, processKillerPath);
      }
    } catch (error) {
      if (error.code !== "ESRCH") {
        throw error;
      }
    }
  },
};
