CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'place_category') THEN
        CREATE TYPE place_category AS ENUM (
            'country',
            'city',
            'sea',
            'ocean',
            'river',
            'mountain',
            'airport'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS place_sources (
    source_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT,
    license TEXT NOT NULL,
    source_url TEXT NOT NULL,
    dataset_sha256 TEXT,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS places (
    id TEXT PRIMARY KEY,
    category place_category NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT,
    aliases JSONB NOT NULL DEFAULT '[]'::jsonb,
    country_code TEXT,
    region_code TEXT,
    latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
    longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
    geom geometry(Point, 4326) GENERATED ALWAYS AS (
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    ) STORED,
    source_id TEXT NOT NULL REFERENCES place_sources(source_id),
    source_record_id TEXT NOT NULL,
    source_updated_at TIMESTAMPTZ,
    quality JSONB NOT NULL DEFAULT '{}'::jsonb,
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    search_text TEXT GENERATED ALWAYS AS (
        lower(
            coalesce(name, '') || ' ' ||
            coalesce(name_ar, '') || ' ' ||
            coalesce(aliases::text, '') || ' ' ||
            coalesce(country_code, '') || ' ' ||
            coalesce(region_code, '')
        )
    ) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source_id, source_record_id)
);

CREATE TABLE IF NOT EXISTS region_packs (
    id TEXT PRIMARY KEY,
    version TEXT NOT NULL,
    title TEXT NOT NULL,
    region_code TEXT,
    generated_at TIMESTAMPTZ NOT NULL,
    manifest JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS region_pack_places (
    pack_id TEXT NOT NULL REFERENCES region_packs(id) ON DELETE CASCADE,
    place_id TEXT NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    PRIMARY KEY (pack_id, place_id)
);

CREATE INDEX IF NOT EXISTS places_geom_gix ON places USING GIST (geom);
CREATE INDEX IF NOT EXISTS places_category_idx ON places (category);
CREATE INDEX IF NOT EXISTS places_country_idx ON places (country_code);
CREATE INDEX IF NOT EXISTS places_region_idx ON places (region_code);
CREATE INDEX IF NOT EXISTS places_name_trgm_idx ON places USING GIN (lower(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS places_name_ar_trgm_idx ON places USING GIN (lower(coalesce(name_ar, '')) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS places_search_trgm_idx ON places USING GIN (search_text gin_trgm_ops);
CREATE INDEX IF NOT EXISTS region_pack_places_place_idx ON region_pack_places (place_id);
