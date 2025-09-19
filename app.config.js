import 'dotenv/config';

export default {
  expo: {
    name: "my-map-project",
    slug: "my-map-project",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.othmanlearn.mymapproject",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      package: "com.othmanlearn.mymapproject"
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      MAPBOX_TOKEN: process.env.MAPBOX_TOKEN, // accessible in JS code
      eas: {
        projectId: "0f20cb6b-9a80-4057-998c-a421ef67cce3"
      }
    },
    owner: "othmanlearn",
    plugins: [
      [
        "@rnmapbox/maps",
        {
          RNMapboxMapsDownloadToken: process.env.MAPBOX_TOKEN
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "يحتاج التطبيق للموقع لإيجاد أقرب قابلة في حالات الطوارئ.",
          isIosBackgroundLocationEnabled: false,
          isAndroidBackgroundLocationEnabled: false
        }
      ]
    ]
  }
};