import { RuleTester } from "@typescript-eslint/rule-tester";
import parser from "@typescript-eslint/parser";

export const ruleTester = new RuleTester({
    languageOptions: {
        parser,
        parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
});
