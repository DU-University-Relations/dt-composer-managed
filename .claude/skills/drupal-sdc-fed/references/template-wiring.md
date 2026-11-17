# Template wiring (Drupal layer)

Drupal templates connect an entity's rendered output to a component. They
contain mapping, not markup.

## Shape

```
templates/node/
  node.html.twig                 # base: wrapper, attributes, contextual links, {% block content %}
  node--full.html.twig           # extends base for the full view mode
  node--event--full.html.twig    # extends node--full, overrides blocks
  node--bio--teaser.html.twig    # extends base, maps fields to a component
```

Same pattern for `paragraph`, `taxonomy-term`, `block`, and other entity templates.

### The base template owns the Drupal layer

```twig
{# node.html.twig #}
<div {{ attributes }}>
  {{ title_prefix }}
  {{ title_suffix }}

  {% block content %}
    {{ content }}
  {% endblock %}
</div>
```

- `attributes` carries Drupal's classes, `data-*`, and the `contextual-region`
  hook. `title_prefix`/`title_suffix` carry contextual links. Losing either
  breaks contextual links and module integrations.
- This wrapper is the Drupal "shell". The component renders *inside* it and
  never replaces it.
- Keep the base minimal and generic. Put shared structure in the
  view-mode-level base (`node--full`), not per bundle.

### Sub-templates extend and override only the block

```twig
{# node--bio--teaser.html.twig #}
{% extends "@theme/node/node.html.twig" %}

{% block content %}
  {% set teaser_media %}
    {% if has_content.field_headshot %}
      {{ content.field_headshot|field_value }}
    {% else %}
      {{ include('ns:placeholder', {}, with_context = false) }}
    {% endif %}
  {% endset %}

  {{ include('ns:bio-teaser', {
    heading: label,
    link: url,
    job_title: has_content.field_job_title ? content.field_job_title|field_value,
    media: teaser_media,
  }, with_context = false) }}

  {% do content|render %}
{% endblock %}
```

- Never copy the base wrapper into a sub-template. If a template does not
  extend a base, it will drift (missing `title_prefix`, wrong `attributes`).
- Extend the most specific parent that already does what you need
  (`node--event--full` extends `node--full`), overriding only the blocks that
  differ.

## `include` with `with_context = false`

Always render components with isolation:

```twig
{{ include('ns:component', { ...props, ...slots }, with_context = false) }}
```

Without `with_context = false`, every template variable (`content`, `node`,
`attributes`, `label`...) leaks into the component. Components then silently
depend on them and break elsewhere. Props and slots are passed in the same
hash; the component decides which is which.

Don't pass Drupal's `attributes` into a component. The base template already
owns it. Pass a separate `attributes` hash only to add classes/attributes to
the component's root.

## Field → prop/slot mapping

- Map in the template, name by design role: `media: content.field_primary_media|field_value`.
- Use the field-value filter the project provides (e.g. Twig Field Value's
  `|field_value`) to pass raw values to props; pass `content.field_x` renderables
  to slots when formatter output is wanted.
- Compute presentational values (formatted dates, labels) here or in preprocess;
  don't push Drupal APIs into the component.
- Conditionals on optional values belong here: pass nothing rather than an
  empty string, so the component's `{% if slot %}` guards work.
- Build a slot from several pieces with `{% set x %}...{% endset %}`, as
  above, and pass `x`.
- Larger logic (queries, access checks, multi-entity lookups) goes in a
  preprocess hook, not Twig.

## `has_content`

A map of `field_name => bool` for "exists and has a value", typically built in a
`preprocess_node`/`paragraph`/`taxonomy_term` hook in a custom module.

- **It is a project convention, not Drupal core.** Check whether the project
  provides it before using it, and which entity types it covers. It may be
  absent in some templates.
- If present, prefer it for optional prop/slot checks:
  `{% if has_content.field_summary %}`.
- If absent, use `{% if content.field_x|render|trim %}` or the field-value
  filter's output. Don't invent `has_content` in templates.
- Extra fields (e.g. `entity_extra_field`) often report empty in such maps even
  if they render. Check the project's implementation and use `content.name` for them.
- If the project wants it and doesn't have it, offer a preprocess hook that
  loops `Element::children($variables['content'])` and calls the entity's field
  check, rather than writing ad hoc checks in many templates.

## Leftover `content`

After mapping fields, anything left in `content` has not been rendered. Choose
one deliberately:

| Intent | Use |
|--------|-----|
| Discard what's left but keep render cache metadata | `{% do content|render %}` |
| Print what's left (e.g. admin extras, modules adding fields) | `{{ content|without('field_a', 'field_b') }}` listing every mapped field |

`{% do content|render %}` marks it rendered. Skipping this loses cache tags and
attachments from fields you read via `|field_value`. When you print the rest with
`without()`, list *every* field already mapped or it renders twice.

## Don't

- Don't render markup in templates that belongs in a component.
- Don't pass `content`, entities, or `node` into a component.
- Don't copy the base wrapper into a sub-template.
- Don't build one-off Twig blobs inside many templates. If it repeats, it is a
  component.
- Don't skip `title_prefix`/`title_suffix` in a wrapper.
