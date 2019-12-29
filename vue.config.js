module.exports = {
  transpileDependencies: ["vuetify"],
  pwa: {
    name: "Scout XYZ",
    start_url: ".",
    display: "standalone",

    themeColor: "#4CAF50",
    msTileColor: "#4CAF50",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "black",
    backgroundColor: "#FFFFFF",

    workboxPluginMode: "InjectManifest",
    workboxOptions: {
      swSrc: "src/service-worker.js"
    }
  }
};
