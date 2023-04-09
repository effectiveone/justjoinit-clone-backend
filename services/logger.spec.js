const winston = require("winston");
const logger = require("./logger");

describe("Logger Component", () => {
  test("Logger should be created", () => {
    expect(logger).toBeDefined();
  });

  test("Logger should have 'info' level", () => {
    expect(logger.level).toEqual("info");
  });

  test("Logger should have JSON format", () => {
    expect(typeof logger.format.transform).toBe("function");
  });

  test("Logger should have Console transport", () => {
    const consoleTransport = logger.transports.find(
      (transport) => transport instanceof winston.transports.Console
    );
    expect(consoleTransport).toBeDefined();
  });

  test("Logger should have File transport with proper options", () => {
    const fileTransport = logger.transports.find(
      (transport) => transport instanceof winston.transports.File
    );
    expect(fileTransport).toBeDefined();
    expect(fileTransport.filename).toEqual("error.log");
    expect(fileTransport.level).toEqual("error");
  });
});
