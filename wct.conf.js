module.exports = {
  verbose: true,
  plugins: {
    local: {
      browsers: ['chrome', 'firefox']
    },
    sauce: {
        disabled: true
      }
  },
  suites: [
    'test/px-bar-series-fixture.html',
    'test/px-histogram-series-fixture.html',
    'test/px-ts-chart-initialization-options-fixture.html',
    'test/px-ts-chart-scatter-series-fixture.html'
  ]
};
