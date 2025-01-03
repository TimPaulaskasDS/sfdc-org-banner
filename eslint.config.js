const eslintPluginImport = require("eslint-plugin-import");

module.exports =
{
  plugins: {
    import: eslintPluginImport,
  },
  rules: {
    "import/extensions": ["error", "ignorePackages", { js: "always", jsx: "never" }],
  },
};