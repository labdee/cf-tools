const { APP_NOT_DEPLOYED_ERROR } = require("../constants/errors");
const fs = require("fs");
const exec = require("child_process").exec;

function getEnvFromOutput(envName, output) {
  var valueSplit = output.split(envName);

  if (valueSplit.length < 2) {
    return { [envName]: null };
  }

  var value = valueSplit[1].trim();

  var openingBraceCount = 0;
  var closingBraceCount = 0;
  for (var i = 0; i < value.length; i++) {
    if (value[i] === "{") {
      if (openingBraceCount === 0) value = value.substring(i);
      openingBraceCount++;
    } else if (value[i] === "}") {
      closingBraceCount++;
    }

    if (
      openingBraceCount > 0 &&
      closingBraceCount > 0 &&
      openingBraceCount === closingBraceCount
    ) {
      value = value.substring(0, i + 1);
      break;
    }
  }

  try {
    return JSON.parse(value);
  } catch (e) {
    return value;
  }
}

async function getEnvs(appName, envNames) {
  if (!Array.isArray(envNames)) {
    envNames = [envNames];
  }

  return new Promise((resolve, reject) => {
    const cmd = "cf env " + appName;

    exec(cmd, function (error, stdout, _) {
      if (error) {
        reject(APP_NOT_DEPLOYED_ERROR);
      }

      var envs = {};
      for (var i = 0; i < envNames.length; i++) {
        var envName = envNames[i];
        var envValue = getEnvFromOutput(envName, stdout);
        envs[envName] = envValue;
      }

      resolve(envs);
      return;
    });
  });
}

async function prepareLocalEnvironment(appName) {
  const envs = await getEnvs(appName, ["VCAP_SERVICES", "VCAP_APPLICATION"]);

  const defaultEnvContent = JSON.stringify(envs);

  if (fs.existsSync("default-env.json")) {
    fs.renameSync("default-env.json", "default-env.json.bak");
    console.log("default-env.json.bak: backup file created");
  }
  fs.writeFileSync("default-env.json", defaultEnvContent);
  console.log("default-env.json: file created/updated");
}

module.exports = {
  getEnvs,
  getEnvFromOutput,
  prepareLocalEnvironment,
};
