# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Setu Voice-to-ONDC Gateway very seriously. If you have found a security vulnerability, please help us fix it by following these steps:

1.  **Do not open a public issue.** This gives potential attackers a heads-up before we can fix the problem.
2.  **Email us privately.** Send a detailed report to the maintainers (divyamohan1993, kumkum-thakur) or use the GitHub Security Advisory feature if enabled.
3.  **Provide details.** Include steps to reproduce the issue, the potential impact, and any relevant logs or code snippets.

### What to expect

*   We will acknowledge your report within 48 hours.
*   We will investigate the issue and determine its severity.
*   We will keep you updated on our progress.
*   We will release a patch as soon as possible.
*   We will publicly acknowledge your contribution (with your permission) once the vulnerability is fixed.

## Security Best Practices for Users

*   **Keep your dependencies up to date.** Run `npm audit` regularly.
*   **Use secure environment variables.** Never commit `.env` files with real API keys or passwords.
*   **Run in Docker.** Using the provided Docker setup ensures better isolation.

Thank you for helping keep our project safe!
