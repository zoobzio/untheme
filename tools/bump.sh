#!/bin/bash

set -e

cd $(git rev-parse --show-toplevel)

NEW_VERSION=$(node -p -e "require('./package.json').version")

for dir in ./packages/*/    
do
  if [ -f ${dir}/package.json ]; then
      sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"${NEW_VERSION}\"/g" ${dir}/package.json 
  fi
done

git add package.json packages/*/package.json
git commit --amend --no-edit
