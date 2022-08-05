import type { Rule } from "eslint";
import { n } from "../utils";
import type { visitor } from "@peggyjs/eslint-parser";

function checkQuotes(
  context: Rule.RuleContext,
  style: "double" | "single",
  avoidEscape: boolean,
  node: visitor.AST.DisplayName | visitor.AST.LiteralExpression
): void {
  if (style === "double") {
    if (node.before.value !== '"') {
      // Use raw here, since we want to output exactly what was there before,
      // without having to re-escape.
      let escaped = node.raw;
      if (escaped.includes('"')) {
        if (avoidEscape) {
          return;
        }
        escaped = escaped.replace(/"/g, '\\"');
      }
      context.report({
        node: n(node),
        messageId: "wrongQuotes",
        data: { description: "doublequote" },
        fix(fixer: Rule.RuleFixer): Rule.Fix {
          return fixer.replaceText(n(node), `"${escaped}"`);
        },
      });
    }
  } else {
    if (node.before.value !== "'") {
      let escaped = node.raw;
      if (node.value.includes("'")) {
        if (avoidEscape) {
          return;
        }
        escaped = escaped.replace(/'/g, "\\'");
      }
      context.report({
        node: n(node),
        messageId: "wrongQuotes",
        data: { description: "doublequote" },
        fix(fixer: Rule.RuleFixer): Rule.Fix {
          return fixer.replaceText(n(node), `'${escaped}'`);
        },
      });
    }
  }
}

const rule: Rule.RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description: "enforce the consistent use of double or single quotes",
      recommended: true,
      url: "https://github.com/peggyjs/peggyjs-eslint-plugin/blob/main/docs/rules/quotes.md",
    },
    messages: {
      wrongQuotes: "Strings must use {{description}}.",
    },
    fixable: "code",
    schema: [
      {
        enum: ["single", "double"],
      },
      {
        type: "object",
        properties: {
          avoidEscape: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context: Rule.RuleContext): Rule.RuleListener {
    const style = context.options[0] || "double";
    const opts = {
      avoidEscape: true,
      ...context.options[1],
    };

    return {
      // @ts-expect-error Peggy AST isn't expected by eslint
      display(node: visitor.AST.DisplayName): void {
        checkQuotes(context, style, opts.avoidEscape, node);
      },
      // @ts-expect-error Peggy AST isn't expected by eslint
      literal(node: visitor.AST.LiteralExpression): void {
        checkQuotes(context, style, opts.avoidEscape, node);
      },
    };
  },
};

export default rule;
