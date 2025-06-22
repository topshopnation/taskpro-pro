
import React, { useEffect } from 'react';
import { useNativeFeatures } from '@/hooks/useNativeFeatures';
import { useTheme } from '@/components/theme-provider';
import { TaskProLogo } from '@/components/ui/taskpro-logo';
import { Bell, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImpactStyle } from '@capacitor/haptics';

interface MobileAppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
}

export const MobileAppLayout: React.FC<MobileAppLayoutProps> = ({
  children,
  title = "TaskPro",
  showBackButton = false,
  onBackPress,
  rightAction
}) => {
  const { triggerHaptic, setStatusBarStyle, isNative } = useNativeFeatures();
  const { theme } = useTheme();

  useEffect(() => {
    if (isNative) {
      setStatusBarStyle(theme === 'dark');
    }
  }, [theme, isNative, setStatusBarStyle]);

  const handleButtonPress = async (callback?: () => void) => {
    await triggerHaptic(ImpactStyle.Light);
    callback?.();
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* iOS-style Navigation Bar */}
      <div className="ios-nav-bar safe-area-top">
        <div className="flex items-center">
          {showBackButton ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleButtonPress(onBackPress)}
              className="ios-button-secondary"
            >
              ← Back
            </Button>
          ) : (
            <TaskProLogo size="small" withText={false} />
          )}
        </div>
        
        <div className="flex-1 text-center">
          <h1 className="font-semibold text-lg truncate px-4">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {rightAction || (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleButtonPress()}
                className="p-2"
              >
                <Bell className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleButtonPress()}
                className="p-2"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-safe">
        <div className="mobile-optimized">
          {children}
        </div>
      </div>
    </div>
  );
};
