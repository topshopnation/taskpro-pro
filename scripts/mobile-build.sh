
#!/bin/bash

# Build the web app
echo "Building web app..."
npm run build

# Sync with Capacitor
echo "Syncing with Capacitor..."
npx cap sync

echo "Mobile build complete!"
echo ""
echo "Next steps:"
echo "1. To run on iOS simulator: npx cap run ios"
echo "2. To open in Xcode: npx cap open ios"
echo "3. To run on Android: npx cap run android"
echo "4. To open in Android Studio: npx cap open android"
