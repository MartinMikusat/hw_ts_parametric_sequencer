# Publishing Guide

This document outlines the steps for publishing `hw-ts-parametric-sequencer` to npm.

## Prerequisites

1. **npm account**: Create an account at [npmjs.com](https://www.npmjs.com/)
2. **Login**: Run `npm login` to authenticate
3. **Verify package name**: Check that `hw-ts-parametric-sequencer` is available on npm

## Pre-Publishing Checklist

- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Version number is correct in `package.json`
- [ ] `CHANGELOG.md` is updated with new version
- [ ] `README.md` is complete and accurate
- [ ] All public APIs have TSDoc comments
- [ ] Documentation is generated and up to date (`npm run docs:generate`)
- [ ] Documentation builds successfully (`npm run docs:build`)
- [ ] License file is present
- [ ] No sensitive data in the package
- [ ] `.npmignore` excludes unnecessary files

## Publishing Steps

### 1. Build and Test

```bash
npm run build
npm test
npm run docs:generate  # Ensure documentation is up to date
```

### 2. Update Version

Update the version in `package.json` following [Semantic Versioning](https://semver.org/):

- **Patch** (0.0.1 → 0.0.2): Bug fixes
- **Minor** (0.0.1 → 0.1.0): New features, backward compatible
- **Major** (0.0.1 → 1.0.0): Breaking changes

Also update `CHANGELOG.md` with the new version and changes.

### 3. Dry Run

Test what will be published without actually publishing:

```bash
npm pack --dry-run
```

Or create a tarball to inspect:

```bash
npm pack
# This creates hw-ts-parametric-sequencer-0.0.1.tgz
# Inspect it, then delete it
```

### 4. Publish

**For first release:**

```bash
npm publish --access public
```

**For subsequent releases:**

```bash
npm publish
```

### 5. Verify

After publishing, verify the package on npm:

1. Visit: `https://www.npmjs.com/package/hw-ts-parametric-sequencer`
2. Check that all files are present
3. Test installation: `npm install hw-ts-parametric-sequencer`

## Publishing Scopes

If you want to publish under a scope (e.g., `@yourusername/hw-ts-parametric-sequencer`):

1. Update `package.json` name: `"name": "@yourusername/hw-ts-parametric-sequencer"`
2. Publish with: `npm publish --access public` (scoped packages are private by default)

## Automated Publishing

Consider setting up GitHub Actions for automated publishing on tags:

```yaml
# .github/workflows/publish.yml
name: Publish to npm
on:
  release:
    types: [created]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

## Troubleshooting

### "Package name already exists"
- Choose a different name or use a scope

### "You do not have permission"
- Check you're logged in: `npm whoami`
- Verify package ownership

### "Missing files"
- Check `.npmignore` and `package.json` `files` field
- Run `npm pack` to see what will be included

### "Type definitions not found"
- Ensure `types` field in `package.json` points to correct file
- Verify `vite-plugin-dts` is generating declarations correctly

## Post-Publishing

1. Create a GitHub release with the same version
2. Documentation will be automatically deployed (if changes were made to docs)
3. Verify documentation site is updated
4. Announce the release (if applicable)

## Documentation

The project includes a documentation site built with Astro and Starlight. The documentation is automatically built and deployed to GitHub Pages on push to `main` branch.

**Documentation workflow:**
- API documentation is generated from TSDoc comments using TypeDoc
- Guide pages are written in Markdown/MDX
- Build process: `npm run docs:generate` → `cd docs && npm run build`
- See [README.md](./README.md#contributing-to-documentation) for more details on contributing to documentation

