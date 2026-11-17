# Configuration examples

These are generalized patterns, not ready-to-import configuration. Adapt field
names, entity IDs, crop ratios, widths, breakpoints, loading mode, and dependencies
to the target project. All dimensions below are illustrative.

For brevity, entity UUIDs are omitted and effect keys use placeholders. Generate
real unique UUIDs before import; never copy UUIDs from another site's exports.
Prefer exported configuration from the target Drupal version as the starting point.

## 1. Editorial crop type

`crop.type.feature_image.yml`:

```yaml
langcode: en
status: true
dependencies: {  }
label: 'Feature Image'
id: feature_image
description: 'Shared editorial framing for feature images.'
aspect_ratio: '3:2'
soft_limit_width: null
soft_limit_height: null
hard_limit_width: null
hard_limit_height: null
```

For independently framed art direction, create associated crop types such as
`feature_image_portrait` (2:3) and `feature_image_landscape` (3:2).
Do not use a focal-point crop as a substitute for independently authored frames.

## 2. Fixed-dimension style

`image.style.feature_image_600x400.yml`:

```yaml
langcode: en
status: true
dependencies:
  config:
    - crop.type.feature_image
  module:
    - crop
name: feature_image_600x400
label: 'Feature Image - 600x400'
effects:
  CROP_EFFECT_UUID:
    uuid: CROP_EFFECT_UUID
    id: crop_crop
    weight: 1
    data:
      crop_type: feature_image
      automatic_crop_provider: null
  RESIZE_EFFECT_UUID:
    uuid: RESIZE_EFFECT_UUID
    id: image_scale_and_crop
    weight: 2
    data:
      width: 600
      height: 400
      anchor: center-center
  CONVERT_EFFECT_UUID:
    uuid: CONVERT_EFFECT_UUID
    id: image_convert
    weight: 3
    data:
      extension: webp
```

Repeat with justified candidate dimensions and independent effect UUIDs.
For art direction, select the appropriate crop type in each style. The
scale-and-crop fallback can upscale small originals; do not claim otherwise.

## 3. Proportional style

`image.style.feature_image_600w.yml`:

```yaml
langcode: en
status: true
dependencies: {  }
name: feature_image_600w
label: 'Feature Image - 600w'
effects:
  SCALE_EFFECT_UUID:
    uuid: SCALE_EFFECT_UUID
    id: image_scale
    weight: 1
    data:
      width: 600
      height: null
      upscale: false
  CONVERT_EFFECT_UUID:
    uuid: CONVERT_EFFECT_UUID
    id: image_convert
    weight: 2
    data:
      extension: webp
```

For images smaller than a candidate width, verify emitted width descriptors
reflect actual derivative dimensions. Original composition is preserved, so no
crop type is needed.

## 4. Resolution switching: one unconditional mapping

Assume evidence supports 300/600/1200px candidates with one 3:2 composition.
Create all referenced styles before using this mapping.

`responsive_image.styles.feature_image.yml`:

```yaml
langcode: en
status: true
dependencies:
  config:
    - image.style.feature_image_300x200
    - image.style.feature_image_600x400
    - image.style.feature_image_1200x800
  module:
    - responsive_image
id: feature_image
label: 'Feature Image'
image_style_mappings:
  -
    image_mapping_type: sizes
    image_mapping:
      sizes: 'auto, (min-width: 640px) 600px, calc(100vw - 40px)'
      sizes_image_styles:
        - feature_image_300x200
        - feature_image_600x400
        - feature_image_1200x800
    breakpoint_id: responsive_image.viewport_sizing
    multiplier: 1x
breakpoint_group: responsive_image
fallback_image_style: feature_image_600x400
```

The example assumes native lazy loading. The fallback hints assume a maximum
600px slot and 40px total viewport gutter; replace them with actual layout math.
Use explicit hints without `auto` for eager images. A width-only group follows
the same mapping pattern with `feature_image_300w`, etc.

Expected shape (URLs abbreviated):

```html
<img loading="lazy"
     src="feature-600.webp"
     srcset="feature-300.webp 300w, feature-600.webp 600w, feature-1200.webp 1200w"
     sizes="auto, (min-width: 640px) 600px, calc(100vw - 40px)"
     width="600" height="400" alt="Descriptive alternative text">
```

Drupal can emit this `<img>` without `<picture>` when the sole source has no media
condition. Verify actual output on the target version.

## 5. Art direction: separate sources and crops

Example `example_theme.breakpoints.yml` additions:

```yaml
example_theme.feature_image_base:
  label: 'Feature Image - Base'
  mediaQuery: ''
  weight: 0
  multipliers:
    - 1x
example_theme.feature_image_wide:
  label: 'Feature Image - Wide'
  mediaQuery: '(min-width: 900px)'
  weight: 1
  multipliers:
    - 1x
```

Verify the discovered breakpoint group ID in the target site. Here it is
`example_theme`. Do not replace unrelated theme breakpoints.

Alternative `responsive_image.styles.feature_image.yml`:

```yaml
langcode: en
status: true
dependencies:
  config:
    - image.style.feature_image_400x600
    - image.style.feature_image_800x1200
    - image.style.feature_image_900x600
    - image.style.feature_image_1800x1200
  theme:
    - example_theme
id: feature_image
label: 'Feature Image'
image_style_mappings:
  -
    image_mapping_type: sizes
    image_mapping:
      sizes: '900px'
      sizes_image_styles:
        - feature_image_900x600
        - feature_image_1800x1200
    breakpoint_id: example_theme.feature_image_wide
    multiplier: 1x
  -
    image_mapping_type: sizes
    image_mapping:
      sizes: '(min-width: 440px) 400px, calc(100vw - 40px)'
      sizes_image_styles:
        - feature_image_400x600
        - feature_image_800x1200
    breakpoint_id: example_theme.feature_image_base
    multiplier: 1x
breakpoint_group: example_theme
fallback_image_style: feature_image_400x600
```

The 400x600/800x1200 styles apply `feature_image_portrait`; the
900x600/1800x1200 styles apply `feature_image_landscape`. Each candidate set
covers illustrative 1x/2x slots without density mappings. These explicit size
hints also work for eager images but must match the actual layout.

Inspect `<picture>` output: wide source before the unconditional portrait
source, each with its own `sizes`, `srcset`, and appropriate dimensions. Do not
let a global CSS aspect ratio or fallback dimensions force the portrait shape
on the landscape source. Reserve the intended space for each viewport state.

## 6. Media view mode and display

`core.entity_view_mode.media.feature_image.yml`:

```yaml
langcode: en
status: true
dependencies:
  module:
    - media
id: media.feature_image
label: 'Feature Image'
description: 'Images rendered through the Feature Image responsive image group.'
targetEntityType: media
cache: true
```

Create `core.entity_view_display.media.image.feature_image.yml` from an existing
image media display. Set `id: media.image.feature_image`, `mode: feature_image`,
`targetEntityType: media`, and the actual image-media `bundle`.

Merge the relevant dependencies and field fragment:

```yaml
dependencies:
  config:
    - core.entity_view_mode.media.feature_image
    - field.field.media.image.field_media_image
    - media.type.image
    - responsive_image.styles.feature_image
  module:
    - responsive_image
content:
  field_media_image:
    type: responsive_image
    label: hidden
    settings:
      responsive_image_style: feature_image
      image_link: ''
      image_loading:
        attribute: lazy
    third_party_settings: {  }
    weight: 0
    region: content
```

This is a fragment, not a full display. Preserve other required dependencies,
hidden-field settings, translations, and project-specific formatter settings.
For likely LCP images, use the project's deliberate eager-loading configuration
instead and ensure `sizes` does not rely on lazy-only auto sizing.

In the consuming node/paragraph display, point its media-reference field at:

```yaml
settings:
  view_mode: feature_image
  link: false
```

Preserve the formatter and other settings, and include the view mode dependency
where appropriate for the exported configuration.

## 7. Crop authoring widget

Update the actual media image field's widget in each relevant form display.
When using Image Widget Crop, merge into its existing settings:

```yaml
dependencies:
  config:
    - crop.type.feature_image
  module:
    - image_widget_crop
content:
  field_media_image:
    type: image_widget_crop
    settings:
      crop_list:
        - feature_image
      crop_types_required: {  }
      warn_multiple_usages: true
```

Do not replace the complete form with this fragment. Retain all other crop
types, preview settings, field weights, regions, and dependencies. For art
direction, add both associated crop types instead. If the current widget is not
crop-enabled, follow the installed module's configuration schema to configure it.

## 8. Operational commands

Use the project's existing Drush launcher (`drush`, `vendor/bin/drush`, a local
environment wrapper, etc.). These examples assume a `drush` executable.

```bash
# Review pending changes before deciding whether a full import is safe.
drush config:status

# Only with approval for all pending changes in this environment:
drush config:import
drush cache:rebuild

# Generate a real UUID when preparing new config/effects.
drush php:eval 'echo \Drupal::service("uuid")->generate(), PHP_EOL;'

# If existing derivatives need invalidating, target only the affected style.
# Check the installed command's help/options first.
drush help image:flush
drush image:flush feature_image_600x400
```

Do not run commands against shared or remote environments without authorization.
New styles normally generate derivatives on demand; blanket flushes are not
required. Reframing existing crops is a separate editorial/migration task.
