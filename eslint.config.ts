import { Linter } from "eslint";

const config: Linter.Config[] = [
  {
    ignores: ["node_modules/", "dist/"]
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: require("@typescript-eslint/parser")
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
      prettier: require("eslint-plugin-prettier")
    },
    rules: {
      "prettier/prettier": [
        "error",
        {
          useTabs: false,
          tabWidth: 2,
          singleQuote: false,
          semi: true,
          trailingComma: "none"
        }
      ],
      "comma-dangle": ["error", "never"],
      indent: ["error", 2, { ignoredNodes: ["PropertyDefinition"] }],
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { vars: "all", args: "after-used", ignoreRestSiblings: false }
      ]
    }
  }
];

export default config;
