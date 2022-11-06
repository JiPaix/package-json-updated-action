# GitHub Action to detect changes in package.json version

This action outputs a variable 'has-updated' indicating that the package.json version was updated in the most recent commit.

## Inputs

### `path`

Sets the path to the package.json. Default 'package.json'.

## Outputs

### `has-updated`

Whether the package.json version has updated.

### `current-package-version`

The current package.json version

## Example usage

```
jobs:
  run-build-if-needed:
    runs-on: ubuntu-latest
    steps:
    - uses: JiPaix/package-json-updated-action@v1.0.3
      id: version-updated
      with:
        path: package.json
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    - uses: actions/checkout@v3
      if: steps.version-updated.outputs.has-updated
      with:
        fetch-depth: 1
    - uses: actions/setup-node@v3
      if: steps.version-updated.outputs.has-updated
      with:
        node-version: '16.x'
    - run: npm install
      if: steps.version-updated.outputs.has-updated
    - run: npm run build
      if: steps.version-updated.outputs.has-updated
```