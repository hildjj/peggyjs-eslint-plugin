"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isUnderscored(name) {
    // Remove leading and trailing underscores
    const nameBody = name.replace(/^_+|_+$/g, "");
    // If there's an underscore, it might be A_CONSTANT, which is okay
    return nameBody.includes("_") && (nameBody !== nameBody.toUpperCase());
}
function goodName(badName) {
    // Keep leading and trailing underscores, remove the rest.  Upcase the first
    // letter, and anything following an underscore.
    const lm = badName.match(/^(_+)/);
    const leading = lm ? lm[1] : "";
    const tm = badName.match(/(_+)$/);
    const trailing = tm ? tm[1] : "";
    const body = badName.replace(/^_+|_+$/g, "");
    const sans = body.replace(/_+(.)/g, (_, c) => c.toUpperCase());
    return `${leading}${sans[0].toUpperCase()}${sans.slice(1)}${trailing}`;
}
function getFixes(rules, refs, node, fixer) {
    const good = goodName(node.name.value);
    if (rules.some(r => r.name.value === good)) {
        return [];
    }
    const fixes = refs
        .filter(ref => ref.name.value === node.name.value)
        .map(ref => fixer.replaceText(ref.name, good));
    fixes.unshift(fixer.replaceText(node.name, good));
    return fixes;
}
const rule = {
    meta: {
        type: "suggestion",
        docs: {
            description: "enforce camelcase naming convention",
            recommended: true,
            url: "https://github.com/peggyjs/peggyjs-eslint-plugin/blob/main/docs/rules/camelCase.md",
        },
        messages: {
            notCamelCase: "Identifier '{{name}}' is not in camel case.",
            notInitialCap: "Rule '{{name}}' should start with a capital letter",
            initialCap: "Label '{{name}}' should not start with a capital letter",
        },
        fixable: "code",
        schema: [],
    },
    create(context) {
        const refs = [];
        const rules = [];
        return {
            // @ts-expect-error Peggy AST isn't expected by eslint
            rule(node) {
                rules.push(node);
            },
            // @ts-expect-error Peggy AST isn't expected by eslint
            rule_ref(node) {
                refs.push(node);
            },
            // @ts-expect-error Peggy AST isn't expected by eslint
            labeled(node) {
                const name = node.name?.value;
                if (name) {
                    // No fixes for these, since it would require a JS AST.
                    if (isUnderscored(name)) {
                        context.report({
                            node: node.name,
                            messageId: "notCamelCase",
                            data: { name },
                        });
                    }
                    const first = name[0];
                    if (first !== first.toLocaleLowerCase()) {
                        context.report({
                            node: node.name,
                            messageId: "initialCap",
                            data: { name },
                        });
                    }
                }
            },
            "Program:exit": () => {
                for (const node of rules) {
                    const name = node.name.value;
                    if (isUnderscored(name)) {
                        context.report({
                            node: node.name,
                            messageId: "notCamelCase",
                            data: { name },
                            fix(fixer) {
                                return getFixes(rules, refs, node, fixer);
                            },
                        });
                    }
                    else {
                        // Don't put in two sets of fixes for the same thing.
                        const first = name[0];
                        if (first !== first.toUpperCase()) {
                            context.report({
                                node: node.name,
                                messageId: "notInitialCap",
                                data: { name },
                                fix(fixer) {
                                    return getFixes(rules, refs, node, fixer);
                                },
                            });
                        }
                    }
                }
            },
        };
    },
};
exports.default = rule;