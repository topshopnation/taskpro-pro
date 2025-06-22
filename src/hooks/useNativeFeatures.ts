
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { App } from '@capacitor/app';

export const useNativeFeatures = () => {
  useEffect(() => {
    const initializeNativeFeatures = async () => {
      if (Capacitor.isNativePlatform()) {
        // Hide splash screen after app loads
        await SplashScreen.hide();
        
        // Set status bar style
        await StatusBar.setStyle({ style: Style.Default });
        
        // Show keyboard accessory bar on iOS
        if (Capacitor.getPlatform() === 'ios') {
          Keyboard.setAccessoryBarVisible({ isVisible: true });
        }
      }
    };
    
    initializeNativeFeatures();
  }, []);

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Light) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style });
    }
  };

  const shareContent = async (title: string, text: string, url?: string) => {
    if (Capacitor.isNativePlatform()) {
      await Share.share({
        title,
        text,
        url,
      });
    }
  };

  const setStatusBarStyle = async (isDark: boolean) => {
    if (Capacitor.isNativePlatform()) {
      await StatusBar.setStyle({
        style: isDark ? Style.Dark : Style.Light
      });
    }
  };

  return {
    triggerHaptic,
    shareContent,
    setStatusBarStyle,
    isNative: Capacitor.isNativePlatform(),
    platform: Capacitor.getPlatform()
  };
};
