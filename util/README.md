# Utilities

## gh-delete-images.js
Uses the Github Cli (`gh`) for finding and deleting container images. 

```
gh api \
                                       -H "Accept: application/vnd.github+json" \
                                       -H "X-GitHub-Api-Version: 2022-11-28" \
                                       /orgs/e-learning-by-sse/packages/container/nm-self-learning/versions --paginate >
 list.txt
node gh-delete-images.sh
```
Make sure to check the script if the filter for the IDs fits. The default value is that all untagged images are deleted
