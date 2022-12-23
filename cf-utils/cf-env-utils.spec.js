var cfEnvUtils = require("./cf-env-utils");

describe("cf-env-utils", function () {
  it("should extract VCAP_SERVICES from the output of cf env", function () {
    var output =
      'System-provided:\nVCAP_SERVICES: {"user-provided":[{"name":"my-service","label":"user-provided","tags":[],"credentials":{"url":"http://my-service.com"}}]}\nVCAP_APPLICATION: {}';
    var vcap_services = cfEnvUtils.getEnvFromOutput("VCAP_SERVICES", output);
    expect(vcap_services).toEqual(
      '{"user-provided":[{"name":"my-service","label":"user-provided","tags":[],"credentials":{"url":"http://my-service.com"}}]}'
    );
  });
});
