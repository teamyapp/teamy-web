#!/bin/bash

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 GITHUB_PACKAGES_ACCESS_TOKEN"
    exit 1
fi

GITHUB_PACKAGES_ACCESS_TOKEN=$1

cat > .npmrc << EOF
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_ACCESS_TOKEN}
@teamyapp:registry=https://npm.pkg.github.com/
EOF

echo ".npmrc created"