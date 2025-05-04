// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// エイリアスの設定を追加
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname),
};

module.exports = config; 