export const config = {
  content: [
    {
      base: "src",
      pattern: "**/examples/**/*.md",
      name: "nxtcm-components-docs",
    },
  ],
  outputDir: './dist',
  propsGlobs: [
    {
      include: ['**/src/**/*.tsx'],
      exclude: [
        '/**/__mocks__/**',
        '/**/__tests__/**',
        '/**/*.test.tsx',
      ],
    },
  ],
}
