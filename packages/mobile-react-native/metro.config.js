/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

// https://mmazzarolo.com/blog/2021-09-18-running-react-native-everywhere-mobile/

var blacklist = require('metro-config/src/defaults/exclusionList');
var {
  getMetroTools,
  getMetroAndroidAssetsResolutionFix,
} = require('react-native-monorepo-tools');

var monorepoMetroTools = getMetroTools();
var androidAssetsResolutionFix = getMetroAndroidAssetsResolutionFix();

module.exports = {
  resolver: {
    blockList: blacklist(monorepoMetroTools.blockList),
    extraNodeModules: monorepoMetroTools.extraNodeModules,
  },
  transformer: {
    publicPath: androidAssetsResolutionFix.publicPath,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  server: {
    enhanceMiddleware: middleware => {
      return androidAssetsResolutionFix.applyMiddleware(middleware);
    },
  },
  watchFolders: monorepoMetroTools.watchFolders,
};
