import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GLEASON_RESTORED_RASTER,
  gleasonGeoToHistoricalRasterPixel,
  gleasonOuterDialSunTimeMinutes,
  gleasonRasterRulerSegment,
} from '../.phase1-test-build/models/gleasonHistoricalRaster.js';

test('restored raster registry preserves exact owner-upload hashes and dimensions', () => {
  assert.equal(GLEASON_RESTORED_RASTER.pdf_sha256, '26105ca1f98ec9d862eb5ab52ef94b01b8b4f642a41b678cf5fbe21cff19f327');
  assert.equal(GLEASON_RESTORED_RASTER.embedded_raster_sha256, 'dc7f96ef7a473a4db334f721ce54963474792814280cf21dd00307f4b14619b0');
  assert.equal(GLEASON_RESTORED_RASTER.width_px, 4653);
  assert.equal(GLEASON_RESTORED_RASTER.height_px, 6506);
  assert.equal(GLEASON_RESTORED_RASTER.calibration_status, 'provisional-geometric-fit');
});

test('raster transform keeps geometry and visualization identity separate', () => {
  const pole = gleasonGeoToHistoricalRasterPixel({ latitude: 90, longitude: 0 });
  assert.ok(Math.abs(pole.x_px - GLEASON_RESTORED_RASTER.center_x_px) < 1e-9);
  assert.ok(Math.abs(pole.y_px - GLEASON_RESTORED_RASTER.center_y_px) < 1e-9);

  const equatorGreenwich = gleasonGeoToHistoricalRasterPixel({ latitude: 0, longitude: 0 });
  assert.ok(equatorGreenwich.x_px > pole.x_px);
  assert.ok(Math.abs(equatorGreenwich.y_px - pole.y_px) < 1e-9);

  const equator90E = gleasonGeoToHistoricalRasterPixel({ latitude: 0, longitude: 90 });
  assert.ok(equator90E.y_px < pole.y_px);
  assert.ok(Math.abs(equator90E.x_px - pole.x_px) < 1e-9);
});

test('raster ruler is a pixel visualization tool, not a geographic distance unit', () => {
  const segment = gleasonRasterRulerSegment(
    { latitude: 0, longitude: 0 },
    { latitude: 0, longitude: 90 },
  );
  assert.ok(segment.length_px > 0);
  assert.equal(gleasonOuterDialSunTimeMinutes(15), 60);
});
