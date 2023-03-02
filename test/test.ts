import { MockExecutionContext } from "@codahq/packs-sdk/dist/development";
import { assert } from "chai";
import { describe, it } from "mocha";
import { executeFormulaFromPackDef } from "@codahq/packs-sdk/dist/development";
import { pack } from "../pack";
import { newJsonFetchResponse } from "@codahq/packs-sdk/dist/development";
import { newMockExecutionContext } from "@codahq/packs-sdk/dist/development";
import sinon from "sinon";

describe("Formula with Fetcher", () => {
  let context: MockExecutionContext;

  beforeEach(() => {
    context = newMockExecutionContext();
  });

  it("basic fetch", async () => {
    const fakeResponse = newJsonFetchResponse({
      status: 200,
      body: {
        id: "p7ndqtybwinaib83cnj6of599e",
        create_at: 1677086935435,
        update_at: 1677086935435,
        delete_at: 0,
        team_id: "qkne79cexidqdc7taf5ompajma",
        type: "O",
        display_name: "Town Square",
        name: "town-square",
        header: "",
        purpose: "",
        last_post_at: 1677232793890,
        total_msg_count: 2,
        extra_update_at: 0,
        creator_id: "",
        scheme_id: null,
        props: null,
        group_constrained: null,
        shared: null,
        total_msg_count_root: 2,
        policy_id: null,
        last_root_post_at: 1677232793890,
      },
      headers: { "Content-Type": "application/json" },
    });
    context.fetcher.fetch.returns(fakeResponse);

    const result = await executeFormulaFromPackDef(
      pack,
      "Channel",
      ["p7ndqtybwinaib83cnj6of599e"],
      context
    );

    assert.equal(result.body.display_name, "Town Square");
    sinon.assert.calledOnce(context.fetcher.fetch);
  });
});
