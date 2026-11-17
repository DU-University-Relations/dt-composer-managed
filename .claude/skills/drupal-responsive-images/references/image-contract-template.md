# Image contract template

Use the sections relevant to the task in the component's existing documentation.
This is a handoff structure, not a requirement to create a separate file.
Replace placeholders with evidence-backed values; mark unknowns explicitly.
Do not copy example dimensions from configuration examples as design requirements.

## Identity and scope

- **User-provided base name:** ...
- **Component and variants:** ...
- **Status:** Draft / agreed / implemented / verified, with any qualifications.
- **Evidence:** Figma frame/specification and/or CSS file/symbol references.
- **Existing consumers:** ...
- **Workflow scope:** Planning only / implementation / verification.

## Required presentation behavior

These are component requirements. Keep them separate from proposed Drupal entity
names or a candidate derivative ladder.

| Layout/state | Trigger and query type | Image-slot width/range and calculation | Display ratio | Framing behavior |
|---|---|---|---|---|
| ... | Container or viewport; threshold and measured element | Account for columns, gaps, padding, maximum width | W:H or proportional | Full composition or intentional cover trim |

- **Composition selection:** Resolution switching / art direction; explain why.
- **Editorial crops:** Names, aspect ratios, and independent framing requirements.
  State "none: preserve original composition" for scale-only images.
- **Crop versus display ratio:** Any deliberate trimming, its position, and the
  accepted impact on author framing.
- **Loading:** Lazy or eager; expected LCP relevance and priority requirements.
- **Layout reservation:** Intrinsic/source dimensions and CSS ratio/sizing strategy.
- **Fallback behavior:** Missing media, placeholder geometry, and no-saved-crop case.
- **Accessibility:** Alt-text source and link/decorative-image behavior.
- **Browser and density targets:** Agreed project requirements.

## Proposed implementation mapping

Mark this section as proposed until agreed. Unknown Drupal details do not prevent
a FED planning handoff; the implementing team resolves them before configuration
is created.

| Item | Proposed value | Confirmed or unresolved |
|---|---|---|
| Responsive image group label/ID | Derived from user-provided name | ... |
| Media view mode label/ID | Same presentation association; preserve requested names | ... |
| Media bundle and image field | ... | ... |
| Consuming entity display/media-reference field | ... | ... |
| Crop type(s) and ratios | Associated with group and each composition | ... |
| Source conditions | Actual viewport conditions, or unconditional | ... |
| Container behavior | How sizing works without treating container state as viewport state | ... |
| `sizes` strategy | Explicit hints or eligible lazy `auto` plus fallbacks | ... |
| Fallback derivative | ... | ... |

### Derivative coverage

| Composition/crop | Width or dimensions | Style label/ID | Slot/density coverage and evidence |
|---|---|---|---|
| ... | ... | Group-prefixed fixed or width-only name | ... |

- Explain rounding, deduplication, and maximum candidate width.
- All derivatives convert to WebP after resizing/cropping.
- Document expected source-image sizes and upscaling constraints.
- For art direction, associate each source with the correct independently
  editable crop and its own resolution candidates.

## Authoring and migration

- Editing flows that must expose the crop(s).
- Optional/required crop policy and behavior for existing media.
- Shared media/file crop implications.
- Existing crop-coordinate review if ratios change.
- Existing groups/styles/consumers requiring preservation or migration.
- Derivative invalidation considerations, if applicable.

## Open questions and decisions

| Question | Impact | Resolution needed before |
|---|---|---|
| ... | ... | Contract agreement / Drupal implementation / verification |

## Acceptance criteria and handoff

- FED: Ratios, query states, slot-width calculations, placeholders, and trimming
  behavior documented consistently with the component.
- Drupal: Media view mode/group/style/crop chain matches this contract and is
  available in the agreed authoring flows.
- Output: Real `srcset`/`sizes`/sources, fallback, dimensions, and loading behavior
  match the intended strategy.
- Coverage: Boundary widths, narrow containers on wide viewports, agreed densities,
  and supported browsers checked.
- Behavior: Framing, absent crops, crop edits/invalidation, small sources, alt
  text, and layout reservation checked.
- **Performed checks:** ...
- **Deferred checks and responsible team/next step:** ...

For planning-only delivery, Drupal and runtime criteria remain future acceptance
checks, not completed verification. Do not require a live Drupal site to finish
the image contract.
