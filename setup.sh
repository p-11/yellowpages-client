#! /bin/bash

# Script to link hooks from version-controlled directory to .git/hooks
#
# If you change anything in this file, you need to run this script again (and tell others to do the same).

hooks_dir=$(git rev-parse --show-toplevel)/hooks
git_hooks_dir=$(git rev-parse --show-toplevel)/.git/hooks
ln -sf $hooks_dir/pre-commit $git_hooks_dir/pre-commit
ln -sf $hooks_dir/pre-push $git_hooks_dir/pre-push

echo "Set up and ready to go 🤘"
