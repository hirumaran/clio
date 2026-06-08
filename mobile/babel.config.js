module.exports = function (api) {
  api.cache(true);

  return {
    presets: [['babel-preset-expo'], 'nativewind/babel'],

    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '^@/assets/(.+)': './assets/\\1',
            '^@/(.+)': './src/\\1',
          },
        },
      ],
      'react-native-worklets/plugin',
    ],
  };
};
