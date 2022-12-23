const CFTools = require("../lib/index");

const cmd = {
  command: "prepare-local",
  description: "Prepares the application to run locally",
  builder: {},
  handler: async (yargs) => {
    const appName = yargs.appName ?? (await CFTools.CFAppUtils.getAppName());

    return await CFTools.CFEnvUtils.prepareLocalEnvironment(appName)
      .then((env) => {
        // console.log(env);
      })
      .catch((err) => {
        console.log("\x1b[31m%s\x1b[0m", err);
      });
  },
};

module.exports = {
  set: (yargs) => {
    return yargs.command(
      cmd.command,
      cmd.description,
      cmd.builder,
      cmd.handler
    );
  },
};
