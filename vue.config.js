module.exports = {
  "transpileDependencies": [
    "vuetify"
  ]
,
 
  pwa: {
    name: 'Scout XYZ',
    themeColor: '#4CAF50',
    msTileColor: '#4CAF50',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',

    workboxPluginMode: "InjectManifest",
    workboxOptions:{
      swSrc: "src/service-worker.js"
    }
  }
}