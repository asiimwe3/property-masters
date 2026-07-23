#!/bin/bash
#
# Generate a signing keystore for Property Masters APK
# Run this locally, then add the secrets to GitHub
#

KEYSTORE_NAME="property-masters"
KEYSTORE_FILE="${KEYSTORE_NAME}.jks"
ALIAS="property-masters"
STORE_PASS=""
KEY_PASS=""

read -s -p "Enter keystore password: " STORE_PASS
echo ""
read -s -p "Enter key password (same as above?): " KEY_PASS
echo ""

if [ "$KEY_PASS" = "" ]; then
  KEY_PASS="$STORE_PASS"
fi

keytool -genkey -v \
  -keystore "$KEYSTORE_FILE" \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias "$ALIAS" \
  -storepass "$STORE_PASS" \
  -keypass "$KEY_PASS" \
  -dname "CN=Property Masters, OU=Dev, O=Derycode, L=Kampala, ST=Kampala, C=UG"

echo ""
echo "Keystore created: $KEYSTORE_FILE"
echo ""
echo "=== GITHUB ACTIONS SECRETS ==="
echo "Add these to your GitHub repo (Settings → Secrets and variables → Actions):"
echo ""
echo "KEYSTORE_BASE64:"
base64 -i "$KEYSTORE_FILE" | tr -d '\n'
echo ""
echo ""
echo "KEYSTORE_PASSWORD: $STORE_PASS"
echo "KEY_ALIAS: $ALIAS"
echo "KEY_PASSWORD: $KEY_PASS"
echo ""
echo "=== LOCAL BUILD ENV VARS ==="
echo "export KEYSTORE_FILE=$(pwd)/$KEYSTORE_FILE"
echo "export KEYSTORE_PASSWORD=$STORE_PASS"
echo "export KEY_ALIAS=$ALIAS"
echo "export KEY_PASSWORD=$KEY_PASS"
