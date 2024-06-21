const esLintConfig = require('kolibri-format/.eslintrc');

const nuxtDocsRules = {
  // Vuetify's helper attributes use hyphens and they would
  // not be recognized if auto-formatted to camel case
  'vue/attribute-hyphenation': 0,
  // This rule conflicts with Nuxt page naming
  'vue/no-reserved-component-names': 0,
  // This rule conflicts with Nuxt page naming
  'kolibri/vue-filename-and-component-name-match': 0,
  // max-len rules are unhelpful for documentation
  'max-len': 0,
  'vue/max-len': 0,
};

esLintConfig.overrides.push({
  files: ['docs/**/*.vue'],
  rules: nuxtDocsRules,
});


// Allow nuxt resources to be found
esLintConfig.settings['import/resolver'].nuxt = {
  extensions: ['.js', '.vue'],
  nuxtSrcDir: 'docs',
};

// Remove linting errors for the globals defined in the jest-puppeteer package
esLintConfig.env = {
  ...esLintConfig.env,
  'jest': true,
};

esLintConfig.globals = {
  ...esLintConfig.globals,
  page: true,
  browser: true,
  context: true,
  puppeteerConfig: true,
  jestPuppeteer: true,
};

module.exports = esLintConfig;
