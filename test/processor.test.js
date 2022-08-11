"use strict";

const assert = require("assert");
const processor = require("../lib/processor");

describe("processor", () => {
  it("pre-processes", () => {
    const res = processor.preprocess(`
{{
const ONE = Symbol("one")}}
{
const NUM_T = options.numT ?? 2;
}
foo
  = o:"one" t:$"t"+ &{ return t.length > NUM_T; } !{ return t.length > 2 * NUM_T; } {
    return ONE;
  }
`, "processor.peggy");
    assert.equal(res.length, 2);
  });

  it("post-processes", () => {
    const messages = [[], [{
      ruleId: "semi",
      severity: 2,
      message: "Semicolon required",
      line: 300,
      column: 26,
      endLine: 4,
      endColumn: 1,
    }, {
      ruleId: "no-unused-vars",
      severity: 2,
      message: "'o' is defined but never used.",
      line: 31,
      column: 19,
      nodeType: "Identifier",
      messageId: "unusedVar",
      endLine: 31,
      endColumn: 20,
    }, {
      ruleId: "no-unused-vars",
      severity: 2,
      message: "'t' is defined but never used.",
      line: 31,
      column: 22,
      nodeType: "Identifier",
      messageId: "unusedVar",
      endLine: 31,
      endColumn: 23,
    }, {
      ruleId: "example",
      severity: 2,
      message: "No end in sight",
      line: 31,
      column: 22,
      nodeType: "none",
    }]];

    const mapped = processor.postprocess(messages, "processor.peggy");
    assert.equal(mapped.length, messages[1].length);

    assert.throws(() => processor.postprocess(messages, "NOT_VALID"), /Map not found/);
  });

  it("fixes", () => {
    const res = processor.preprocess(`\
{{
const FOO = "foo";
}}

{
const BASE = options.base || 10
}

bar = first:pos  rest:("," @num)* { return [FOO, first, ...rest]; }

pos = n:num !{ return n > 0; }

num = n:$[0-9]+ { return parseInt(n, BASE); }

`, "fix.peggy");
    assert.equal(res.length, 2);

    const messages = [[], [
      {
        ruleId: "semi",
        severity: 2,
        message: "Missing semicolon.",
        line: 24,
        column: 34,
        nodeType: "VariableDeclaration",
        messageId: "missingSemi",
        endLine: 25,
        endColumn: 1,
        fix: { range: [476, 476], text: ";" },
      },
    ]];

    const mapped = processor.postprocess(messages, "fix.peggy");
    assert.equal(mapped.length, messages[1].length);
  });

  it("has edge cases", () => {
    const res1 = processor.preprocess(`
{
const ONE = "1";
}
foo = '1' { return ONE; }
`, null);
    assert(res1);

    const res2 = processor.preprocess(`
foo = '1' {  }
`, null);
    assert(res2);
  });
});
