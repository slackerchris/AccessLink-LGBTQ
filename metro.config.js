const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configure for web with CSP support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
