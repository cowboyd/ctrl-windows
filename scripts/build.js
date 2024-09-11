#!/usr/bin/env node
const { execSync } = require("child_process");
const os = require("os");
const path = require("path");
const mkdirp = require("mkdirp");
const fs = require("fs");

const { arch, release } = require("yargs")
  .usage(
    "$0",
    "build for the given architecture",
    (yargs) => {
      yargs.option("r", {
        alias: "release",
        describe: "make a release build",
        boolean: true,
        require: false,
        default: false,
      });
      yargs.option("a", {
        alias: "arch",
        describe: "target architecture, defaults to host architecture",
        type: "string",
        default: os.arch(),
        require: false,
      });
    },
  )
  .help("help").argv;

if (os.platform() !== "win32") {
  console.log("Skipping native build on non-Windows platform");
  process.exit(0);
}

const targetTriple = arch === "arm64" ?
  "aarch64-pc-windows-msvc" : "x86_64-pc-windows-msvc";

const rootDir = path.resolve(__dirname, "..");
const archDistDir = path.join(rootDir, "dist", arch);

const buildCommand = `yarn napi build --target=${targetTriple}${release ? " --release" : ""}`;
console.log(buildCommand);
execSync(buildCommand, { stdio: "inherit" });

console.log("Moving artifacts to dist directory");
mkdirp.sync(archDistDir);

fs.renameSync(
  path.join(rootDir, "target", targetTriple, release ? "release" : "debug", "process-killer.exe"),
  path.join(archDistDir, "process-killer.exe"),
);

fs.renameSync(
  path.join(rootDir, 'ctrlc-windows.node'),
  path.join(archDistDir, 'ctrlc-windows.node'),
);
