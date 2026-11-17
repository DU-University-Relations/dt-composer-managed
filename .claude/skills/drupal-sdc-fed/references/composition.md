# Composition: variants via `extends` and blocks

`extends`/`block` is a Twig convention, not an SDC feature. SDC component IDs
work as template names, so it applies cleanly. Think composition: one base
component owns the structure; a variant changes only the region that differs.

## When to use what

| Need | Use |
|------|-----|
| Same structure, different look | modifier prop (`style: 'featured'`) |
| Same data, one region's markup differs | **extend the base, override a block** |
| Mostly different structure | a new component |
| Pass one-off markup into a region at the call site | `embed` with a block (see below) |

## Base component: expose regions as variable + block

Wrap each overridable slot in a block with the same name:

```twig
{# teaser.twig #}
{% set attributes = create_attribute(attributes) %}
<article {{ attributes.addClass('c-teaser') }}>
  <div class="c-teaser__media">
    {% block media %}{{ media }}{% endblock %}
  </div>
  <div class="c-teaser__body">{{ title }} {{ summary }}</div>
</article>
```

Callers still use it as a plain slot (`include('ns:teaser', { media: ... })`).
The block is only an extension point.

## Variant: extend and override the block

```twig
{# teaser-featured.twig #}
{% extends 'ns:teaser' %}

{% block media %}
  <div class="c-teaser-featured__media">
    {{ media }}
    <span class="c-teaser-featured__badge">{{ badge }}</span>
  </div>
{% endblock %}
```

```yaml
# teaser-featured.component.yml
name: Teaser Featured
slots:
  media: { title: Media }
  title: { title: Title }
  summary: { title: Summary }
props:
  type: object
  properties:
    badge: { type: string, title: Badge }
```

The caller includes `ns:teaser-featured` with the same data as `ns:teaser`, plus
anything extra. Overriding a block changes structure in that region; the rest of
the base renders unchanged. Use `{{ parent() }}` inside the block to keep the
base's markup and add to it.

## Rules and gotchas (Drupal 11.4)

- **The variant still needs its own `.component.yml`.** It is a component in its
  own right.
- **Schema validation.** If the theme enforces schemas, every `{% block %}` in a
  component's twig must be declared under `slots:` in *that component's* yml, or
  compile fails with an "unexpected slot" error. Declare any block you override.
- **Context is shared with the parent.** The parent's required props are
  validated against the same context, so the variant's callers must supply them.
  Extra variables in context are ignored by validation.
- **Assets.** Each component template attaches its own library when it displays.
  The parent displays during an `extends`, so its CSS/JS attach alongside the
  variant's. Confirm on a rendered page the first time.
- **Prop validation runs only under `assert()`**, so only in dev. Test with
  assertions on.
- A variant's CSS should add to the base (modifiers/own classes), not re-declare
  it.

## `embed` at call sites

`embed` is `include` plus block overrides, for one-off composition where the
caller needs to put custom markup inside a region:

```twig
{% embed 'ns:text-image' with { content: content } only %}
  {% block text %}{{ content.field_heading }}{{ content.field_rich_text }}{% endblock %}
  {% block image %}{{ content.field_media }}{% endblock %}
{% endembed %}
```

- Always add `only` to isolate context, as with `include`'s `with_context = false`.
  Pass in only what the blocks need.
- Blocks resolve in the embed's scope, so pass the variables they use (e.g.
  `content`) in the `with` hash.
- Prefer `include` with a slot variable. Reach for `embed` only when you must
  assemble a region from several fields in the template and `{% set x %}` would
  be clumsier. Overriding a declared block still has to be declared as a slot.
- Entity templates that use `embed` are still wrapped by the entity base
  template. Extending the base entity template and embedding inside its block is
  fine.
