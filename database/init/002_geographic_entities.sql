CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS geographic_entities (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL CHECK (entity_type IN (
        'country','city','sea','ocean','river','mountain','airport'
    )),
    name TEXT NOT NULL,
    name_ar TEXT,
    aliases JSONB NOT NULL DEFAULT '[]'::jsonb,
    country_code TEXT,
    admin1 TEXT,
    population BIGINT,
    elevation_m DOUBLE PRECISION,
    source_id TEXT NOT NULL,
    source_version TEXT NOT NULL,
    source_license TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    geom geometry(Geometry, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_geographic_entities_geom
    ON geographic_entities USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_geographic_entities_name_trgm
    ON geographic_entities USING GIN (lower(name) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_geographic_entities_name_ar_trgm
    ON geographic_entities USING GIN (lower(coalesce(name_ar, '')) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_geographic_entities_type
    ON geographic_entities (entity_type);

CREATE INDEX IF NOT EXISTS idx_geographic_entities_country
    ON geographic_entities (country_code);

COMMENT ON TABLE geographic_entities IS
'Canonical Phase 3 geographic entity store. Every production row must include source/version/license provenance.';
