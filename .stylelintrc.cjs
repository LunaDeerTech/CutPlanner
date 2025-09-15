module.exports = {
  extends: ['stylelint-config-standard'],
  // Use postcss-html for linting Vue SFCs
  customSyntax: 'postcss-html',
  rules: {
    // Allow Tailwind CSS at-rules like @apply, @variants, @layer, @screen
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'layer',
          'components',
          'utilities'
        ]
      }
    ],
    // Relax a few rules for Tailwind/PostCSS usage
    'at-rule-empty-line-before': null,
    'declaration-empty-line-before': null,
    'import-notation': null
  }
}
