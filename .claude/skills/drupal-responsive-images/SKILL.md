---
name: drupal-responsive-images
description: Document responsive image requirements for SDC components or implement and verify their Drupal image pipelines. Use for FED image/crop planning and handoffs, responsive image groups, image styles, media view modes, WebP derivatives, container-responsive sizing, and art direction.
---

# Drupal Responsive Images

## Outcome

Define a reusable image contract and, when requested, implement its pipeline:

Content media-reference field -> media view mode -> responsive image formatter
-> responsive image group -> image styles -> editorial crops where needed.

Use the site's Drupal version, configuration schema, development tooling, and
existing conventions. Do not copy example dimensions or breakpoints as defaults.
Do not refactor components or redesign layouts unless requested.

## Choose the workflow

The FED and Drupal teams use this same skill. Select the workflow from the task,
not the person's role. Do not automatically execute every phase.

| Workflow | Deliverable | Boundary |
|---|---|---|
| Plan/document | Image contract alongside the component documentation | No Drupal configuration, imports, or module installation |
| Implement/update | Drupal pipeline implementing the image contract | Confirm the contract against the current component before editing |
| Verify | Findings against the image contract and implemented output | Do not change implementation unless requested |

For **Plan/document**, follow steps 1-3 as applicable, save the contract using the
[image contract template](references/image-contract-template.md), and stop.
Drupal does not need to be installed or running. Read existing configuration
only when available and useful; unknown Drupal fields, bundles, and breakpoint
IDs are handoff questions, not blockers to documenting presentation requirements.
Component build checks are in scope only if requested; Drupal runtime validation
is not required for this workflow.

For **Implement/update**, locate the existing contract first. Confirm its evidence
still matches the component/CSS. Flag incomplete or conflicting requirements
rather than silently changing the contract. Complete discovery/planning gaps,
then follow steps 4-7 within the approved scope. If no contract exists, derive
one using steps 1-3 before implementing.

For **Verify**, use the contract as the acceptance baseline and follow step 7.
Report missing requirements or unavailable evidence explicitly.

Store contracts in the project's existing component documentation convention.
Create a separate document only if requested or that convention calls for one.
Clearly label required presentation behavior, proposed implementation details,
and unresolved decisions. Do not mark the pipeline implemented simply because
its contract is documented.

## Required inputs

1. **User-provided base name**, such as Teaser, Page Header, or Feature Image.
   If missing, ask before finalizing the contract or creating configuration.
   Do not invent the name.
2. Target component. For implementation, also identify the content field and
   media view mode, including any existing view mode the user wants reused.
   During planning, record unknown Drupal mappings as unresolved.
3. Design information from Figma, specifications, or existing CSS sufficient
   to determine rendered image widths, ratios, and layout transitions.
4. Supported browsers, loading priority, and any project density requirements.
   Establish these from project conventions where available; clarify consequential
   unknowns rather than guessing.

Treat existing CSS as correct unless conflicting evidence or a reported visual
bug indicates otherwise. If design sources disagree, surface the discrepancy
before changing ratios or geometry. Measurements supplement CSS when needed.

## Naming

Derive all names from the user's base name:

| Entity | Example label | Example ID |
|---|---|---|
| Responsive image group | Feature Image | `feature_image` |
| Media view mode | Feature Image | `feature_image` |
| Fixed-dimension style | Feature Image - 600x400 | `feature_image_600x400` |
| Proportional style | Feature Image - 600w | `feature_image_600w` |
| Editorial crop | Feature Image | `feature_image` |
| Art-direction crop | Feature Image - Portrait | `feature_image_portrait` |

Preserve explicitly requested view mode names and existing compatible mappings.
A view mode and group need a clear association, not necessarily identical IDs.
Add descriptive art-direction suffixes to style IDs when dimensions alone would
collide, for example `feature_image_portrait_600x400`; document the exception.

## Workflow

### 1. Discover the existing pipeline

During Plan/document, discover the component's design/CSS and rendering contract;
the Drupal-specific checks below apply only where configuration exists and is
available. Implementation requires resolving the applicable Drupal checks.

- Locate the configuration sync directory; do not assume `config/sync`.
- Read relevant media/node/paragraph displays, media templates, CSS, responsive
  image groups, styles, crop types, and theme breakpoint definitions.
- Trace which consumers share each entity before modifying it.
- Inspect image editing flows, especially default media editing and Media Library.
- Identify lazy-loading libraries or custom formatters that could change output.
- Check available image toolkit/WebP support and source-image constraints.
- Check the worktree and active-versus-exported configuration before importing.

Prefer compatible existing view modes/groups over parallel content-type-specific
pipelines. Do not change unrelated consumers merely to standardize naming.

### 2. Choose resolution switching or art direction

**Same composition, different resolutions**

Use width-descriptor `srcset` with accurate `sizes`. Typically use Drupal's
unconditional `responsive_image.viewport_sizing` mapping in the
`responsive_image` breakpoint group. Verify that this exists in the target site.
Drupal can render a single `<img>` for one unconditional source.

Include a justified width ladder in `sizes_image_styles`. Width descriptors
already support device density selection; separate 1x/2x mappings are unnecessary.

**Different compositions at breakpoints**

Use `<picture>` with viewport-conditioned sources. Each source uses its own
editorial crop and width-descriptor `srcset`/`sizes` candidates. List specific
large min-width conditions before smaller ones and include an unconditional
base source. Inspect emitted source order rather than assuming YAML order alone
determines it; breakpoint definitions/weights must be consistent.

Keep one composition and a consistent ratio within each source's candidate set,
apart from integer rounding. Different ratios/compositions belong in separate
sources. Art direction can also use distinct crops with the same ratio.

**Container-query layouts**

CSS container queries control layout; `<source media>` uses viewport media
conditions and cannot directly follow a card's container-query state.

For eligible native lazy-loaded images, prefer `sizes="auto, ...fallback hints..."`
when the supported browser matrix allows it. Supporting browsers select from the
laid-out image width. Supply conservative, valid fallback size hints for other
browsers and document potential overfetch.

Do not use `auto` indiscriminately for eager/LCP images. Provide accurate explicit
size hints for those. For true container-dependent composition changes, identify
an explicit strategy and obtain agreement before adding JavaScript or approximating
container state with viewport breakpoints.

### 3. Derive and document the image contract

Before implementation, summarize:

| Layout/state | Evidence | Image-slot width/range | Display ratio | Crop | Density target | Candidates |
|---|---|---|---|---|---|---|
| Example only | CSS/Figma reference | Measured/calculated | W:H | ID or none | Project target | Widths/dimensions |

- Calculate image-slot widths, not viewport widths. Account for grid columns,
  gaps, padding, maximum widths, sidebars, and stacked/inline transitions.
- Cover relevant minimum/maximum slots and agreed device densities, typically 2x.
- Deduplicate candidates shared by multiple states. Do not create a fixed number
  of styles per breakpoint or a largest style without evidence.
- Fixed outputs: `height = round(width * ratio_height / ratio_width)`.
- Proportional outputs: constrain width, leave height unset, disable upscaling.
- Distinguish editorial crop ratio, derivative ratio, and CSS display ratio.
  Normally align them; intentional `object-fit: cover` trimming requires a
  documented, accepted framing tradeoff.
- Identify small-source/upscaling behavior. Core scale-and-crop can upscale;
  extra derivatives cannot create source detail.
- Define fallback style, loading mode, and no-saved-crop behavior.

Use the [image contract template](references/image-contract-template.md) to
record evidence, required behavior, proposed derivative/crop mappings, open
questions, and acceptance criteria. Proposals are not approved requirements
until confirmed through the task or the project's review process.

Present assumptions for confirmation when material requirements are unknown.
If implementation is already approved and inputs are clear, proceed without an
unnecessary extra approval gate. Respect plan-only requests.

### 4. Configure crops, styles, and authoring

Use Drupal Crop and Image Widget Crop for editorial framing/art direction.

- Provide a group-associated crop type for cropped groups; use separate types
  for independently authored compositions. Scale-only groups preserving the
  original composition do not require a crop type.
- Every cropped style applies its intended crop type, then scale-and-crop to
  target dimensions, then WebP conversion last.
- Proportional styles scale first and convert to WebP last.
- Use an explicit fallback composition for images with no saved crop, commonly
  center-crop after the optional editorial crop. Verify actual module behavior.
- Add crop types to the image widget's `crop_list` and configuration dependencies
  in every relevant editing form. Preserve existing settings and crops. Do not
  invent separate crop widgets when the site uses `image_widget_crop`.
- Make required crops or source-size limits explicit decisions, especially for
  existing media. Do not block editors unexpectedly.
- Explain that file-based crops are shared across uses of that media/file, not
  independently stored per referencing node.

See [configuration examples](references/configuration-examples.md).

### 5. Wire media view modes and preserve rendering behavior

- Create/reuse the group-associated media view mode.
- Configure its image field with the `responsive_image` formatter and group.
- Point the appropriate content media-reference display at that media view mode.
- Preserve alt text, link behavior, captions where required, and unrelated fields.
- Supply intrinsic dimensions and CSS sizing that reserve the correct layout
  space. Check image wrappers, placeholders, and art-directed source dimensions.
- Lazy-load ordinary below-the-fold images. Do not automatically lazy-load likely
  LCP/hero images; preserve deliberate priority settings.
- Prefer Drupal render arrays and formatters over handcrafted derivative URLs.

Use actual field names, bundle IDs, and exported config schemas from the project.
Generate unique UUIDs for new configuration/effects, preserve existing identities
when editing, and include all module/config/theme dependencies.

### 6. Migrate safely

- Changing a crop type's aspect ratio does not reframe existing saved crops.
  Establish a review/reframing or migration approach.
- Check references before retiring old view modes, groups, styles, or crops.
- Do not delete shared legacy styles still used elsewhere.
- Import only with an understood config diff and the project's approved workflow.
  Avoid blindly importing unrelated drift or overwriting active configuration.
- Rebuild caches as needed. Use targeted derivative invalidation where necessary,
  not blanket `image:flush --all`. Verify crop edits invalidate relevant images.
- Document behavior changes, source-size guidance, and editor-facing crop names.

### 7. Verify the requirement, not just the configuration

Use the image contract as the baseline. Planning-only work ends with a documented
contract and explicit unknowns; the runtime checks here apply to an implemented
pipeline, not as prerequisites for a FED handoff.

Use the project's existing validation tooling. Respect requests for the user to
handle testing; leave exact checks and mark unverified work clearly.

- Confirm schema/import validity, dependencies, and referenced entities.
- Inspect real rendered output: `srcset`, `sizes`, `<source media>`, fallback URL,
  width/height, loading mode, and alt text. Do not assume formatter settings alone
  guarantee the intended HTML.
- Verify actual WebP content type and output dimensions, not only URL extensions.
- Test boundary widths on both sides of layout/art-direction transitions.
- Check narrow containers on wide viewports, supported browsers, and density targets.
- On fresh loads, inspect `currentSrc` and network requests against rendered width
  times device density. Browser heuristics, rounding, caching, and data-saving
  policies can affect selection; do not assert one exact URL in every browser.
- Check framing, existing images without crops, new/edited crops, small originals,
  placeholders, missing media, and image-related layout shift.
- Confirm generated assets/config are persistent and report any remaining build,
  import, migration, or validation steps.

The optional [browser inspection helper](scripts/inspect-responsive-images.js)
prints local page diagnostics. It does not change content or send data elsewhere.
It is a diagnostic aid, not a substitute for network and visual checks.
