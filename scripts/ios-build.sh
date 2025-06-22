
#!/bin/bash

echo "🚀 Building TaskPro for iOS App Store..."

# Build the web app
echo "📦 Building web application..."
npm run build

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync ios

# Update iOS platform
echo "📱 Updating iOS platform..."
npx cap update ios

echo "✅ iOS build preparation complete!"
echo ""
echo "📋 Next steps for App Store deployment:"
echo "1. Open the project in Xcode: npx cap open ios"
echo "2. Configure your Apple Developer account and signing certificates"
echo "3. Update the bundle identifier in Xcode to match your Apple Developer account"
echo "4. Configure app icons and launch screens in Xcode"
echo "5. Test on physical device: npx cap run ios --target=device"
echo "6. Archive and upload to App Store Connect through Xcode"
echo ""
echo "📖 For detailed iOS deployment guide, visit:"
echo "https://capacitorjs.com/docs/ios/deploying-to-app-store"
