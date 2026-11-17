# Component anatomy

## Directory structure

```
components/<group>/<name>/
  <name>.component.yml     # required: name, props, slots
  <name>.twig              # required: markup
  README.md                # optional: usage and content guidance
  src/
    <name>.scss            # optional: compiled to ../<name>.css
    <name>.js              # optional: compiled to ../<name>.js
  <name>.css               # build output, git-ignored
  <name>.js                # build output, git-ignored
```

- `<group>` is the project's own grouping (this is not an SDC requirement). Match
  existing component directories.
- The `.component.yml`, `.twig`, `.css`, and `.js` share the directory name.
  SDC auto-attaches `<name>.css` and `<name>.js` from the component root when the
  component renders. No library entry is needed.
- **Author in `src/`, never in the component root.** The build compiles
  `src/<name>.scss` and `src/<name>.js` to the component root. Compiled files are
  git-ignored and are overwritten on build. Check `.gitignore` and the build
  config (gulp/webpack/etc.) to confirm this project follows that contract.
- Every `src/*.scss` starts with the project's shared `@use` line so partials
  (variables, mixins, functions) are available. In this style of project it is
  `@use 'partials' as *;`. Copy it from an existing component; don't invent one.
  Partials must contain only variables/functions/mixins, never emitted CSS.
- Scaffold files live in `assets/` (`NAME.component.yml`, `NAME.twig`,
  `src/NAME.scss`, `src/NAME.js`). Copy into the component directory and replace
  `NAME`/`Name` everywhere. In the JS stub also swap the `project` prefix for the
  project's behavior prefix, and use the project's class prefix instead of `c-`.

## component.yml

```yaml
$schema: https://git.drupalcode.org/project/drupal/-/raw/HEAD/core/assets/schemas/v1/metadata.schema.json
name: Name
status: experimental   # experimental | stable | deprecated | obsolete
description: One sentence on what it presents.
props:
  type: object
  required: [status]   # only genuinely required props
  properties:
    status:
      type: string
      title: Status
      enum: [info, warning]
slots:
  title:
    title: Title
  media:
    title: Media
    description: What kind of markup to expect.
```

- Give every prop and slot a `title` and, when it isn't obvious, a `description`
  that says what kind of content belongs there (e.g. "Rendered media, responsive
  teaser view mode").
- Use `enum` for variants so invalid values fail validation.
- An array prop of rendered items (links, etc.) needs `items: { type: ['string', 'object'] }`
  because renderables arrive as objects/arrays. Prefer a slot unless the
  component truly loops over the items.
- `libraryOverrides.dependencies` declares extra libraries the component needs
  (e.g. a shared behavior).
- Prop validation runs inside `assert()`, so it only fires where assertions are
  enabled (dev). Do not rely on it as runtime protection in production.
- If the theme/module enforces schemas (`enforce_prop_schemas: true`, or any
  module-provided component), every `{% block %}` in the twig **must** be declared
  under `slots:` or the template fails to compile.

## Twig template

```twig
{#
/**
 * @file
 * Name component.
 *
 * Available props:
 * - status: [string] ...
 *
 * Available slots:
 * - title: ...
 * - media: ...
 */
#}
{% set attributes = create_attribute(attributes) %}

<article {{ attributes.addClass(['c-name', 'c-name--' ~ status|default('info')]) }}>
  {% block media %}{{ media }}{% endblock %}
  {% if title %}<h3 class="c-name__title">{{ title }}</h3>{% endif %}
</article>
```

- Initialize `attributes` at the top and print it on the root element only. This
  is what lets parents and Drupal modules add classes/attributes.
- The docblock lists props and slots; keep it in sync with the yml.
- Guard optional regions with `{% if slot %}` so empty slots leave no wrapper
  markup.
- Wrap a slot in `{% block slot_name %}{{ slot_name }}{% endblock %}` when it
  might be overridden by a variant (see `composition.md`). Block name = slot name.
- Don't print `{{ content }}` or reference field names.
- Don't define the component's own outer margins; layout handles that.

## README (optional but useful)

What it does, props, slots, one include example, accessibility notes. Keep
content guidance (what the editor should supply) separate from API.
