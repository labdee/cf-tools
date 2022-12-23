#!/usr/bin/env node
const yargs = require("yargs");

const PrepareLocalCommand = require("./cf-tools-prepare-local-command");
const EnvCommand = require("./cf-tools-env-command");

PrepareLocalCommand.set(yargs);
EnvCommand.set(yargs);

yargs
  .strict()
  .option("appName", {
    alias: "a",
    description: "The name of the application",
    type: "string",
  })
  .help()
  .alias("version", "v")
  .alias("help", "h").argv;
