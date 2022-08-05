import type ESlint from "eslint";

const config: ESlint.ESLint.ConfigData = {
  plugins: ["@peggyjs"],
  overrides: [
    {
      files: ["**/*.peggy", "**/*.pegjs"],
      parser: "@peggyjs/eslint-parser",
      settings: {
        "@peggyjs/indent": 2,
        "@peggyjs/newline": "\n",
      },
      rules: {
        "@peggyjs/camelCase": ["error"],
        "@peggyjs/equal-next-line": ["error", "never", ["choice", "named"]],
        "@peggyjs/no-empty-actions": "error",
        "@peggyjs/no-empty-initializers": "error",
        "@peggyjs/no-unused-rules": "error",
        "@peggyjs/semantic-predicate-must-return": "error",
        "@peggyjs/separate-choices": "error",
      },
    },
    {
      files: ["**/*.peggy/*.js", "**/*.pegjs/*.js"],
      rules: {
        // The processor will not receive a Unicode Byte Order Mark.
        "unicode-bom": "off",
      },
    },
  ],
};

export default config;
