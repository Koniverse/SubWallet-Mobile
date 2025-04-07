#!/bin/bash

# How to use:
# pre-release.sh patch
# Path to the `package.json` file
PACKAGE_JSON="package.json"

# Function to increment the version of Android, iOS, package.json
increment_version() {
  CURRENT_VERSION=$(grep -o '"version": "[^"]*"' $PACKAGE_JSON | awk -F ' ' '{print $2}' | tr -d ',"')
  BUILD_NUMBER=$(grep -o '"build": "[^"]*"' $PACKAGE_JSON | awk -F ' ' '{print $2}' | tr -d ',"')
  INCREMENT=$1

  # Split the version string into major, minor, and patch components
  IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
  MAJOR=${VERSION_PARTS[0]}
  MINOR=${VERSION_PARTS[1]}
  PATCH=${VERSION_PARTS[2]}

  case "$INCREMENT" in
    major) MAJOR=$((MAJOR + 1));;
    minor) MINOR=$((MINOR + 1));;
    patch) PATCH=$((PATCH + 1));;
  esac

  NEW_VERSION="$MAJOR.$MINOR.$PATCH"
  NEW_BUILD_NUMBER=$((BUILD_NUMBER + 1))

  sed -i -e 's/"version": "[^"]*"/"version": "'"$NEW_VERSION"'"/' $PACKAGE_JSON
  sed -i -e 's/"build": "[^"]*"/"build": "'"$NEW_BUILD_NUMBER"'"/' $PACKAGE_JSON
  sed -i -e "s|$CURRENT_VERSION|$NEW_VERSION|g" ios/SubWalletMobile.xcodeproj/project.pbxproj
  sed -i -e "s|$BUILD_NUMBER|$NEW_BUILD_NUMBER|g" ios/SubWalletMobile.xcodeproj/project.pbxproj
  sed -i -e "s|$CURRENT_VERSION|$NEW_VERSION|g" android/app/build.gradle
  sed -i -e "s|$BUILD_NUMBER|$NEW_BUILD_NUMBER|g" android/app/build.gradle
  rm -f "$PACKAGE_JSON-e"
  rm -f ios/SubWalletMobile.xcodeproj/project.pbxproj-e
  rm -f android/app/build.gradle-e

  echo "Version incremented to v$NEW_VERSION ($NEW_BUILD_NUMBER)"
}

# Function to add new release notes to CHANGELOG.md
update_changelog() {
  CURRENT_VERSION=$(grep -o '"version": "[^"]*"' $PACKAGE_JSON | awk -F ' ' '{print $2}' | tr -d ',"')
  BUILD_NUMBER=$(grep -o '"build": "[^"]*"' $PACKAGE_JSON | awk -F ' ' '{print $2}' | tr -d ',"')

  # Get the most recent tag
  recent_tag=$(git describe --tags --abbrev=0)

  # Get the commit messages between the recent tag and the current state
  commit_messages=$(git log --pretty=format:"%s" $recent_tag..HEAD)

  # Filter and format commit messages, example: "- Messages (#123)"
  filtered_messages=$(echo "$commit_messages" | grep -oE '\[Issue-[0-9a-zA-Z]+\] .+' | sed -E 's/\[Issue-([0-9a-zA-Z]+)\] (.+)/- \2 (#\1)/')

  # Update CHANGELOG.md
  changelog_file="CHANGELOG.md"
  temp_file="temp_changelog.md"

  # Add the formatted commit messages to the temporary file
  echo "## $CURRENT_VERSION ($BUILD_NUMBER)" >> "$temp_file"
  echo "$filtered_messages" >> "$temp_file"
  echo "" >> "$temp_file"

  # Append the current content of CHANGELOG.md to the temporary file
  if [ -f "$changelog_file" ]; then
      cat "$changelog_file" >> "$temp_file"
  fi

  # Overwrite the original CHANGELOG.md with the temporary file
  mv "$temp_file" "$changelog_file"
  rm -f "$temp_file"

  echo "Changelog updated with commit messages."
}

# Function to create a release commit
commit_changed() {
  CURRENT_VERSION=$(grep -o '"version": "[^"]*"' $PACKAGE_JSON | awk -F ' ' '{print $2}' | tr -d ',"')
  BUILD_NUMBER=$(grep -o '"build": "[^"]*"' $PACKAGE_JSON | awk -F ' ' '{print $2}' | tr -d ',"')

  git add .
  git commit -m "Release version $CURRENT_VERSION ($BUILD_NUMBER)"

  git tag "v$CURRENT_VERSION-$BUILD_NUMBER"
  git push origin upgrade-ui --tags
}

# Parameter for version increment (major, minor, or patch)
INCREMENT_TYPE=$1

if [ -z "$INCREMENT_TYPE" ]; then
  echo "Usage: $0 [major|minor|patch|default]"
  exit 1
fi

increment_version $INCREMENT_TYPE
update_changelog
commit_changed
