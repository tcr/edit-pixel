#!/bin/bash

git stash clear
git stash
git checkout -b gh-pages || git checkout gh-pages
git reset --hard master
git push -f origin gh-pages
git checkout master
git stash pop
