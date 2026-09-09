# Mathematical References — Phase 2

## GL-HIST-001 — Historical circular reconstruction
Model `gleason-historical` / `GH-0.2.0`.

Forward: `r=(90-latitude)/180`, `theta=normalized(longitude)*pi/180`, `x=r*sin(theta)`, `y=-r*cos(theta)`.

Inverse: `r=hypot(x,y)`, `latitude=90-180*r`, `longitude=atan2(x,-y)`.

Evidence: circular map/time dial/radial latitude arms are `DOCUMENTED`; the analytic formula is `DERIVED`; prime-meridian-at-top is `DISPLAY_CONVENTION`.

Source: uploaded Gleason book, Chapter XVII, PDF pp. 376–377; Figure 43 on PDF p. 429.

Limitation: normalized computation is not presented by the book as an analytic formula and is not a physical-scale claim.

## GL-LON-043 — Figure 43 historical longitude rule
`book_miles_per_degree = 60 - (2/3)*latitude_deg`.
Anchors: +90°→0, 0°→60, -90°→120. Evidence `DERIVED`. Units remain historical source terminology, not WGS84 distance.

## AE-WGS84-001 — North-polar Azimuthal Equidistant
`+proj=aeqd +lat_0=90 +lon_0=0 +datum=WGS84 +units=m +no_defs`.
Backend: pyproj 3.8.0. Client: proj4js 2.22.0. Classification `REFERENCE`; never attributed to Gleason.
