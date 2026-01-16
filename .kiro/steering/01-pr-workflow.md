---
inclusion: always
---

# Pull Request Workflow

## Before Creating PR

1. Ensure all tests pass locally:
   ```bash
   pnpm run test
   pnpm run test:e2e
   ```

2. Run linter and fix issues:
   ```bash
   pnpm exec biome check . --write
   ```

3. Verify build succeeds:
   ```bash
   pnpm run build
   ```

4. Test mobile viewport in browser DevTools (vertical orientation)

5. For Capacitor changes, sync and test:
   ```bash
   pnpm run cap:sync
   ```

## PR Description Template

```markdown
## Summary
Brief description of what this PR accomplishes.

## Changes
- List of specific changes made
- Include file paths for major modifications

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing on mobile viewport
- [ ] Linter passes

## Screenshots/Videos
(Include for UI changes)
```

## CI Pipeline

PRs trigger the CI workflow (`.github/workflows/ci.yml`):

1. **Lint**: `pnpm exec biome check .`
2. **Unit Tests**: `pnpm run test`
3. **E2E Tests**: `pnpm run test:e2e`
4. **Build**: `pnpm run build`

All checks must pass before merge.

## Review Process

- Self-review your changes before requesting review
- Respond to feedback promptly
- Keep PR scope focused - one feature/fix per PR
- Squash commits when merging if commit history is noisy

## Deployment

Merges to `main` trigger automatic deployment:

1. **GitHub Pages**: Web version deployed automatically
2. **Android APK**: Debug build uploaded as artifact

Production releases should be tagged with semantic versioning.
