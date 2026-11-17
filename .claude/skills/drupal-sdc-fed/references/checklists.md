# Checklists

## New component

- [ ] Read 2-3 existing components for local conventions
- [ ] Directory `components/<group>/<name>/` with matching file names
- [ ] `<name>.component.yml`: name, status, description, props, slots, with titles
- [ ] Props only for enums/booleans/attribute values/class modifiers/JS data;
      everything displayed is a slot
- [ ] `<name>.twig`: docblock listing props/slots; `create_attribute(attributes)`
      initialized and printed on the root element only
- [ ] Optional slots guarded with `{% if %}`; overridable regions wrapped in a
      same-name `{% block %}` and declared under `slots:`
- [ ] No `content`, entity, or field-name references
- [ ] `src/<name>.scss` (and `.js`) authored in `src/`, with the project's `@use`
      line; build run; compiled output not committed
- [ ] README if usage is not obvious

## Wiring a template

- [ ] Template extends the entity's base template and overrides only the block
- [ ] Components rendered with `include(..., with_context = false)` (or `embed ... only`)
- [ ] Fields mapped to design-role names, not field names
- [ ] Optional values omitted rather than passed empty
- [ ] `has_content` used only if the project provides it
- [ ] Leftover `content` handled: `{% do content|render %}` or
      `without(...)` listing every mapped field
- [ ] `title_prefix`/`title_suffix`/`attributes` come from the base wrapper
- [ ] Logic beyond mapping moved to preprocess

## Variant component

- [ ] Same data as the base? Extend the base and override one block
- [ ] Variant has its own yml; overridden blocks declared as slots
- [ ] Callers supply the parent's required props
- [ ] Parent and variant CSS/JS both load on a rendered page

## Review smells

- A template that does not extend its base, or reimplements the wrapper
- `include` without `with_context = false`
- Markup passed in a string prop
- A component referencing `content.*`, `node`, or a field name
- A fork of a component that differs in one region
- Leftover `content` printed twice, or never marked rendered
