// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Save the default resolver
const defaultResolver = config.resolver.resolveRequest;

// Configure resolver to exclude expo-sqlite from web bundle
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Block expo-sqlite and its dependencies on web to prevent WASM bundling errors
  if (platform === 'web') {
    // Block expo-sqlite module
    if (moduleName === 'expo-sqlite' || 
        moduleName.startsWith('expo-sqlite/') ||
        moduleName.includes('expo-sqlite')) {
      return {
        type: 'empty',
      };
    }
    
    // Block WASM file imports and worker files
    if (moduleName.includes('.wasm') || 
        moduleName.includes('wa-sqlite') ||
        moduleName.includes('expo-sqlite/web')) {
      return {
        type: 'empty',
      };
    }
  }
  
  // Use default resolution for all other modules
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
