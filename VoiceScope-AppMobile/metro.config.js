const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Conserver vos extensions personnalisées
config.resolver.assetExts.push('wav', 'mp3', 'm4a', 'ttf', 'otf');

module.exports = config;