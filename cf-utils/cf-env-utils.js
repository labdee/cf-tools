const { APP_NOT_DEPLOYED_ERROR } = require("../constants/errors");
const fs = require("fs");
const exec = require("child_process").exec;

const NEW_LINE = `
`;

function getEnvFromCfStdout(cfStdout, envName) {
  var valueSplit = cfStdout.split(envName);

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

function getEnvFileContentFromCfStdout(cfStdout) {
  const groupedEnv = getGroupedEnvFromCfStdout(cfStdout);
  const userProvidedValue = groupedEnv["User-Provided"];

  if (!userProvidedValue) return null;

  const userProvidedLines = userProvidedValue.split(NEW_LINE);
  var envFileContent = "";
  for (var i = 0; i < userProvidedLines.length; i++) {
    var line = userProvidedLines[i];
    if (line.includes(":")) {
      var split = line.split(":");
      var envName = split[0].trim();
      var envValue = split.slice(1).join(":").trim();

      // if envValue contains {, is a JSON
      if (envValue.includes("{")) {
        var openingBraceCount = 1;
        var closingBraceCount = 0;
        for (var j = i + 1; j < userProvidedLines.length; j++) {
          var nextLine = userProvidedLines[j];
          for (var k = 0; k < nextLine.length; k++) {
            if (nextLine[k] === "{") {
              openingBraceCount++;
            } else if (nextLine[k] === "}") {
              closingBraceCount++;
            }

            envValue += nextLine[k];
          }

          if (
            openingBraceCount > 0 &&
            closingBraceCount > 0 &&
            openingBraceCount === closingBraceCount
          ) {
            i = j;

            envValue = JSON.stringify(JSON.parse(envValue));

            break;
          }
        }
      }

      envFileContent += envName + "=" + envValue + NEW_LINE;
    }
  }

  return envFileContent.trim();
}

function getGroupedEnvFromCfStdout(cfStdout) {
  var lines = cfStdout.split(`

`);
  var envs = {};
  var envName = null;
  var envValue = null;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    if (line.includes(":")) {
      if (envName) {
        envs[envName] = envValue;
      }

      // split by the first : only
      var split = line.split(":");
      envName = split[0].trim();

      // envValue is the rest of the line after the first :
      envValue = split.slice(1).join(":").trim();
    }
  }

  if (envName) {
    envs[envName] = envValue;
  }

  return envs;
}

async function getCfEnvStdout(appName) {
  return new Promise((resolve, reject) => {
    const cmd = "cf env " + appName;

    exec(cmd, function (error, stdout, _) {
      if (error) {
        reject(APP_NOT_DEPLOYED_ERROR);
      }

      resolve(stdout);
      return;
    });
  });
}

async function getEnvs(cfEnvStdout, envNames) {
  try {
    if (!Array.isArray(envNames)) envNames = [envNames];

    var envs = {};
    for (var i = 0; i < envNames.length; i++) {
      var envName = envNames[i];
      var envValue = getEnvFromCfStdout(cfEnvStdout, envName);
      envs[envName] = envValue;
    }

    return envs;
  } catch (e) {
    throw new Error(APP_NOT_DEPLOYED_ERROR);
  }
}

async function prepareLocalEnvironmentFromCf(appName) {
  const cfEnvStdout = await getCfEnvStdout(appName);

  await generateDefaultEnvFromCf(cfEnvStdout);
  await generateDotEnvFromCf(cfEnvStdout);
}

async function generateDefaultEnvFromCf(cfEnvStdout) {
  const fileName = "default-env.json";
  backupFile(fileName);

  const envs = await getEnvs(cfEnvStdout, [
    "VCAP_SERVICES",
    "VCAP_APPLICATION",
  ]);

  const defaultEnvContent = JSON.stringify(envs);

  fs.writeFileSync(fileName, defaultEnvContent);
  console.log(`${fileName}: file created/updated`);
}

async function generateDotEnvFromCf(cfEnvStdout) {
  const fileName = ".env";
  backupFile(fileName);

  const dotEnvContent = getEnvFileContentFromCfStdout(cfEnvStdout);

  fs.writeFileSync(fileName, dotEnvContent);
  console.log(`${fileName}: file created/updated`);
}

async function backupFile(filePath) {
  if (fs.existsSync(filePath)) {
    if (!fs.existsSync(".cf-tools")) {
      fs.mkdirSync(".cf-tools");
    }

    const backupContent = fs.readFileSync(filePath);
    fs.writeFileSync(`.cf-tools/${filePath}.bak`, backupContent);

    console.log(`Backup of ${filePath}. saved at .cf-tools`);
  }

  addToGitIgnore([".cf-tools", filePath, "*.bak"]);
}

function addToGitIgnore(strs) {
  if (!Array.isArray(strs)) {
    strs = [strs];
  }

  if (!fs.existsSync(".gitignore")) {
    fs.writeFileSync(".gitignore", "");
  }

  var gitIgnoreContent = fs.readFileSync(".gitignore").toString();

  if (gitIgnoreContent.length > 0 && !gitIgnoreContent.endsWith(NEW_LINE))
    gitIgnoreContent += NEW_LINE;

  for (var i = 0; i < strs.length; i++) {
    var str = strs[i];
    if (!gitIgnoreContent.includes(str)) {
      gitIgnoreContent += str + NEW_LINE;

      console.log(`Added "${str}" to .gitignore`);
    }
  }

  fs.writeFileSync(".gitignore", gitIgnoreContent);
}

module.exports = {
  getEnvs,
  getEnvFromCfStdout,
  getEnvFileContentFromCfStdout,
  prepareLocalEnvironmentFromCf,
};
