#!/bin/bash
cd /tmp
rm -rf test-repo
mkdir test-repo
cd test-repo
git init
echo "test" > file.txt
git add file.txt
git commit -m "Initial commit"
git branch -M master

# Берём токен из .env
source ~/ai-galaxy-core/.env

# Пробуем push
git remote add origin https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/test-git-push-$(date +%s).git
git push -u origin master 2>&1
