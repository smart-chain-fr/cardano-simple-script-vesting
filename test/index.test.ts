import fc from "fast-check";

describe("Sample Test Suite", () => {
  it("Sample Test", () => {
    fc.assert(fc.property(fc.string(), () => true));
  });
});
