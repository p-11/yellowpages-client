# Contributing

Thanks for your interest! We welcome pull requests, issues, and feedback. Here's how you can help.

## Reporting Issues

- Open an issue on GitHub.
- Give a clear title.
- Describe the problem, steps to reproduce, and expected outcome.
- Attach code snippets or error messages when you can.

## Suggesting New Features

- Open an issue first to discuss ideas.
- Explain the use case and why it is necessary.
- We'll review and suggest next steps before you write code.

## Pull Requests

1. **Fork** the repo and **clone** your fork.

2. **Create a branch**:

```bash
git checkout -b <feature|fix|chore>/title
```

3. **Install dependencies**:

```bash
npm install
```

4. **Implement your change.**

5. **Format your code**:

```bash
npm run p:f     # Format with Prettier
```

6. **Lint your code**:

```bash
npm run l:c     # Check ESLint
npm run l:f     # Fix ESLint issues
npm run type-check  # TypeScript type checking
```

7. **Run tests and add new ones if needed**:

```bash
npm test
```

8. **Commit your changes**:

```bash
git add .
git commit -m "feat: add new feature"
```

9. **Push to your fork**:

```bash
git push origin <feature|fix|chore>/title
```

10. **Create a pull request** on GitHub against the `development` branch.

- Make sure to include a clear description of your changes and why they are necessary.
- Link to open issues that this PR addresses.

11. **Review and merge**:

- Wait for feedback from maintainers.
- Address any comments or concerns.
- Once approved, we will merge your PR.

## Code Style

- Follow TypeScript best practices and existing patterns.
- Keep components and functions small and focused.
- Write JSDoc comments for any exported functions or components.
- Use clear names and short sentences in comments.
- Follow the project's ESLint and Prettier configurations.

## Testing

- All components should have tests using Jest and React Testing Library.
- Write integration tests for critical user flows using Playwright.
- Strive for edge-case coverage.
- Test both success and error scenarios.

## Security

Please consult the [SECURITY.md](SECURITY.md) for more information on responsibly reporting security vulnerabilities.

## License

By contributing, you agree that your work will be licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for more details.
