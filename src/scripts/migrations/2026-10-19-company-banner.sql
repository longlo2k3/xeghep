-- Add only the homepage banner fields. The full Payload schema push currently
-- proposes dropping unrelated booking and notification data.
BEGIN;

ALTER TABLE company_settings
  ADD COLUMN IF NOT EXISTS banner_hero_image_id integer,
  ADD COLUMN IF NOT EXISTS banner_hero_title_line1 varchar,
  ADD COLUMN IF NOT EXISTS banner_hero_title_line2 varchar,
  ADD COLUMN IF NOT EXISTS banner_hero_description varchar,
  ADD COLUMN IF NOT EXISTS banner_hero_benefit1 varchar,
  ADD COLUMN IF NOT EXISTS banner_hero_benefit2 varchar,
  ADD COLUMN IF NOT EXISTS banner_hero_benefit3 varchar;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'company_settings_banner_hero_image_id_media_id_fk'
  ) THEN
    ALTER TABLE company_settings
      ADD CONSTRAINT company_settings_banner_hero_image_id_media_id_fk
      FOREIGN KEY (banner_hero_image_id) REFERENCES media(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS company_settings_banner_banner_hero_image_idx
  ON company_settings (banner_hero_image_id);

COMMIT;
