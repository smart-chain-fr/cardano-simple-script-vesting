import fc from "fast-check";

import "mocha";

describe("Sample Test Suite", () => {
  it("Sample Test", async () => {
    fc.assert(fc.property(fc.string(), (_t) => true));
  });
});
