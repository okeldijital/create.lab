-- Better Auth 1.7.3 restored the account identity model used before 1.7.0.
-- The previous AUTH-002 migration retained the temporary issuer requirement from
-- Better Auth 1.7.0-1.7.2. New credential accounts no longer populate issuer.
-- Keep the legacy column nullable for compatibility and identify accounts by
-- Better Auth's canonical providerId + accountId pair.

ALTER TABLE account
  ALTER COLUMN issuer DROP NOT NULL;

DROP INDEX IF EXISTS account_provider_identity_unique;

CREATE UNIQUE INDEX account_provider_identity_unique
  ON account (provider_id, account_id);
