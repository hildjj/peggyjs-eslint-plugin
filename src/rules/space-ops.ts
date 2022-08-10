import { makeListener, n } from "../utils";
import type { Rule } from "eslint";
import type { visitor } from "@peggyjs/eslint-parser";

function check(
  context: Rule.RuleContext,
  before: visitor.AST.Node,
  after: visitor.AST.Node,
  spaces = 0
): void {
  const beforeEnd = before.loc.end;
  const afterStart = after.loc.start;
  let messageId: string | undefined = undefined;
  let data: { [key: string]: string } | undefined = undefined;

  if (spaces < 0) {
    if ((afterStart.line > beforeEnd.line)
        || (afterStart.column >= beforeEnd.column + 1)) {
      return;
    }
    messageId = "atLeast";
    data = {
      num: String(-spaces),
      s: spaces < -1 ? "s" : "",
    };
  } else {
    if ((afterStart.line === beforeEnd.line)
        && (afterStart.column === beforeEnd.column + spaces)) {
      return;
    }
    messageId = "noSpaces";
  }
  if (spaces > 0) {
    const src = context.getSourceCode();
    if (src.commentsExistBetween(n(before), n(after))) {
      return;
    }
    messageId = "exactSpace";
    data = {
      num: String(spaces),
      s: spaces > 1 ? "s" : "",
    };
  }
  context.report({
    loc: {
      start: beforeEnd,
      end: afterStart,
    },
    messageId,
    data,
    fix(fixer: Rule.RuleFixer): Rule.Fix {
      return fixer.replaceTextRange([
        before.range[1],
        after.range[0],
      ], "".padEnd(Math.abs(spaces)));
    },
  });
}

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce consistent spacing around operators",
      recommended: true,
      url: "https://github.com/peggyjs/peggyjs-eslint-plugin/blob/main/docs/rules/space-ops.md",
    },
    messages: {
      noSpaces: "No space allowed here",
      exactSpace: "Exactly {{num}} space{{s}} required here",
      atLeast: "At least {{num}} space{{s}} required here",
    },
    fixable: "whitespace",
    schema: [{
      type: "object",
      properties: {
        afterAmp: { type: "number" },
        afterAt: { type: "number" },
        afterBang: { type: "number" },
        afterColon: { type: "number" },
        afterDollar: { type: "number" },
        afterEquals: { type: "number" },
        afterOpenParen: { type: "number" },
        afterSlash: { type: "number" },
        beforeCloseParen: { type: "number" },
        beforeColon: { type: "number" },
        beforePlus: { type: "number" },
        beforeQuestion: { type: "number" },
        beforeSlash: { type: "number" },
        beforeStar: { type: "number" },
      },
      additionalProperties: false,
    }],
  },
  create(context: Rule.RuleContext): Rule.RuleListener {
    const opts = {
      afterAmp: 0,
      afterAt: 0,
      afterBang: 0,
      afterColon: 0,
      afterDollar: 0,
      afterEquals: 1,
      afterOpenParen: -1,
      afterSlash: 1,
      beforeCloseParen: -1,
      beforeColon: 0,
      beforePlus: 0,
      beforeQuestion: 0,
      beforeSlash: -1,
      beforeStar: 0,
      ...context.options[0] as { [id: string]: number },
    };

    return makeListener({
      rule(node: visitor.AST.Rule): void {
        const expr = node.expression.type === "named"
          ? node.expression.expression
          : node.expression;
        check(context, node.equals, expr, opts.afterEquals);
      },
      one_or_more(node: visitor.AST.OneOrMoreExpression): void {
        check(context, node.expression, node.operator, opts.beforePlus);
      },
      optional(node: visitor.AST.OptionalExpression): void {
        check(context, node.expression, node.operator, opts.beforeQuestion);
      },
      zero_or_more(node: visitor.AST.ZeroOrMoreExpression): void {
        check(context, node.expression, node.operator, opts.beforeStar);
      },
      semantic_and(node: visitor.AST.SemanticAndExpression): void {
        check(context, node.operator, node.code.open, opts.afterAmp);
      },
      semantic_not(node: visitor.AST.SemanticNotExpression): void {
        check(context, node.operator, node.code.open, opts.afterBang);
      },
      simple_and(node: visitor.AST.SimpleAndExpression): void {
        check(context, node.operator, node.expression, opts.afterAmp);
      },
      simple_not(node: visitor.AST.SimpleNotExpression): void {
        check(context, node.operator, node.expression, opts.afterBang);
      },
      text(node: visitor.AST.TextExpression): void {
        check(context, node.operator, node.expression, opts.afterDollar);
      },
      choice(node: visitor.AST.ChoiceExpression): void {
        const typ = node.parent?.type;
        const ruleDirect = (typ === "rule") || (typ === "named");
        node.slashes.forEach((slash, i) => {
          check(context, slash, node.alternatives[i + 1], opts.afterSlash);
          if (!ruleDirect) {
            check(context, node.alternatives[i], slash, opts.beforeSlash);
          }
        });
      },
      group(node: visitor.AST.GroupExpression): void {
        check(context, node.open, node.expression, opts.afterOpenParen);
        check(context, node.expression, node.close, opts.beforeCloseParen);
      },
      labeled(node: visitor.AST.LabeledExpression): void {
        if (node.pick) {
          if (node.name) {
            check(context, node.at, node.name, opts.afterAt);
          } else {
            check(context, node.at, node.expression, opts.afterAt);
          }
        }
        if (node.name) {
          check(context, node.name, node.colon, opts.beforeColon);
          check(context, node.colon, node.expression, opts.afterColon);
        }
      },
    });
  },
};

export default rule;