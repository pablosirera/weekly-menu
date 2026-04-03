const pluginVue = require('eslint-plugin-vue')
const prettierConfig = require('@vue/eslint-config-prettier')

module.exports = [
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  ...pluginVue.configs['flat/essential'],
  prettierConfig,
  {
    rules: {
      'vue/block-order': [
        'error',
        {
          order: ['script', 'template', 'style'],
        },
      ],
    },
  },
]
