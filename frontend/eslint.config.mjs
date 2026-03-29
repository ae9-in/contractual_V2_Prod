import nextConfig from "eslint-config-next";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  { ignores: ["prisma/generated/**"] },
  ...nextConfig,
  {
    rules: {
      // React Compiler rules are stricter than this codebase; enable gradually.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/incompatible-library": "off",
    },
  },
];

export default config;
