/**
 * Property 6: The validator is total and pure
 *
 * Validates: Requirements 5.7
 *
 * Verifies that `validateProject` is total (never throws for any input) and pure
 * (does not mutate its argument). The function must return a boolean for any value
 * including null, undefined, booleans, numbers, strings, functions, arrays, and
 * deeply nested objects.
 */

import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';
import { arbitraryJson } from './generators.js';
import { validateProject } from '../js/modules/projects.js';

describe('Property 6: The validator is total and pure', () => {
  it('validateProject(input, "featured") always returns a boolean and never throws', () => {
    fc.assert(
      fc.property(arbitraryJson(), (input) => {
        const result = validateProject(input, 'featured');
        expect(typeof result).toBe('boolean');
      }),
      { numRuns: 10 }
    );
  });

  it('validateProject(input, "other") always returns a boolean and never throws', () => {
    fc.assert(
      fc.property(arbitraryJson(), (input) => {
        const result = validateProject(input, 'other');
        expect(typeof result).toBe('boolean');
      }),
      { numRuns: 10 }
    );
  });

  it('never throws for arbitrary primitive and composite values', () => {
    const arbitraryValues = fc.oneof(
      fc.constant(null),
      fc.constant(undefined),
      fc.boolean(),
      fc.integer(),
      fc.double({ noNaN: true }),
      fc.string(),
      fc.constant(() => {}),
      fc.array(fc.oneof(fc.constant(null), fc.integer(), fc.string()), { maxLength: 8 }),
      // Deeply nested objects (10+ levels)
      fc.nat({ max: 3 }).chain((extra) => {
        let arb = fc.record({ value: fc.string() });
        for (let i = 0; i < 10 + extra; i++) {
          arb = arb.map((inner) => ({ level: i, child: inner }));
        }
        return arb;
      })
    );

    fc.assert(
      fc.property(
        arbitraryValues,
        fc.constantFrom('featured', 'other'),
        (input, kind) => {
          const result = validateProject(input, kind);
          expect(result === true || result === false).toBe(true);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('does not mutate the input (purity)', () => {
    fc.assert(
      fc.property(
        arbitraryJson(),
        fc.constantFrom('featured', 'other'),
        (input, kind) => {
          // Deep clone the input before calling
          const clone = structuredClone(input);

          validateProject(input, kind);

          // After the call, the input must be identical to the clone
          expect(input).toEqual(clone);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('is deterministic: calling twice with the same input produces the same result', () => {
    fc.assert(
      fc.property(
        arbitraryJson(),
        fc.constantFrom('featured', 'other'),
        (input, kind) => {
          const first = validateProject(input, kind);
          const second = validateProject(input, kind);
          expect(first).toBe(second);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('handles specific edge cases: null, undefined, empty objects, arrays, strings, numbers', () => {
    const edgeCases = [
      null,
      undefined,
      {},
      [],
      '',
      0,
      -1,
      NaN,
      Infinity,
      -Infinity,
      true,
      false,
      { id: null },
      { id: '' },
      { id: 123 },
      [1, 2, 3],
      'hello',
      42,
    ];

    for (const input of edgeCases) {
      for (const kind of ['featured', 'other']) {
        const result = validateProject(input, kind);
        expect(typeof result).toBe('boolean');
        expect(result).toBe(false);
      }
    }
  });
});
