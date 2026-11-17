---
name: drupal-sdc-fed
description: Build and wire Drupal Single Directory Components (SDC) in a theme. Use when creating or editing a component (*.component.yml, component twig, src/ Sass/JS), deciding whether data should be a prop or a slot, writing or changing node/paragraph/term/block templates that render a component, or building a variant component by extending another. Covers the boundary between the Drupal template layer and the component layer. Does not cover how to write CSS or JS.
---

# Drupal SDC / FED

Two layers, kept isolated:

| Layer | Lives in | Knows about | Never knows about |
|-------|----------|-------------|-------------------|
| **Drupal** | `templates/**` | entities, `content`, fields, view modes, contextual links, `attributes` from core | component internals |
| **Component** | `components/**/<name>/` | props, slots, its own markup/styles/behavior | entities, `content.*`, Drupal context |

Templates *wire* Drupal to components. Components render what they are given. If a
component needs to ask Drupal for something, the wiring is wrong.

## Step 0: read the project first

Before changing anything, read the theme README / AGENTS.md and look at 2-3
existing components and templates. Match local conventions for:

- component namespace (`theme:component`) and directory grouping
- CSS class prefix and Sass `@use` line (see `assets/`)
- Twig helpers in use (`field_value`, date/icon helpers, etc.)
- whether a `has_content` map exists (see `references/template-wiring.md`)
- whether the theme sets `enforce_prop_schemas: true` in its `*.info.yml`

Existing code in a project is evidence of *a* pattern, not necessarily a correct
one. Follow this skill where they disagree and don't "fix" unrelated templates
unless asked.

## Workflow

**New component** → `references/component-anatomy.md`, scaffold from `assets/`,
then `references/props-vs-slots.md` to define the API.

**Wire a Drupal template to a component** → `references/template-wiring.md`.

**Variant of an existing component** → `references/composition.md`.

**Before finishing** → `references/checklists.md`.

## Core rules

1. **Slot by default.** Anything a human reads or that is markup (media, rich
   text, links, headings, summaries, most strings) is a slot. A prop is only for
   enums/variants, booleans, values used in attributes or classes, and data for JS.
   Details in `references/props-vs-slots.md`.
2. **Components are Drupal-agnostic.** No `content`, no entities, no field
   names. Props and slots are named for what they mean in the design, not the
   field that happens to feed them.
3. **Templates are thin.** Map fields to props/slots and nothing else. Logic
   that is not presentation mapping belongs in preprocess.
4. **Isolate on include.** Render components with
   `include('ns:name', {...}, with_context = false)` so no Drupal context leaks in.
5. **Entity sub-templates extend the entity's base template.** The base owns the
   wrapper, `attributes`, and `title_prefix`/`title_suffix` (contextual links);
   sub-templates override only the block.
6. **Don't leave rendered fields behind.** Either print the leftover `content`
   deliberately or mark it rendered. Never silently drop it or print it twice.
7. **Compose with `extends`, not copies.** A variant that needs the same data
   with different structure in one region extends the base component and
   overrides a block. Don't fork the component.

## Out of scope

CSS/Sass/JS authoring practices, naming conventions (BEM etc.), field and
view-mode configuration, and Storybook. Those belong in project docs.
