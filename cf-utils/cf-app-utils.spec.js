var cfAppUtils = require("./cf-app-utils");
describe("cf-app-utils", function () {
  it("should find matching CF applications", function () {
    const appName = "my-app";
    const stdout = `
    my-app      started  2020-01-01 00:00:00 AM  1/1  1G  1M
    my-app-1    started  2020-01-01 00:00:00 AM  1/1  1G  1M
    my-app-2    started  2020-01-01 00:00:00 AM  1/1  1G  1M`;
    const cfAppNames = cfAppUtils.findMatchingCFAppNames(appName, stdout);
    expect(cfAppNames).toEqual(["my-app", "my-app-1", "my-app-2"]);
  });
});
