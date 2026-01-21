# Troubleshooting

Common issues and solutions for [PROJECT_NAME].

<!-- AI: This document captures recurring problems and their solutions. It serves as a first stop for debugging and reduces time spent on known issues. Organize by category and keep solutions actionable. -->

---

## How to Use This Document

<!-- AI: Explain how to use and maintain this troubleshooting guide:
- Search for error messages or symptoms
- Follow solutions step by step
- Add new issues as they're discovered and resolved
- Link to external resources when helpful
- Keep solutions up to date as the project evolves -->

---

## Issue Template

<!-- AI: Use this template when adding new troubleshooting entries: -->

```markdown
### Issue Title (descriptive name)

**Symptom**: What the user sees or experiences
**Error Message**: Exact error text (if applicable)
```
error message here
```

**Cause**: Why this happens

**Solution**:
1. Step one
2. Step two
3. Step three

**Prevention**: How to avoid this in the future (optional)
```

---

## Environment Setup Issues

<!-- AI: Document issues that occur during initial project setup or environment configuration. Common categories:
- Missing dependencies
- Version mismatches
- Path/permission issues
- Platform-specific problems -->

### Missing Runtime/Compiler

<!-- AI: Add issues for missing language runtimes. Example structure: -->

**Symptom**: Build fails immediately with "command not found" or "not recognized"

**Common Errors**:
```
<!-- AI: Add actual error messages for your stack, e.g.:
- node: command not found
- python: command not found
- go: command not found
- cargo: command not found
-->
```

**Solution**:
1. Install the required runtime for your platform
2. Verify installation: `[command] --version`
3. Restart your terminal to pick up PATH changes

<!-- AI: Add links to installation guides for your stack -->

---

### Dependency Installation Failures

<!-- AI: Document package manager issues. Vary by ecosystem: -->

**Symptom**: Package installation fails or hangs

**Common Causes**:
- Network issues or proxy configuration
- Conflicting dependency versions
- Corrupted cache
- Insufficient permissions

**Solutions by Package Manager**:

<!-- AI: Fill in for your package manager(s):

**npm/pnpm/yarn**:
- Clear cache: `npm cache clean --force` or `pnpm store prune`
- Delete lock file and node_modules, reinstall
- Check for peer dependency conflicts

**pip/Poetry**:
- Upgrade pip: `pip install --upgrade pip`
- Use virtual environment
- Check Python version compatibility

**cargo**:
- Update Rust: `rustup update`
- Clean build: `cargo clean`
- Check for feature flag conflicts

**go mod**:
- Clear module cache: `go clean -modcache`
- Verify go.sum: `go mod verify`
-->

---

### Version Mismatch

**Symptom**: Build succeeds but runtime errors occur, or features don't work as expected

**Common Errors**:
```
<!-- AI: Add version-related errors for your stack -->
```

**Solution**:
1. Check required versions in project documentation
2. Verify installed versions match requirements
3. Use version manager if needed (nvm, pyenv, rustup, etc.)

---

## Build Issues

<!-- AI: Document issues that occur during compilation or bundling -->

### Build Fails with Type Errors

<!-- AI: For typed languages (TypeScript, Rust, Go, etc.) -->

**Symptom**: Compilation fails with type-related errors

**Common Causes**:
- Missing type definitions
- Outdated dependencies
- Incorrect configuration

**Solutions**:
1. Ensure all dependencies are installed
2. Check for `@types/*` packages (TypeScript)
3. Verify configuration matches project requirements
4. Run type-check separately: <!-- AI: Add command for your stack -->

---

### Build Succeeds but Output is Wrong

**Symptom**: Build completes but application doesn't work correctly

**Common Causes**:
- Stale build artifacts
- Incorrect build configuration
- Environment variable issues

**Solution**:
1. Clean build artifacts: <!-- AI: Add clean command for your stack -->
2. Rebuild from scratch
3. Verify environment variables are set correctly
4. Check build configuration for the correct target/mode

---

## Development Server Issues

<!-- AI: Document issues with local development -->

### Dev Server Won't Start

**Symptom**: Development server fails to start or crashes immediately

**Common Causes**:
- Port already in use
- Missing environment variables
- Configuration errors

**Solutions**:
1. Check if port is in use:
   - Windows: `netstat -ano | findstr :[PORT]`
   - Unix: `lsof -i :[PORT]`
2. Kill the process using the port or use a different port
3. Verify all required environment variables are set
4. Check server logs for specific errors

---

### Hot Reload Not Working

**Symptom**: Changes to code don't appear in the running application

**Common Causes**:
- File not saved
- File outside watch scope
- Watcher limit reached (Linux)
- Caching issues

**Solutions**:
1. Ensure file is saved
2. Check that file is in watched directory
3. Linux: Increase file watcher limit
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```
4. Restart development server
5. Clear browser cache (for web apps)

---

### Module/Import Resolution Errors

**Symptom**: Imports fail to resolve despite files existing

**Common Errors**:
```
<!-- AI: Add import errors for your stack, e.g.:
Cannot find module '@/components/...'
ModuleNotFoundError: No module named '...'
package ... is not in GOROOT
-->
```

**Solutions**:
1. Verify path aliases match configuration
2. Check case sensitivity (especially cross-platform)
3. Ensure the module is exported correctly
4. Restart the development server or IDE

---

## Runtime Issues

<!-- AI: Document issues that occur when the application is running -->

### Application Crashes on Startup

**Symptom**: Application starts but immediately crashes or shows blank screen

**Debugging Steps**:
1. Check console/terminal for error messages
2. Look for uncaught exceptions in logs
3. Verify required services are running (database, API, etc.)
4. Check environment configuration

**Common Causes**:
- Missing environment variables
- Failed network requests
- Unhandled initialization errors
- Resource not found

---

### API/Network Errors

**Symptom**: Network requests fail or return unexpected results

**Common Errors**:
```
<!-- AI: Add network errors relevant to your app:
CORS error
401 Unauthorized
Connection refused
Timeout
-->
```

**Debugging Steps**:
1. Check network tab in browser dev tools
2. Verify API endpoint is correct
3. Check authentication credentials
4. Verify backend service is running
5. Check for CORS configuration issues

---

### State/Data Issues

**Symptom**: Data appears incorrect, stale, or inconsistent

**Common Causes**:
- Caching problems
- Race conditions
- Stale state after updates
- Incorrect data transformations

**Solutions**:
1. Clear application cache/storage
2. Check for proper state updates after mutations
3. Verify data flow from source to display
4. Add logging to trace data transformations

---

## Performance Issues

<!-- AI: Document performance-related problems -->

### Slow Startup Time

**Symptom**: Application takes too long to start

**Debugging Steps**:
1. Profile startup with appropriate tools
2. Check for synchronous blocking operations
3. Review initialization order
4. Look for unnecessary early loading

**Common Causes**:
- Large bundle size
- Synchronous file reads
- Blocking network requests during init
- Too many dependencies loaded at startup

---

### High Memory Usage

**Symptom**: Application consumes excessive memory

**Debugging Steps**:
1. Use memory profiler to identify leaks
2. Check for retained references
3. Monitor memory over time
4. Look for growing collections

**Common Causes**:
- Memory leaks (event listeners, closures)
- Large data structures held in memory
- Missing cleanup on component unmount
- Circular references preventing garbage collection

---

### Slow Response/Rendering

**Symptom**: UI feels sluggish or operations take too long

**Debugging Steps**:
1. Profile the slow operation
2. Check for expensive computations
3. Look for unnecessary re-renders (UI frameworks)
4. Verify efficient data access patterns

**Solutions**:
- Memoize expensive calculations
- Implement pagination for large lists
- Add loading states for async operations
- Optimize database queries

---

## Platform-Specific Issues

<!-- AI: Document issues that only occur on specific platforms -->

### Windows-Specific

<!-- AI: Add Windows-specific issues as discovered -->

**Common Issues**:
- Path length limits (> 260 characters)
- Line ending differences (CRLF vs LF)
- Case-insensitive filesystem confusion
- Antivirus blocking file operations

---

### macOS-Specific

<!-- AI: Add macOS-specific issues as discovered -->

**Common Issues**:
- Gatekeeper blocking unsigned apps
- Keychain permission prompts
- Xcode command line tools not installed

---

### Linux-Specific

<!-- AI: Add Linux-specific issues as discovered -->

**Common Issues**:
- File watcher limits
- Missing system libraries
- Permission issues
- Display server compatibility (X11/Wayland)

---

## Useful Debug Commands

<!-- AI: Add commonly used debug commands for your stack -->

```bash
# Clean rebuild (customize for your stack)
# rm -rf [build-artifacts] && [install-command] && [build-command]

# Check for outdated dependencies
# [package-manager] outdated

# Verify installation
# [runtime] --version
# [package-manager] --version

# Check for type errors (if applicable)
# [type-check-command]

# Run in verbose/debug mode
# [debug-command]
```

---

## Getting Help

If the issue isn't covered here:

1. **Search existing issues**: Check the project's issue tracker
2. **Check documentation**: Review relevant docs for configuration details
3. **Reproduce minimally**: Create a minimal reproduction case
4. **Gather information**: Collect error messages, logs, environment details
5. **Ask for help**: Open an issue or ask in team channels with gathered info

<!-- AI: Add links to:
- Project issue tracker
- Team communication channels
- Stack-specific community resources -->

---

## Related Documents

| Document | Relationship |
|----------|--------------|
| [00. Project Setup](../planning/00-project-setup.md) | Installation and setup instructions |
| [10. Error Handling](../planning/10-error-handling.md) | Error handling patterns |
| [Tech Decisions](./tech-decisions.md) | Technology context for issues |
| [21. Monitoring](../planning/21-monitoring-observability.md) | Logging and observability |

---

## AI Agent Instructions

When working with this troubleshooting document:

1. **Adding New Issues**
   - Use the issue template consistently
   - Include exact error messages when possible
   - Provide step-by-step solutions
   - Test solutions before documenting

2. **Organizing Issues**
   - Place in appropriate category (Environment, Build, Runtime, Performance)
   - Add platform-specific issues to that section
   - Keep related issues grouped together

3. **Maintaining Quality**
   - Remove outdated issues (fixed in codebase)
   - Update solutions when better approaches are found
   - Add prevention tips where applicable
   - Link to relevant documentation

### Quality Checklist
- [ ] All known recurring issues documented
- [ ] Solutions are actionable and tested
- [ ] Error messages are exact (copy-paste)
- [ ] Platform-specific issues noted
- [ ] Debug commands customized for this project
- [ ] Links to help resources included
