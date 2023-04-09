const cleanData = require("./cleanData");

describe("cleanData", () => {
  it("should return an empty object if data is not provided", () => {
    const cleanedData = cleanData();
    expect(cleanedData).toEqual({});
  });

  it("should return an object with cleaned string data", () => {
    const dirtyData = {
      name: "<script>alert('hello')</script>",
      email: "test@example.com",
      message: "<p>Test message</p>",
    };
    const cleanedData = cleanData(dirtyData);
    expect(cleanedData).toEqual({
      name: "&lt;script&gt;alert(&#x27;hello&#x27;)&lt;&#x2F;script&gt;",
      email: "test@example.com",
      message: "&lt;p&gt;Test message&lt;&#x2F;p&gt;",
    });
  });

  it("should return an object with cleaned integer and boolean data", () => {
    const dirtyData = {
      age: "<script>alert('hello')</script>",
      isActive: "<script>alert('world')</script>",
    };
    const cleanedData = cleanData(dirtyData);
    expect(cleanedData).toEqual({
      age: "&lt;script&gt;alert(&#x27;hello&#x27;)&lt;&#x2F;script&gt;",
      isActive: "&lt;script&gt;alert(&#x27;world&#x27;)&lt;&#x2F;script&gt;",
    });
  });

  it("should not mutate the original data", () => {
    const dirtyData = {
      name: "<script>alert('hello')</script>",
      email: "test@example.com",
    };
    cleanData(dirtyData);
    expect(dirtyData).toEqual({
      name: "<script>alert('hello')</script>",
      email: "test@example.com",
    });
  });

  it("should not clean non-string data", () => {
    const dirtyData = {
      age: 23,
      isEmployed: true,
    };
    const cleanedData = cleanData(dirtyData);
    expect(cleanedData).toEqual({
      age: 23,
      isEmployed: true,
    });
  });
});
