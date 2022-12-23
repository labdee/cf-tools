const CFTools = require("../lib/index");

const cmd = {
  command: "env",
  description: "Gets the Environment Variable for the application",
  builder: {
    envName: {
      description: "The name of the environment variable",
      alias: "e",
      type: "string",
      default: "VCAP_SERVICES",
    },
  },
  handler: async (yargs) => {
    const appName = yargs.appName ?? (await CFTools.CFAppUtils.getAppName());

    return CFTools.CFEnvUtils.getEnvs(appName, yargs.envName)
      .then((env) => {
        console.log(JSON.stringify(env));
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
