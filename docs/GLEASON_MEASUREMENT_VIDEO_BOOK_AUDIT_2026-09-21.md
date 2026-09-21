# Gleason Measurement — Book + Two-Video Audit

Date: 2026-09-21  
Status: **OWNER-APPROVED IMPLEMENTATION INPUT**  
Primary authority: Alexander Gleason, *Is the Bible From Heaven? Is the Earth a Globe?*  
Secondary comparative sources: two owner-supplied 1080p videos registered in
`data/sources/gleason-video-measurement-audit.yaml`.

## Finding

The pre-audit `gleason-native-normalized` engine is a valid derived map-plane
geometry, but NRU alone did not expose the ruler interpretation demonstrated in
the first video and did not expose the independent historical Figure 43
longitude scale.

The audit separates three identities:

1. `gleason-map-ruler-derived`
   - straight chord in GH-0.2.0 map plane;
   - native value remains NRU;
   - DERIVED calibration: 60 nautical miles per radial latitude degree, hence
     10800 derived NM per NRU;
   - not Figure 43 and not a physical-surface distance claim.

2. `gleason-historical-longitude-scale`
   - Figure 43 latitude-specific miles per longitude degree;
   - formula `60 - (2/3 * latitude_deg)`, north positive / south negative;
   - only a same-latitude longitude-span calculator unless a separately sourced
     path rule is introduced.

3. `gleason-frame-time-calculator`
   - Figures 37–38 and the 24-hour longitude/time dial;
   - 15 degrees longitude = 1 hour; 1 degree = 4 minutes time;
   - unit conversions remain calculators, not route geometry.

## Primary-source evidence

Chapter XIV states 15 degrees on the Equator is 900 miles (60 miles per degree)
and gives 28 3/4 degrees = 1725 nautical miles. This supports the radial
60-nautical-mile-per-latitude-degree calibration used by the derived ruler.

Chapter XVII Figures 37–38 state 208 English miles = 180
nautical/geographical miles and give longitude/time relations. The circular map
is described as 14 1/4 inches with a 24-hour dial and movable radiating latitude
arms.

Figure 43 states that longitude lines continue diverging south of the Equator
and gives 3 1/3 additional miles per longitude degree for each five degrees of
latitude southward (with the reverse northward), represented by the derived
formula already present in the project.

## Video 1 observations

The first video calibrates a printed ruler using radial pole-to-place distances:

- Morocco: 58.5 degrees x 60 = 3510 NM; approximately 10.7 cm gives about
  328 NM/cm.
- Georgetown: 83 degrees x 60 = 4980 NM; approximately 15 cm gives about
  332 NM/cm.
- the video averages these to approximately 330 NM/cm for that print.

Two ruler examples are retained as secondary comparative fixtures:

- Georgetown (~7 N, 58 W) to Morocco (~31.5 N, 7 W):
  11.72 cm x 330 = 3867.6 NM. GH-0.2.0 ruler calibration gives about
  3888.4 derived NM (about 0.54% difference).
- Sydney (~34 S, 150.5 E) to Kamchatka (~53 N, 157 E):
  the arithmetic shown uses 15.8 cm x 330 = 5214 NM. GH-0.2.0 gives about
  5240.3 derived NM (about 0.50% difference).

The video also displays an inconsistent 18.5 cm label for the latter example;
18.5 x 330 would equal 6105 NM. The project preserves this discrepancy rather
than choosing it silently.

## Video 2 rejection case

The second video uses Sydney 151 E to Perth 115 E:

`36 degrees x 60 = 2160 NM`.

That shortcut is not imported as a general historical rule. Figure 43 at
roughly 33 S gives approximately 82 historical book miles per longitude degree,
so the same-latitude Figure 43 calculation for 36 degrees is about 2952
historical book miles.

This is why radial latitude-degree calibration, Figure 43 longitude scale and
frame/time conversions remain separate identities.

## P6.5/P6.6 consequence

The earlier P6.6 closure is reopened on the same PR #31 by owner approval after
this source audit. Prior automated/manual evidence remains historical evidence
for the superseded contract; it does not certify the amended measurement
semantics.

P6.7A remains NOT STARTED. No tag, GitHub Release or deployment is authorized.
