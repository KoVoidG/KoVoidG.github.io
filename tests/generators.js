/**
 * fast-check generators for portfolio property-based tests.
 *
 * These produce realistic data matching the project schema from the design document.
 * Dev-only. Never referenced from index.html.
 */

import fc from 'fast-check';

// ---------------------------------------------------------------------------
// Helper arbitraries
// ---------------------------------------------------------------------------

/** Kebab-case id matching ^[a-z0-9]+(-[a-z0-9]+)*$ of 3–40 characters */
const kebabId = () =>
  fc.array(
    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'), { minLength: 1, maxLength: 8 }),
    { minLength: 1, maxLength: 5 }
  ).map((parts) => parts.join('-'))
   .filter((id) => id.length >= 3 && id.length <= 40);

/** Non-empty trimmed string within a character bound */
const nonEmptyString = (maxLength = 60) =>
  fc.string({ minLength: 1, maxLength })
    .map((s) => s.trim() || 'placeholder')
    .filter((s) => s.length > 0 && s.length <= maxLength);

/** Absolute https:// URL */
const httpsUrl = () =>
  fc.tuple(
    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'), { minLength: 3, maxLength: 20 }),
    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-/'), { minLength: 1, maxLength: 40 })
  ).map(([domain, path]) => `https://${domain}.com/${path}`);

/** Year integer in valid range */
const validYear = () => {
  const currentYear = new Date().getFullYear();
  return fc.integer({ min: 2000, max: currentYear });
};

/** Status enum */
const validStatus = () => fc.constantFrom('shipped', 'wip', 'archived');

/** Array of 3–6 unique tech strings of at most 24 characters */
const techArray = () =>
  fc.uniqueArray(
    fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-+ '), { minLength: 1, maxLength: 24 })
      .map((s) => s.trim() || 'Tool')
      .filter((s) => s.length >= 1 && s.length <= 24),
    { minLength: 3, maxLength: 6, comparator: (a, b) => a === b }
  );

/** Highlights array of 2–4 items, 20–120 chars, at least one with a number */
const highlightsArray = () =>
  fc.tuple(
    // First highlight always contains a number
    fc.tuple(
      nonEmptyString(90),
      fc.integer({ min: 1, max: 9999 })
    ).map(([text, num]) => `${text} ${num}ms improvement`).map((s) => s.slice(0, 120)),
    // Remaining 1–3 highlights
    fc.array(
      nonEmptyString(100).map((s) => s.length < 20 ? s.padEnd(20, ' detail added') : s).map((s) => s.slice(0, 120)),
      { minLength: 1, maxLength: 3 }
    )
  ).map(([first, rest]) => [first, ...rest])
   .filter((arr) => arr.length >= 2 && arr.length <= 4 && arr.every((h) => h.length >= 20 && h.length <= 120));

/** Links object with at least one key */
const linksObject = () =>
  fc.record({
    repo: fc.option(httpsUrl(), { nil: undefined }),
    demo: fc.option(httpsUrl(), { nil: undefined }),
    caseStudy: fc.option(httpsUrl(), { nil: undefined }),
  }).filter((links) => {
    const keys = Object.keys(links).filter((k) => links[k] !== undefined);
    return keys.length >= 1;
  }).map((links) => {
    // Remove undefined keys (omit rather than null)
    const clean = {};
    if (links.repo !== undefined) clean.repo = links.repo;
    if (links.demo !== undefined) clean.demo = links.demo;
    if (links.caseStudy !== undefined) clean.caseStudy = links.caseStudy;
    return clean;
  });

/** Image object for featured projects */
const imageObject = () =>
  fc.record({
    src: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789-'), { minLength: 3, maxLength: 30 })
      .map((name) => `assets/img/${name}.webp`),
    alt: nonEmptyString(125),
    width: fc.integer({ min: 1, max: 4000 }),
    height: fc.integer({ min: 1, max: 4000 }),
  });

// ---------------------------------------------------------------------------
// Public generators
// ---------------------------------------------------------------------------

/**
 * Generate a valid project matching the schema for the given kind.
 * @param {'featured' | 'other'} kind
 */
export function validProject(kind = 'featured') {
  if (kind === 'featured') {
    return fc.record({
      id: kebabId(),
      title: nonEmptyString(60),
      tagline: nonEmptyString(80),
      summary: fc.string({ minLength: 200, maxLength: 600 }).map((s) => {
        const trimmed = s.trim();
        if (trimmed.length < 200) return 'A'.repeat(200);
        if (trimmed.length > 600) return trimmed.slice(0, 600);
        return trimmed;
      }),
      role: nonEmptyString(60),
      year: validYear(),
      status: validStatus(),
      tech: techArray(),
      highlights: highlightsArray(),
      links: linksObject(),
      image: imageObject(),
    });
  }

  // 'other' kind — compact row, no summary/highlights/image
  return fc.record({
    id: kebabId(),
    title: nonEmptyString(60),
    tagline: nonEmptyString(80),
    year: validYear(),
    tech: techArray(),
    links: linksObject(),
    // Optional fields (may or may not be present)
  }).chain((base) =>
    fc.record({
      role: fc.option(nonEmptyString(60), { nil: undefined }),
      status: fc.option(validStatus(), { nil: undefined }),
    }).map((optionals) => {
      const result = { ...base };
      if (optionals.role !== undefined) result.role = optionals.role;
      if (optionals.status !== undefined) result.status = optionals.status;
      return result;
    })
  );
}

/**
 * Generate hostile strings containing HTML entities, script tags, unicode,
 * null bytes, and other adversarial content for XSS/injection testing.
 */
export function hostileString() {
  return fc.oneof(
    // Script injection attempts
    fc.constant('<script>alert("xss")</script>'),
    fc.constant('<img src=x onerror=alert(1)>'),
    fc.constant('<svg onload=alert(1)>'),
    fc.constant('"><script>alert(document.cookie)</script>'),
    fc.constant("'><script>alert('xss')</script>"),
    // HTML entities and encoded attacks
    fc.constant('&lt;script&gt;alert(1)&lt;/script&gt;'),
    fc.constant('&#60;script&#62;alert(1)&#60;/script&#62;'),
    fc.constant('javascript:alert(1)'),
    fc.constant('data:text/html,<script>alert(1)</script>'),
    // Unicode and special characters
    fc.constant('\u0000\u0001\u0002'),
    fc.constant('\uFEFF\u200B\u200C\u200D'),
    fc.constant('𝕳𝖊𝖑𝖑𝖔'),
    fc.constant('مرحبا'),
    fc.constant('こんにちは'),
    // Quote and delimiter abuse
    fc.constant('"; DROP TABLE projects; --'),
    fc.constant("' OR '1'='1"),
    fc.constant('`${alert(1)}`'),
    fc.constant('{{constructor.constructor("alert(1)")()}}'),
    // Whitespace and boundary
    fc.constant('   '),
    fc.constant('\t\n\r'),
    fc.constant('\x00'),
    // Mixed hostile content
    fc.tuple(
      fc.constantFrom('<', '>', '"', "'", '&', '\x00', '\n', '\t', '\\'),
      fc.string({ minLength: 1, maxLength: 50 }),
      fc.constantFrom('</script>', '</style>', '-->', ']]>', '%00')
    ).map(([prefix, middle, suffix]) => `${prefix}${middle}${suffix}`)
  );
}

/**
 * Generate arbitrary JSON values — nested objects, arrays, primitives, null.
 * Used for testing validator totality (Property 6) and degradation (Property 20).
 */
export function arbitraryJson() {
  return fc.oneof(
    { weight: 2, arbitrary: fc.constant(null) },
    { weight: 2, arbitrary: fc.constant(undefined) },
    { weight: 2, arbitrary: fc.boolean() },
    { weight: 2, arbitrary: fc.integer() },
    { weight: 2, arbitrary: fc.double() },
    { weight: 3, arbitrary: fc.string() },
    { weight: 2, arbitrary: fc.array(fc.oneof(fc.constant(null), fc.boolean(), fc.integer(), fc.string()), { maxLength: 10 }) },
    {
      weight: 3,
      arbitrary: fc.dictionary(
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.oneof(fc.constant(null), fc.boolean(), fc.integer(), fc.string(), fc.array(fc.string(), { maxLength: 3 })),
        { maxKeys: 5 }
      ),
    },
    // Deeply nested objects
    {
      weight: 1,
      arbitrary: fc.nat({ max: 5 }).chain((depth) => {
        let arb = fc.constant({ nested: true });
        for (let i = 0; i < depth; i++) {
          arb = arb.map((inner) => ({ level: i, child: inner }));
        }
        return arb;
      }),
    }
  );
}

/**
 * Generate a valid { featured: [...], other: [...] } project data object.
 * Ensures ids are unique across both arrays.
 */
export function projectData() {
  return fc.tuple(
    fc.array(validProject('featured'), { minLength: 3, maxLength: 4 }),
    fc.array(validProject('other'), { minLength: 4, maxLength: 8 })
  ).map(([featured, other]) => {
    // Ensure all ids are unique across both arrays
    const usedIds = new Set();
    const ensureUniqueId = (project, index, prefix) => {
      let id = project.id;
      if (usedIds.has(id)) {
        id = `${prefix}-${index}-${id}`.slice(0, 40);
        // Ensure the patched id also matches the pattern
        id = id.replace(/[^a-z0-9-]/g, '').replace(/^-|-$/g, '').replace(/--+/g, '-');
        if (id.length < 3) id = `${prefix}-item-${index}`;
      }
      usedIds.add(id);
      return { ...project, id };
    };

    return {
      featured: featured.map((p, i) => ensureUniqueId(p, i, 'feat')),
      other: other.map((p, i) => ensureUniqueId(p, i, 'other')),
    };
  });
}

/**
 * Generate arrays of DOM-like objects with data-reveal attributes.
 * Used for testing reveal lifecycle properties (Properties 22, 23).
 */
export function revealTargets() {
  return fc.array(
    fc.record({
      id: kebabId(),
      hasDataReveal: fc.constant(true),
      isRevealed: fc.boolean(),
    }),
    { minLength: 0, maxLength: 12 }
  ).map((targets) =>
    targets.map((t) => ({
      id: t.id,
      dataset: { reveal: '' },
      classList: {
        _classes: new Set(t.isRevealed ? ['is-revealed'] : []),
        add(cls) { this._classes.add(cls); },
        remove(cls) { this._classes.delete(cls); },
        contains(cls) { return this._classes.has(cls); },
        toggle(cls, force) {
          if (force === undefined) {
            if (this._classes.has(cls)) { this._classes.delete(cls); return false; }
            this._classes.add(cls); return true;
          }
          if (force) { this._classes.add(cls); return true; }
          this._classes.delete(cls); return false;
        },
      },
      getAttribute(name) {
        if (name === 'data-reveal') return '';
        if (name === 'id') return this.id;
        return null;
      },
    }))
  );
}

/**
 * Generate IntersectionObserver entry objects with varying ratios.
 * Used for testing nav highlighting and reveal behaviour (Properties 23, 24).
 */
export function intersectionEntries() {
  return fc.array(
    fc.record({
      intersectionRatio: fc.double({ min: 0, max: 1, noNaN: true }),
      isIntersecting: fc.boolean(),
      targetId: kebabId(),
    }),
    { minLength: 1, maxLength: 10 }
  ).map((entries) =>
    entries.map((e) => ({
      intersectionRatio: e.intersectionRatio,
      isIntersecting: e.isIntersecting,
      target: {
        id: e.targetId,
        getAttribute(name) { return name === 'id' ? e.targetId : null; },
        dataset: {},
        classList: {
          _classes: new Set(),
          add(cls) { this._classes.add(cls); },
          remove(cls) { this._classes.delete(cls); },
          contains(cls) { return this._classes.has(cls); },
        },
      },
      boundingClientRect: { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 },
      rootBounds: { top: 0, bottom: 0, left: 0, right: 0, width: 800, height: 600 },
      time: Date.now(),
    }))
  );
}
