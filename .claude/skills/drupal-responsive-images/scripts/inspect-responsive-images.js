/*
 * Paste into browser DevTools on the page being checked.
 * Narrow selector to the relevant component before running.
 * Scroll lazy images into view and wait for loading first.
 * Reports local page state only; performs no requests or mutations.
 */
(() => {
  const selector = 'img[srcset], picture img';
  const density = window.devicePixelRatio || 1;
  const rows = Array.from(document.querySelectorAll(selector)).map((image) => {
    const rect = image.getBoundingClientRect();
    const picture = image.closest('picture');
    const sources = picture ? Array.from(picture.querySelectorAll('source')) : [];
    const matchingSources = sources.filter((source) => {
      const media = source.getAttribute('media');
      return !media || window.matchMedia(media).matches;
    });
    const css = window.getComputedStyle(image);

    return {
      alt: image.getAttribute('alt'),
      complete: image.complete,
      decoded: image.complete && image.naturalWidth > 0,
      loading: image.getAttribute('loading') || 'default',
      priority: image.getAttribute('fetchpriority') || 'default',
      rendered: `${rect.width.toFixed(1)}x${rect.height.toFixed(1)}`,
      density,
      targetResourceWidth: Math.ceil(rect.width * density),
      intrinsicAttributes: `${image.getAttribute('width')}x${image.getAttribute('height')}`,
      cssAspectRatio: css.getPropertyValue('aspect-ratio'),
      objectFit: css.objectFit,
      imageSizes: image.getAttribute('sizes'),
      imageSrcset: image.getAttribute('srcset'),
      mediaMatchingSources: matchingSources.map((source) => ({
        media: source.getAttribute('media'),
        type: source.getAttribute('type'),
        sizes: source.getAttribute('sizes'),
        srcset: source.getAttribute('srcset'),
        width: source.getAttribute('width'),
        height: source.getAttribute('height'),
      })),
      currentSrc: image.currentSrc,
      fallbackSrc: image.getAttribute('src'),
    };
  });

  console.table(rows.map((row) => ({
    rendered: row.rendered,
    density: row.density,
    targetResourceWidth: row.targetResourceWidth,
    decoded: row.decoded,
    loading: row.loading,
    imageSizes: row.imageSizes,
    currentSrc: row.currentSrc,
  })));
  console.log('Full responsive-image diagnostics:', rows);
  console.info(
    'Media matches do not establish format support or the selected source. ' +
    'Use currentSrc and Network for actual selection and response dimensions/type. ' +
    'Use fresh contexts for smaller layouts; cached larger images may be retained.'
  );
  return rows;
})();
