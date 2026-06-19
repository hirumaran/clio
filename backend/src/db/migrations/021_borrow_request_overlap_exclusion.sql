-- Migration 021: Make double-booking impossible by construction.
-- Adds a GiST exclusion constraint so no two 'approved' or 'active' borrow_requests
-- for the same item can have overlapping (inclusive) date ranges.
-- Mirrors the application's binary overlap check (requested_date <= end AND return_date >= start).
-- Idempotent: extension + constraint guarded with IF NOT EXISTS / catalog checks.

-- btree_gist provides the '=' operator class for integer item_id inside a GiST exclusion constraint.
CREATE EXTENSION IF NOT EXISTS btree_gist;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'borrow_requests_no_overlap'
  ) THEN
    ALTER TABLE borrow_requests
      ADD CONSTRAINT borrow_requests_no_overlap
      EXCLUDE USING gist (
        item_id WITH =,
        daterange(requested_date, return_date, '[]') WITH &&
      )
      WHERE (status IN ('approved', 'active'));
  END IF;
END $$;
