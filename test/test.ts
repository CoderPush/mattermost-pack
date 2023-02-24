import { assert } from "chai";
import { describe } from "mocha";
import { executeFormulaFromPackDef } from "@codahq/packs-sdk/dist/development";
import { it } from "mocha";
import { pack } from "../pack";

describe("Formula integration test", () => {
  it("executes the formula", async () => {
    const result = await executeFormulaFromPackDef(
      pack,
      "MyFormula",
      ["my-param"],
      undefined,
      undefined,
      {
        useRealFetcher: true,
        manifestPath: require.resolve("../pack"),
      }
    );
    assert.equal(result, "my-return-value");
  });
});
