# Clean and reinstall dependencies.
rm -rf node_modules
yarn install --dev || exit 1

# Build the game client.
if [ -z $FIREBASE_URL ]; then
	echo "Error: FIREBASE_URL must be set in order to build the app!"
	exit 1
fi
if [ -z $API_URL ]; then
	echo "Error: API_URL must be set in order to build the app!"
fi
NODE_ENV=staging ALL_CARDS_AVAILABLE=true yarn build || exit 1
