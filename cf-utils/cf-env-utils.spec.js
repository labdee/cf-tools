var cfEnvUtils = require("./cf-env-utils");

const stdoutExample = `System-Provided:
VCAP_SERVICES: {
  "connectivity": [1]
}


User-Provided:
DEPLOY_ATTRIBUTES: {
  "app-content-digest" : "xxxx"
}
PROXY_PWD: xxx
PROXY_USR: yyy

Running Environment Variable Groups:
LOG4J_FORMAT_MSG_NO_LOOKUPS: true

Staging Environment Variable Groups:
LOG4J_FORMAT_MSG_NO_LOOKUPS: true`;

describe("cf-env-utils", function () {
  it("should extract VCAP_SERVICES from the output of cf env", function () {
    var vcap_services = cfEnvUtils.getEnvFromCfStdout(
      stdoutExample,
      "VCAP_SERVICES"
    );

    const connectivity = vcap_services.connectivity;
    expect(connectivity.length).toEqual(1);
  });

  it("should extract the user provided variables", function () {
    const userProvidedRaw =
      cfEnvUtils.getEnvFileContentFromCfStdout(stdoutExample);

    const userProvidedLines = userProvidedRaw.split(`
`).length;

    expect(userProvidedLines).toEqual(3);
  });
});
