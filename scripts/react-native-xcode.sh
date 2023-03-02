#!/bin/bash
# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

# Bundle React Native app's code and image assets.
# This script is supposed to be invoked as part of Xcode build process
# and relies on environment variables (including PWD) set by Xcode

# Print commands before executing them (useful for troubleshooting)
set -x
set -e
DEST=$CONFIGURATION_BUILD_DIR/$UNLOCALIZED_RESOURCES_FOLDER_PATH

# Path to react-native folder inside node_modules
REACT_NATIVE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/node_modules/react-native/"
# The project should be located next to where react-native is installed
# in node_modules.
PROJECT_ROOT=${PROJECT_ROOT:-"$REACT_NATIVE_DIR/../.."}

HERMES_ENGINE_PATH="$PODS_ROOT/hermes-engine"
HERMES_CLI_PATH="$HERMES_ENGINE_PATH/destroot/bin/hermesc"

BUNDLE_FILE="$CONFIGURATION_BUILD_DIR/main.jsbundle"

yarn run react-native bundle \
  --entry-file index.js \
  --platform ios \
  --dev false \
  --reset-cache \
  --bundle-output "$BUNDLE_FILE" \
  --assets-dest "$DEST" \
  --minify false
 
"$HERMES_CLI_PATH" -emit-binary -O -out "$DEST/main.jsbundle" "$BUNDLE_FILE"

BUNDLE_FILE="$DEST/main.jsbundle"

if [[ ! -f "$BUNDLE_FILE" ]]; then
  echo "error: File $BUNDLE_FILE does not exist. This must be a bug with React Native, please report it here: https://github.com/facebook/react-native/issues" >&2
  exit 2
fi
