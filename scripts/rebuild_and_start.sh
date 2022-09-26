# Helper scripts for performing a full rebuild before starting the backend.

# Clean and reinstall dependencies.
rm -rf node_modules
yarn install --dev || exit 1

# Build the game client.
if [ -z $FIREBASE_URL ]; then
	echo "Error FIREBASE_URL must be set in order to build the app!"
	exit 1
fi
yarn build || exit 1

# Start backend services.
docker compose up
