# @peggyjs/eslint-plugin

An [eslint](https://eslint.org/) plugin to check [peggy](https://peggyjs.org)
grammars.

## Usage

Install with:

```bash
npm install --save-dev peggyjs/peggyjs-eslint-plugin peggyjs/peggyjs-eslint-parser eslint
```

(update this when we publish!)

Add to your `.eslintrc.js` file:

```js
module.exports = {
  extends: ["plugin:@peggyjs/recommended"],
};
```

or if you'd like more control:

```js
module.exports = {
  plugins: ["@peggyjs"],
  overrides: [
    {
      files: ["*.peggy", "*.pegjs"],
      parser: "@peggyjs/eslint-parser",
      settings: {
        "@peggyjs/indent": 2,
        "@peggyjs/newline": "\n",
      }
      rules: {
        "@peggyjs/equal-next-line": ["error", "never", ["choice", "named"]],
        ...
      },
    },
    {
      files: ["**/*.peggy/*.js", "**/*.pegjs/*.js"],
      rules: {
        // Even if you normally want BOMs (which you shouldn't.  Always use
        // UTF-8.), you're not getting one this time.
        "unicode-bom": "off",
      },
    },
  ],
};
```

## Rules

- ✒️ - Fixable rules.
- ⭐️ - Recommended rules.

| Rule ID | Description |    |
|:--------|:------------|:--:|
| [@peggyjs/equal-next-line](./docs/rules/equal-next-line.md) | Ensure that the equals sign in a rule is in a consistent location. | ✒️ ⭐️ |
| [@peggyjs/no-empty-initializers](./docs/rules/no-empty-initializers.md) | Top-level and per-instance initializers should not be empty. | ✒️ ⭐️ |
| [@peggyjs/separate-choices](./docs/rules/separate-choices.md) | Ensure that each top-level choice in a rule is on a new line. | ✒️ ⭐️ |

## Settings

There are several plugin-wide [settings](./docs/settings.md) that control
whitespace insertion.

## Other Features

- Checks the Javascript code embedded in your grammar according to your existing ESlint rules for JS.

## Using with Visual Studio Code

Add the following to your project's `.vscode/settings.json` file:

```js
{
  "eslint.validate": [
    "javascript",
    "peggy"
  ]
}
```

[![Tests](https://github.com/peggyjs/peggyjs-eslint-plugin/actions/workflows/node.js.yml/badge.svg)](https://github.com/peggyjs/peggyjs-eslint-plugin/actions/workflows/node.js.yml)
[![codecov](https://codecov.io/gh/peggyjs/peggyjs-eslint-plugin/branch/main/graph/badge.svg?token=PYAF34DQ6B)](https://codecov.io/gh/peggyjs/peggyjs-eslint-plugin)
