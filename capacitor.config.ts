import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.arcadecabinet.overcastglaciers',
  appName: 'Overcast Glaciers',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0F172A",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
    StatusBar: {
        style: 'DARK',
        backgroundColor: '#0F172A',
    }
  },
};

export default config;