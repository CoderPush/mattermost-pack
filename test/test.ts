import { assert } from "chai";
import { describe } from "mocha";
import { executeFormulaFromPackDef } from "@codahq/packs-sdk/dist/development";
import { it } from "mocha";
import { pack } from "../pack";

describe("Formula integration test", () => {
  it("executes the Channel formula", async () => {
    const result = await executeFormulaFromPackDef(pack, "Channel", [
      "p7ndqtybwinaib83cnj6of599e",
    ]);
    assert.equal(
      result,
      '{"id":"p7ndqtybwinaib83cnj6of599e","create_at":1677086935435,"update_at":1677086935435,"delete_at":0,"team_id":"qkne79cexidqdc7taf5ompajma","type":"O","display_name":"Town Square","name":"town-square","header":"","purpose":"","last_post_at":1677232793890,"total_msg_count":2,"extra_update_at":0,"creator_id":"","scheme_id":null,"props":null,"group_constrained":null,"shared":null,"total_msg_count_root":2,"policy_id":null,"last_root_post_at":1677232793890}'
    );
  });
});
