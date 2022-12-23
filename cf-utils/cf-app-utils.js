const fs = require("fs");
const exec = require("child_process").exec;
const { APP_NOT_DEPLOYED_ERROR } = require("../constants/errors");

function getFileNameIfExists(
  fileNamesWithoutExtension,
  extensions = ["yaml", "yml"]
) {
  if (!Array.isArray(fileNamesWithoutExtension)) {
    fileNamesWithoutExtension = [fileNamesWithoutExtension];
  }

  for (const fileNameWithoutExtension of fileNamesWithoutExtension) {
    for (const extension of extensions) {
      const fileName = fileNameWithoutExtension + "." + extension;
      if (fs.existsSync(fileName)) {
        return fileName;
      }
    }
  }
}

function findMatchingCFAppNames(appName, stdout) {
  if (!appName) return [];

  const cfAppNames = [];
  const stdoutLines = stdout.split("\n");

  for (const stdoutLine of stdoutLines) {
    if (stdoutLine.includes(appName)) {
      // regex to find spaces or tabs
      const regex = /\s+/;

      const cfAppName = stdoutLine.trim().split(regex)[0];
      cfAppNames.push(cfAppName);
    }
  }

  return cfAppNames;
}

async function getAppName() {
  return new Promise((resolve, reject) => {
    exec("cf apps ", function (error, stdout, _) {
      const path = require("path");
      const currentFolder = path.basename(process.cwd());
      var appName;

      const fileName = getFileNameIfExists(["mta", "manifest"]);

      if (fileName) {
        // read yaml file into object
        const yaml = require("js-yaml");
        const fileContent = yaml.load(
          fs.readFileSync(path.join(process.cwd(), fileName), "utf8")
        );

        // mta?
        if (fileContent.ID) appName = fileContent.ID;
        // manifest?
        else if (fileContent.applications)
          appName = fileContent.applications[0].name;
      } else if (error) {
        reject(APP_NOT_DEPLOYED_ERROR);
      } else {
        appName = currentFolder;
      }

      const cfAppNames = findMatchingCFAppNames(appName, stdout);
      if (cfAppNames.length > 0) resolve(cfAppNames[0]);
      else reject(APP_NOT_DEPLOYED_ERROR);
    });
  });
}

module.exports = {
  getAppName,
  findMatchingCFAppNames,
};
