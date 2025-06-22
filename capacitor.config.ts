
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.taskpro.app',  // Updated for App Store
  appName: 'TaskPro',
  webDir: 'dist',
  server: {
    url: 'https://cefd4ea4-a2ed-420a-b492-4acfe5ced87f.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#6366f1',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffffff'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    Haptics: {},
    App: {
      launchUrl: 'https://cefd4ea4-a2ed-420a-b492-4acfe5ced87f.lovableproject.com?forceHideBadge=true'
    }
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#ffffff'
  }
};

export default config;
