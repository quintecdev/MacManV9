module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  "env": {
    "test": {
      "plugins": ["react-native-config-node/transform"]
    }
  }
  // plugins: ['react-native-reanimated/plugin']
};
