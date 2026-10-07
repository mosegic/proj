# SaaS Security Review

**Review date:** 2026-10-06  
**Status:** Initial findings remediated in commit `623cc7a` (`Harden SaaS
security paths`). Additional findings are addressed in the current changes.

This review identified the following application security issues. The listed
remediations have been implemented.

## Findings

### HIGH — Case-variant email could gain admin access

**Affected areas:** `src/app/api/auth/register/route.ts`,
`src/app/api/auth/login/route.ts`, `src/lib/admin.ts`

Account registration previously stored the submitted email unchanged, while
admin authorization compared addresses case-insensitively. Since the database
uniqueness check was case-sensitive, an attacker could register a case variant
of the configured admin email and have that account match the admin check.

**Remediation:** Registration, login, and password-reset email inputs are
trimmed and normalized to lowercase. Admin authorization now accepts only
canonicalized session email values.

### HIGH — Public registration could claim the configured admin address

**Affected areas:** `src/app/api/auth/register/route.ts`,
`src/lib/admin.ts`

Public registration previously allowed creating an account using the configured
admin email without verifying ownership. Since admin access is granted based
on the session email, an attacker could claim the address if the admin account
had not yet been provisioned.

**Remediation:** Public registration rejects the configured admin email.
Provision the admin account through a trusted administrative process.

### MEDIUM — SSRF through branded QR logo rendering

**Affected areas:** `src/app/api/qr/[tableId]/route.ts`,
`src/app/api/restaurants/route.ts`

Branded QR generation fetched a restaurant-controlled logo URL from the server.
This allowed a restaurant owner to trigger requests to internal or otherwise
untrusted hosts.

**Remediation:** QR generation no longer fetches remote URLs. It only embeds
bounded base64 PNG, JPEG, or WebP data after validating the encoding and image
signature. Remote logos are omitted from branded QR output.

### MEDIUM — Password-reset link host poisoning

**Affected area:** `src/app/api/auth/forgot-password/route.ts`

When `NEXT_PUBLIC_APP_URL` was not configured, reset links were built using the
incoming request URL. An attacker able to influence the request host could
cause a victim to receive a reset link pointing to an attacker-controlled
domain.

**Remediation:** Reset links now use only the configured canonical
`NEXT_PUBLIC_APP_URL`. The endpoint returns a configuration error when the URL
is absent or invalid, and production configuration must use HTTPS.

### MEDIUM — Password updates did not revoke existing sessions

**Affected areas:** `src/app/api/auth/reset-password/route.ts`,
`src/app/api/auth/change-password/route.ts`, `src/lib/auth.ts`

Password reset and password change previously updated only the password hash.
JWTs from other devices remained valid until expiry, allowing anyone with a
stolen session token to continue using the account after its password changed.

**Remediation:** User records now carry a session version embedded in each
session token. Password updates increment the version, and session validation
rejects tokens with a stale version. Password changes issue a replacement
session only to the device performing the change.

## Scope

This document records the findings from the SaaS security review and their
remediations; it is not a guarantee that the application is free of other
security issues.
