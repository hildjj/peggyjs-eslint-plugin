# @peggyjs/no-unused-rules
> All rules except for the first one must be referenced by another rule.
> - ⭐️ This rule is included in `plugin:@peggyjs/recommended` preset.

## 📖 Rule Details

The first grammar rule, by default, is the entry point for parsing.  All other
rules should be referenced in at least one other rule.  Unreferenced rules
might be caused by typos, or they may be left over from previous versions.

:-1: Examples of **incorrect** code for this rule:

```peg.js
// eslint @peggyjs/no-unused-rules

foo = "1" // Good.  Default entry point.
bar = "2" // Bad.  Not referenced.
```

:+1: Examples of **correct** code for this rule:

```peg.js
// eslint @peggyjs/no-unused-rules

foo = bar
bar = "2"
```

## 🔎 Implementation

- [Rule source](../../src/rules/no-unused-rules.ts)
- [Test source](../../test/lib/rules/no-unused-rules.js)
