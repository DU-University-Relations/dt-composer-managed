# Props vs slots

The default is **slot**. Promote to a prop only when the value is *data the
component uses*, not *content the component displays*.

## Rule

| Use a **slot** when the value is... | Use a **prop** when the value is... |
|-------------------------------------|--------------------------------------|
| rendered media (images, video) | an enum / variant (`status`, `style`, `size`) |
| rich text / WYSIWYG | a boolean toggle |
| link or button markup | a value printed in an attribute (`href`, `datetime`, `id`, `aria-*`) |
| headings, titles, summaries, labels (even plain strings) | a value that becomes a class modifier |
| anything a field formatter produced | `data-*` values read by JS |
| markup that another component produces | a number/count used in logic |

Why slots for most strings: a string that looks plain today often needs
markup, a translation wrapper, an inline link, or a field formatter tomorrow.
Slots take whatever Drupal rendered; props are validated as plain values.

## Quick test

1. Will it be output as visible content? → slot.
2. Could it plausibly contain markup, or come from a field formatter? → slot.
3. Does the component branch on it, put it in an attribute, or add a class from
   it? → prop.
4. Is it an array of items the component loops over? → prop, but only if the
   component needs to iterate or add per-item markup. If it just prints them, a
   slot is simpler.

## Examples

| Data | Choice | Reason |
|------|--------|--------|
| `status: blue/yellow/red` | prop (enum) | drives a modifier class |
| `updated` ISO timestamp | prop | goes in `<time datetime>` |
| `updated_label` formatted date | slot or prop | display text. A slot if it may carry markup; a prop is acceptable for strictly plain formatted text |
| card `url` used for `data-href` | prop | attribute value |
| `media` | slot | rendered field |
| `title` | slot | displayed text |
| `description` | slot | rich/plain text from a field |
| `links` (render each in an `<li>`) | prop (array) | component iterates |
| `is_featured` | prop (boolean) | branches markup |

## Naming

Name for the design role (`media`, `eyebrow`, `actions`), not the Drupal field
(`field_primary_media`). One component API should serve many fields and bundles.

## Optional vs required

- Mark a prop `required` only if the component is broken without it.
- Slots are not schema-required. Handle empty ones in the twig.
- If two inputs only make sense together (`updated` + `updated_label`), say so in
  the README; the schema won't enforce it.

## Don't

- Don't pass pre-rendered HTML in a string prop. That is a slot.
- Don't use a prop for something editors may want to format.
- Don't add a prop for a one-off style tweak. Use a modifier prop with an enum,
  or compose (see `composition.md`).
- Don't mirror field structure in the API (`field_a`, `field_b`). Design the API
  first, then map fields to it in the template.
