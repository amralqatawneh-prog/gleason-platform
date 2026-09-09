export const gleasonSourceCatalog = {
  sourceId: 'gleason-1893-upload-v1',
  title: 'Is the Bible from Heaven? Is the Earth a Globe?',
  edition: 'Second Edition, revised and enlarged',
  sha256: '03e429285376c7fcd21659116f43a8da7d6e363169e7c7841c9b31518effbe60',
  figures: [
    { id: 'fig-30', label: 'Fig. 30', pages: 'PDF 360–361', topic: 'Illustrative spiral course of the sun', evidence: 'DOCUMENTED', note: 'The author explicitly says the construction is illustrative and makes no claim of exactness.' },
    { id: 'circular-map', label: 'Circular map / Fig. 38 context', pages: 'PDF 376–377', topic: '24-hour dial, longitude/time scale, radiating latitude arms', evidence: 'DOCUMENTED', note: 'Used as source evidence for the radial historical reconstruction.' },
    { id: 'fig-43', label: 'Fig. 43', pages: 'PDF 429', topic: 'Historical longitude-mile rule north and south of the Equator', evidence: 'DOCUMENTED', note: 'The linear rule is exposed separately and is not treated as a WGS84 distance.' },
  ],
  georeferencing: { engine: 'available', scan: 'not-embedded', note: 'No verified distributable scan of the standalone historical world map is embedded; control points are not fabricated.' },
} as const;
