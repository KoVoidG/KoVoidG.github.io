# Requirements Document

## Introduction

A single-page, statically hosted personal portfolio that presents software engineering and AI work to
recruiters, hiring managers, founders, and technical interviewers. The site is built from semantic
HTML5, modern CSS organised in cascade layers, and native ES modules, with no build step, no
framework, and no runtime dependency. It is served by GitHub Pages directly from the repository
files.

These requirements are derived from the approved design document. They cover page structure and
section order, the curated project data contract, runtime rendering of the two project lists,
graceful degradation when data or JavaScript is unavailable, navigation and reveal behaviour,
accessibility to WCAG 2.1 AA, measured performance targets, the no-build and no-framework
constraints, design-system fidelity, deployment, and security and privacy.

Accessibility and performance appear here as acceptance criteria, not aspirations. The site is itself
a work sample, so a broken keyboard path or visible layout shift is a defect of the same weight as a
rendering bug.

## Glossary

- **Portfolio_Site**: The complete deployed static site — `index.html`, `css/`, `js/`, `assets/`, and
  `data/` — served over HTTP.
- **Hero_Section**: The `<section id="hero">` region carrying the name, role, positioning line, and
  primary action.
- **Site_Header**: The sticky `<header>` element containing the primary navigation and the Resume
  call to action.
- **Primary_Nav**: The `<nav aria-label="Primary">` element and its link list inside Site_Header.
- **Resume_Section**: The `<section id="resume">` region containing the direct PDF download link.
- **Project_Data**: The contents of `data/projects.json` — an object with a `featured` array and an
  `other` array.
- **Content_Contract**: The contents of `data/profile.json` and `data/stack.json`, which are the
  authoring source of record for static copy mirrored into `index.html`.
- **Project_Renderer**: The `js/modules/projects.js` module, including `loadProjects`,
  `validateProject`, `renderCard`, `renderList`, and `initProjects`.
- **Nav_Highlighter**: The `js/modules/nav.js` module responsible for active-section highlighting.
- **Reveal_Controller**: The `js/modules/reveal.js` module responsible for scroll-triggered entrance
  states.
- **Fallback_Message**: The `[data-fallback]` paragraph in the Featured projects section that links
  to the author's GitHub repositories page.
- **Featured_Project**: An entry in `Project_Data.featured`, rendered as a full card.
- **Other_Project**: An entry in `Project_Data.other`, rendered as a compact row.
- **Reveal_Target**: Any element carrying the `data-reveal` attribute.
- **Tracked_Section**: A `<section>` whose `id` matches the fragment of a Primary_Nav link.

## Requirements

### Requirement 1: Single-page structure and canonical section order

**User Story:** As a recruiter doing a 60-second first pass, I want one continuous page in a
predictable order, so that I can find who this person is, what they build, and how to reach them
without hunting.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL serve all content from a single `index.html` document with no
   client-side router and no partial fragments, and SHALL issue zero runtime requests for any
   other HTML document.
2. THE Portfolio_Site SHALL place its nine `<section>` regions in the document order Hero,
   About, Tech stack, Featured projects, Other projects, GitHub, Education, Contact, Resume as
   direct element children of `<main>`, with Site_Header preceding `<main>` and `<footer>` as
   the last element child of `<body>`.
3. THE Portfolio_Site SHALL assign the kebab-case ids `hero`, `about`, `tech-stack`,
   `featured-projects`, `other-projects`, `github`, `education`, `contact`, and `resume` to the
   nine `<section>` elements in that same order, one id per section, each id occurring exactly
   once in the document, with no `<section>` carrying any other id.
4. THE Portfolio_Site SHALL contain exactly one `<h1>` element, placed inside Hero_Section,
   SHALL give each of the remaining eight `<section>` elements exactly one `<h2>` as its first
   heading descendant, SHALL introduce no heading whose level exceeds the preceding heading's
   level by more than one, and SHALL use no heading deeper than `<h4>`.
5. THE Primary_Nav SHALL contain exactly five section links, labelled About, Stack, Projects,
   Education, and Contact, whose `href` values are `#about`, `#tech-stack`,
   `#featured-projects`, `#education`, and `#contact` in that order, and THE Site_Header SHALL
   carry exactly one further anchor, the Resume call to action linking to `#resume`, for six
   Site_Header anchors in total.
6. THE Portfolio_Site SHALL resolve every `href` value beginning with `#` to exactly one
   element `id` present in the document, and SHALL contain no anchor whose `href` value is
   empty, `#`, or `#!`.
7. WHEN a visitor activates an in-page anchor, THE Portfolio_Site SHALL, within 1 second of
   activation, scroll the referenced section so that its heading is wholly within the viewport
   with the heading's block-start edge at or below the Site_Header's block-end edge by at least
   8px, except where the document is already at its maximum scroll offset, in which case the
   referenced section SHALL remain visible within the viewport.
8. WHEN the page is loaded with a URL fragment matching one of the nine section ids, THE
   Portfolio_Site SHALL display that section with its heading positioned by the offset rule in
   criterion 7.
9. WHERE `prefers-reduced-motion: reduce` matches, WHEN a visitor activates an in-page anchor,
   THE Portfolio_Site SHALL move to the referenced section in a single step with no animated
   scrolling, applying the same heading offset rule as criterion 7.
10. IF the URL fragment on load matches no element `id` in the document, THEN THE
    Portfolio_Site SHALL display the page from the start of Hero_Section, SHALL display every
    section heading, and SHALL present no error state.

### Requirement 2: Skim-first first impression

**User Story:** As a non-technical screener, I want role clarity and a route to the resume
immediately, so that I can decide whether to forward this candidate.

#### Acceptance Criteria

1. THE Hero_Section SHALL present the author name as the document's only `<h1>` with non-empty
   text after trimming, a role label of 1 to 40 characters, a one-line positioning statement of
   1 to 120 characters carrying no line break, and exactly one accent-filled primary action
   whose visible label names its destination and whose `href` is `#featured-projects`.
2. WHILE the visitor is at any scroll position, THE Site_Header SHALL display a Resume call to
   action linking to `#resume` that is fully visible without clipping at viewport widths of 320
   CSS pixels and above and that is reachable within the first 8 tab stops from the start of
   the document.
3. THE Portfolio_Site SHALL render exactly one accent-filled primary action in each of the four
   regions Site_Header, Hero_Section, Contact, and Resume_Section, namely the Site_Header
   Resume call to action linking to `#resume`, the Hero_Section projects action linking to
   `#featured-projects`, the Contact email action, and the Resume_Section download action, and
   SHALL render zero accent-filled actions in every other region.
4. THE Portfolio_Site SHALL present the Tech stack section as exactly five named domain groups,
   each group carrying a non-empty `<h3>` group name and exactly one `<ul>` holding 2 to 6
   label-styled tag `<li>` items, with no group left empty.
5. WHEN first paint completes at a viewport of 375 by 667 CSS pixels, THE Hero_Section SHALL
   display the `<h1>`, the role label, the positioning statement, and its primary action
   without requiring scrolling.
6. THE Hero_Section SHALL display the role label and the positioning statement in full, with no
   truncation, ellipsis, or clipping, at viewport widths from 320 to 1920 CSS pixels.
7. WHEN a visitor activates the Site_Header Resume call to action, THE Portfolio_Site SHALL
   bring the Resume_Section download link into view below the Site_Header within 1 second and
   SHALL require no further activation to reach it.

### Requirement 3: Curated project data contract

**User Story:** As a technical interviewer, I want each listed project to carry stack, role, outcome,
and a source link, so that I can assess depth before an interview.

#### Acceptance Criteria

1. THE Project_Data SHALL define a single top-level JSON object whose only keys are `featured`
   and `other`, each holding a JSON array whose every element is a JSON object.
2. THE Project_Data SHALL provide, for every Featured_Project, a value for each of `id`,
   `title`, `tagline`, `summary`, `role`, `year`, `status`, `tech`, `highlights`, `links`, and
   `image`, where `id`, `title`, `tagline`, `summary`, `role`, and `status` are strings that
   are non-empty after trimming, `year` is an integer, `tech` and `highlights` are arrays of
   strings that are non-empty after trimming, `links` and `image` are objects, and no key
   outside that named set is present.
3. THE Project_Data SHALL provide, for every Other_Project, a value for each of `id`, `title`,
   `tagline`, `year`, `tech`, and `links`, using the same value types and the same
   non-empty-after-trimming rule as a Featured_Project, SHALL omit `summary`, `highlights`, and
   `image`, SHALL treat `role` and `status` as the only permitted optional keys, and SHALL
   carry no key outside that named set.
4. THE Project_Data SHALL assign every project an `id` matching `^[a-z0-9]+(-[a-z0-9]+)*$` of 3
   to 40 characters that is unique across the `featured` and `other` arrays combined.
5. THE Project_Data SHALL provide, for every project, a `links` object whose keys are
   restricted to `repo`, `demo`, and `caseStudy`, holding at least one and at most three of
   them, where every present value is a string that begins with `https://`, contains no
   whitespace character, and is at most 2048 characters long.
6. THE Project_Data SHALL provide, for every Featured_Project, an `image` object whose `src` is
   a relative path beginning with `assets/img/` that carries no leading slash and no `..`
   segment and ends in a lowercase `.webp`, `.avif`, `.jpg`, or `.png` extension, whose `alt`
   value is non-empty after trimming, differs from `title`, and is at most 125 characters, and
   whose `width` and `height` are integers from 1 to 4000 equal to the intrinsic pixel
   dimensions of the referenced file.
7. THE Project_Data SHALL omit absent optional fields, in every project object and in every
   nested `links` and `image` object, rather than representing them as `null`, an empty string,
   an empty array, or an empty object.
8. THE Project_Data SHALL restrict every present `status` value to `shipped`, `wip`, or
   `archived`, SHALL express every `year` as an integer from 2000 to the current calendar year,
   and SHALL permit a `year` of the current calendar year plus one only where `status` is
   `wip`.
9. THE Project_Data SHALL hold 3 to 4 Featured_Projects and 4 to 8 Other_Projects, 3 to 6
   duplicate-free `tech` entries of at most 24 characters each per project, 2 to 4 `highlights`
   per Featured_Project, a `title` of at most 60 characters per project, a `tagline` of at most
   80 characters per project, a `role` of at most 60 characters where present, and a `summary`
   of 200 to 600 characters per Featured_Project.
10. THE Project_Data SHALL exist as a hand-authored static file committed to the repository and
    served unmodified, with no entry and no field value populated from the GitHub API or any
    other remote source at any time.
11. THE Project_Data SHALL name every object key in camelCase matching `^[a-z][a-zA-Z0-9]*$`,
    with no key repeated within the same object.
12. THE Project_Data SHALL be a UTF-8 encoded JSON document that parses without error and
    contains no comment and no trailing comma.
13. THE Project_Data SHALL express every `highlights` entry as a single statement of 20 to 120
    characters, and SHALL include for every Featured_Project at least one `highlights` entry
    containing a numeric measurement of an outcome.

### Requirement 4: Runtime rendering of project lists

**User Story:** As the site author, I want project content to live in JSON and render at runtime, so
that adding a project means editing one data file rather than editing markup.

#### Acceptance Criteria

1. WHEN the document has been parsed and first paint has completed, THE Project_Renderer SHALL
   issue exactly one `fetch` request per page load, within 1000 milliseconds of first paint,
   for `data/projects.json` using a relative path with no leading slash, with no retry attempt.
2. WHEN valid Project_Data is received, THE Project_Renderer SHALL render one `li.project-card`
   per valid Featured_Project into `[data-featured-list]` and one `li.other-item` per valid
   Other_Project into `[data-other-list]`, preserving each source array's order, and SHALL
   leave each container carrying no other element child, including no `[data-placeholder]`
   element.
3. THE Project_Renderer SHALL construct every rendered node by cloning `<template>` content
   with `cloneNode(true)`, assigning every text value through `textContent` and every attribute
   value through `setAttribute`, and SHALL concatenate no string into markup.
4. THE Project_Renderer SHALL build each list's nodes in a detached `DocumentFragment` and
   SHALL write to each live list container exactly once per render pass, using one
   `replaceChildren` call with that single fragment, leaving each container unmodified until
   its single write occurs.
5. WHEN a project entry omits an optional field, or carries a value for it that is empty after
   trimming, THE Project_Renderer SHALL remove the element carrying that field's hook attribute
   from the clone, leaving no element with empty text content in the rendered node.
6. THE Project_Renderer SHALL give every rendered card an accessible name by pointing its
   `aria-labelledby` at an `<h3>` with id `project-{id}-title` whose text content equals that
   project's `title` value and is non-empty after trimming.
7. THE Project_Renderer SHALL compose every rendered link's text from the project title and the
   link kind, producing exactly `View {title} source`, `Open {title} live demo`, or
   `Read the {title} case study`, ordered repo first, then demo, then case study.
8. THE Project_Renderer SHALL give every rendered anchor an `href` value equal to the
   corresponding `links` value in Project_Data, being an absolute `https://` URL that is
   neither empty nor `#`.
9. WHEN a render pass reaches any terminal state, namely every valid entry rendered, zero cards
   rendered, request failure, or unparsable response body, THE Project_Renderer SHALL set
   `aria-busy` to `"false"` on both list containers before returning.
10. WHILE a render pass is in progress, THE Project_Renderer SHALL modify no element outside
    the two list containers and SHALL leave `document.activeElement` referencing the same
    element it referenced when the pass began.
11. WHEN a render pass runs a second time with identical input, THE Project_Renderer SHALL
    leave each list container with the same element child count, the same child order, and the
    same text content as after the first pass.
12. THE Portfolio_Site SHALL keep every element `id` unique across the document after rendering
    completes, generating exactly one `project-{id}-title` id per rendered card.
13. THE Project_Renderer SHALL render one `li` per `tech` entry into that card's `[data-tech]`
    list, one `li` per `highlights` entry into its `[data-highlights]` list, and one `li` per
    present `links` entry into its `[data-links]` list, cloning that list's nested `<template>`
    once per row, to a maximum of 6 tech rows, 4 highlight rows, and 3 link rows per card.
14. IF `data/projects.json` has not delivered a complete response body within 5000 milliseconds
    of the request being issued, THEN THE Project_Renderer SHALL abort that request, leave both
    list containers with zero rendered cards, set `aria-busy` to `"false"` on both containers,
    and display the Fallback_Message.
15. WHEN the parsed Project_Data becomes available, THE Project_Renderer SHALL complete both
    list writes within 100 milliseconds and SHALL leave no timer created by that render pass
    pending.

### Requirement 5: Failure and empty-state handling

**User Story:** As a visitor on a flaky connection, I want a usable page and a route to the work even
when project data fails to load, so that a network problem does not read as an empty portfolio.

#### Acceptance Criteria

1. IF the response for `data/projects.json` carries a status outside the 200-299 range, THEN
   THE Project_Renderer SHALL remove every `[data-placeholder]` child from both list
   containers, make the Fallback_Message visible by removing its `hidden` attribute, set
   `aria-busy` to `"false"` on both list containers, leave both list containers with zero
   element children, log exactly one console error naming the file and the response status, and
   leave every other element in the document unchanged.
2. IF parsing the response body for `data/projects.json` throws, THEN THE Project_Renderer
   SHALL remove every `[data-placeholder]` child from both list containers, make the
   Fallback_Message visible by removing its `hidden` attribute, set `aria-busy` to `"false"` on
   both list containers, leave both list containers with zero element children, log exactly one
   console error naming the file, and leave every other element in the document unchanged.
3. IF `validateProject` returns `false` for a single project entry, THEN THE Project_Renderer
   SHALL omit that entry from the rendered output, log exactly one console warning naming that
   entry's `id` value or, where `id` is absent or is not a string, its zero-based index within
   its source array, and render one node per remaining valid entry into that array's list
   container.
4. IF a render pass produces zero Featured_Project cards, THEN THE Project_Renderer SHALL make
   the Fallback_Message visible by removing its `hidden` attribute, retain the Featured
   projects `<h2>` and the `aria-labelledby` reference to it, remove every `[data-placeholder]`
   child from both list containers, set `aria-busy` to `"false"` on both list containers, and
   still render one `li.other-item` per valid Other_Project.
5. IF any of `[data-featured-list]`, `[data-other-list]`, the featured card `<template>`, or
   the other item `<template>` is absent from the document, THEN THE Project_Renderer SHALL
   return before issuing any request for `data/projects.json`, SHALL add, remove, or modify
   zero elements and zero attributes, SHALL leave the Fallback_Message hidden, and SHALL log no
   console error and no console warning.
6. IF a module's `init` function throws during initialisation, THEN THE Portfolio_Site SHALL
   catch that exception, log exactly one console warning naming the module that threw, invoke
   the `init` function of every remaining module, and let no exception propagate as an uncaught
   error.
7. THE Project_Renderer SHALL return either `true` or `false` from `validateProject` for any
   input value, including `null`, `undefined`, booleans, numbers, strings, functions, arrays,
   and objects nested to at least 10 levels, without throwing, and SHALL leave the input's own
   property set, property values, and array lengths identical to their pre-call state.
8. THE Project_Renderer SHALL report a project as valid only where every required-field rule in
   Requirement 3 holds for that project's kind, namely the field set of 3.2 for a
   Featured_Project and of 3.3 for an Other_Project, the `id` pattern of 3.4, the `links` rule
   of 3.5, the `image` rule of 3.6, and the `status` and `year` rules of 3.8, and SHALL report
   the project as invalid where any required field is absent, holds a type other than the one
   specified, or is a string that is empty after trimming.
9. IF an `<img>` rendered by the Project_Renderer fails to load, THEN THE Portfolio_Site SHALL
   display that image's `alt` text inside the box reserved by the image's `width` and `height`
   attributes, SHALL retain the surrounding card and its remaining content, and SHALL issue no
   replacement image request.
10. IF the request for `data/projects.json` rejects because the network is unavailable or the
    connection drops before the body is received, THEN THE Project_Renderer SHALL remove every
    `[data-placeholder]` child from both list containers, make the Fallback_Message visible by
    removing its `hidden` attribute, set `aria-busy` to `"false"` on both list containers, log
    exactly one console error naming the file, and issue no further request for that file
    during the page load.
11. IF the parsed Project_Data is not an object holding a `featured` array and an `other`
    array, THEN THE Project_Renderer SHALL render zero cards, remove every `[data-placeholder]`
    child from both list containers, make the Fallback_Message visible by removing its `hidden`
    attribute, set `aria-busy` to `"false"` on both list containers, and log exactly one
    console error naming the file.
12. WHEN a render pass produces at least one Featured_Project card, THE Project_Renderer SHALL
    keep the `hidden` attribute present on the Fallback_Message, including on every subsequent
    render pass, so that rendered cards and the Fallback_Message are never displayed at the
    same time.

### Requirement 6: Progressive enhancement

**User Story:** As a visitor with JavaScript blocked, I want the page to read completely and the
resume to download, so that the site does not depend on scripting for its core message.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL carry the Hero, About, Tech stack, GitHub, Education, Contact,
   Resume, and Footer content — every heading, every prose paragraph, every stack tag, every
   education row, and every link of those eight regions — as static markup present in
   `index.html` as served, requiring no script execution to be present in the document.
2. WHERE JavaScript is unavailable, THE Portfolio_Site SHALL display the heading of all nine
   `<section>` elements and the complete static content of the eight regions named in criterion
   1, rendering every such element at full opacity, at its untranslated position, and free of
   clipping or overlap at a viewport width of 320px.
3. WHERE JavaScript is unavailable, WHEN a visitor activates the Resume_Section download link
   by pointer or by the Enter key, THE Resume_Section SHALL deliver `assets/resume.pdf` to the
   browser's download or inline PDF handling with no script execution.
4. WHERE JavaScript is unavailable, THE Portfolio_Site SHALL display exactly one `<noscript>`
   paragraph inside the Featured projects section, stating that project details require
   JavaScript and carrying exactly one anchor whose `href` is the author's absolute `https://`
   GitHub repositories URL, in place of project details.
5. IF `IntersectionObserver` is unavailable, THEN THE Portfolio_Site SHALL display every
   Reveal_Target at full opacity and its untranslated position before `initReveal` returns,
   SHALL construct no observer, SHALL leave zero Primary_Nav links carrying `is-active` or
   `aria-current`, and SHALL complete initialisation without throwing.
6. WHERE JavaScript is unavailable, THE Portfolio_Site SHALL leave `[data-featured-list]` and
   `[data-other-list]` with zero element children, SHALL display no loading placeholder text,
   and SHALL declare `aria-busy="false"` on both containers in `index.html`.
7. WHERE JavaScript is unavailable, WHEN a visitor activates a Primary_Nav anchor or the skip
   link, THE Portfolio_Site SHALL scroll the referenced element into view, every in-page anchor
   `href` resolving to an element `id` that exists in the document.
8. IF `js/main.js` fails to load or throws before any module initialises, THEN THE
   Portfolio_Site SHALL keep every heading and all static content of the eight regions named in
   criterion 1 visible, SHALL display every Reveal_Target at full opacity and its untranslated
   position, and SHALL keep the Resume_Section download link resolving to `assets/resume.pdf`.

### Requirement 7: Navigation position feedback

**User Story:** As a reader scrolling the page, I want the navigation to show where I am, so that I
keep my bearings on a long single page.

#### Acceptance Criteria

1. WHILE a Tracked_Section occupies the activation band — the horizontal strip covering the
   middle 10% of the viewport height, bounded 45% from the top edge and 45% from the bottom
   edge — THE Nav_Highlighter SHALL add the class `is-active` and the attribute
   `aria-current="true"` to that section's Primary_Nav link.
2. THE Nav_Highlighter SHALL keep at most one Primary_Nav link carrying `is-active` and
   `aria-current="true"` at any time, removing both the class and the attribute from the
   previously active link before applying them to the next link, including when two or more
   Tracked_Sections occupy the activation band simultaneously.
3. THE Nav_Highlighter SHALL signal the active Primary_Nav link with an accent-coloured
   underline at least 2px thick and a font weight at least 100 units heavier than an inactive
   link, so that the active link stays distinguishable when colour alone is not perceived.
4. THE Nav_Highlighter SHALL register zero `scroll` listeners and zero `resize` listeners for
   the lifetime of the page, detecting activation-band entry with exactly one
   IntersectionObserver.
5. IF an observed section has no matching Primary_Nav link, or a Primary_Nav link fragment
   matches no element in the document, THEN THE Nav_Highlighter SHALL ignore that section or
   link, retain the current active link, and continue observing the remaining Tracked_Sections
   without throwing.
6. IF `[data-nav-list]` is absent, contains no anchors, or `IntersectionObserver` is
   unavailable, THEN THE Nav_Highlighter SHALL return from initialisation without throwing and
   without adding, removing, or modifying any element, class, or attribute in the document.
7. THE Portfolio_Site SHALL keep every Primary_Nav anchor functional independently of
   Nav_Highlighter, so that with JavaScript disabled or with Nav_Highlighter removed,
   activating each of the five section links moves the viewport to the element whose `id`
   matches that link's fragment.
8. WHEN Nav_Highlighter initialisation completes and no Tracked_Section occupies the activation
   band, THE Nav_Highlighter SHALL leave every Primary_Nav link without `is-active` and without
   `aria-current`.
9. WHILE no Tracked_Section occupies the activation band and at least one Primary_Nav link has
   been activated since initialisation, THE Nav_Highlighter SHALL retain `is-active` and
   `aria-current="true"` on the most recently activated link.
10. WHEN a Tracked_Section enters the activation band, whether by user scrolling or by
    activation of a Primary_Nav link, THE Nav_Highlighter SHALL move `is-active` and
    `aria-current="true"` to that section's Primary_Nav link within 200ms of the section
    entering the band.

### Requirement 8: Scroll reveal and motion preferences

**User Story:** As a reader, I want restrained entrance animation that respects my motion settings,
so that the page feels considered rather than distracting or inaccessible.

#### Acceptance Criteria

1. WHEN a Reveal_Target reaches an intersection ratio of 0.15 or greater against the viewport,
   THE Reveal_Controller SHALL add the class `is-revealed` to that target and unobserve that
   target within the same observer callback, leaving every other attribute of that target
   unchanged.
2. THE Reveal_Controller SHALL add `is-revealed` to any single Reveal_Target at most once per
   page load, across every pass, and SHALL hold any single Reveal_Target under at most one
   observer at a time.
3. WHEN the last Reveal_Target observed by a pass has been revealed, THE Reveal_Controller
   SHALL disconnect that pass's observer and SHALL leave zero observers and zero timers
   attached.
4. WHERE `prefers-reduced-motion: reduce` matches, THE Reveal_Controller SHALL add
   `is-revealed` to every Reveal_Target synchronously before returning, SHALL construct no
   observer, and SHALL leave those targets with no running transition.
5. THE Reveal_Controller SHALL animate only the `transform` and `opacity` properties, applied
   through CSS classes rather than inline style declarations, over `--duration-base` with
   `--ease-out`, and SHALL cause no change to any Reveal_Target's layout box.
6. THE Portfolio_Site SHALL exclude the Hero_Section and every element within it from the set
   of Reveal_Targets, carrying no `data-reveal` attribute on any of those elements.
7. WHEN the project render pass resolves, THE Reveal_Controller SHALL run exactly one further
   pass rooted at the container holding the inserted cards, covering every inserted card that
   carries `data-reveal` and is not yet revealed.
8. IF no Reveal_Target exists under the given root, THEN THE Reveal_Controller SHALL return
   without adding, removing, or altering any class, attribute, or node in the document, SHALL
   construct no observer, and SHALL raise no error.
9. IF a Reveal_Target already carries `is-revealed` when a pass runs, THEN THE
   Reveal_Controller SHALL leave that target's class list unchanged and SHALL not place that
   target under observation.
10. THE Reveal_Controller SHALL keep every Reveal_Target's content present in the accessibility
    tree and its focusable descendants reachable in document tab order in both the pre-reveal
    and the revealed state.
11. WHEN a pass runs while a Reveal_Target already meets the 0.15 visibility threshold, THE
    Reveal_Controller SHALL add `is-revealed` to that target within 100 milliseconds of the
    pass starting, with no scroll input required.

### Requirement 9: Accessibility to WCAG 2.1 AA

**User Story:** As a visitor using a keyboard or a screen reader, I want a complete and visible
interaction path, so that the site is usable and its engineering reads as competent.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL provide a skip link carrying visible label text naming the main
   content as the first focusable element in DOM order, rendered outside the visible viewport
   until it receives focus, rendered wholly inside the viewport with its complete label and
   focus indicator while focused, and setting `document.activeElement` to `<main>` on
   activation.
2. THE Portfolio_Site SHALL provide exactly one `<header>`, one `<nav aria-label="Primary">`,
   one `<main>`, and one `<footer>`, SHALL place all nine `<section>` elements inside `<main>`,
   and SHALL name every `<section>` with `aria-labelledby` referencing the unique, non-empty
   `id` of that section's own heading.
3. THE Portfolio_Site SHALL display, through `:focus-visible`, a focus indicator of a 2px
   `--color-tertiary` outline at 3px offset on every focusable element, measuring at least 3:1
   against both `--color-neutral` and `--color-surface`, and SHALL suppress no focus indicator
   without replacing it with one meeting that same threshold.
4. THE Portfolio_Site SHALL match the Tab sequence to DOM order and to visual order, SHALL
   apply no `tabindex` value greater than 0 to any element, and SHALL apply `tabindex="-1"`
   only to `<main>`.
5. THE Portfolio_Site SHALL style text below 24px, and below 18.66px where bold, only with
   colour pairings measuring at least 4.5:1 against their background, using
   `--color-text-muted` for muted text and `--color-accent-text` for accent text, SHALL
   restrict `--color-secondary` to borders, rules, and icons, SHALL restrict `--color-tertiary`
   to fills, underlines, focus rings, and text at 24px or larger, and SHALL place
   `--color-on-primary` text on a `--color-tertiary` fill only at 24px or larger, or at 18.66px
   or larger where bold.
6. THE Portfolio_Site SHALL pair every colour-carried state with a non-colour signal, marking
   in-prose links with a persistent underline, the active Primary_Nav link with an underline
   and a font-weight change, and project status with visible text naming that status.
7. THE Portfolio_Site SHALL display all content without clipping, truncation, or overlap at a
   viewport width of 320px and at 200 percent browser zoom, and SHALL produce no horizontal
   document scrolling at either setting.
8. THE Portfolio_Site SHALL declare
   `<meta name="viewport" content="width=device-width, initial-scale=1">` with no
   `maximum-scale` and no `user-scalable=no`.
9. THE Portfolio_Site SHALL provide an `alt` attribute on every `<img>`, using `alt=""` for
   decorative images and, for meaningful images, text of at most 125 characters that describes
   the image content without the prefixes `image of` or `picture of`, SHALL apply
   `aria-hidden="true"` with `focusable="false"` to decorative SVG, and SHALL apply
   `role="img"` with a non-empty `<title>` as the first child to meaningful SVG.
10. THE Portfolio_Site SHALL render body text at a line height of at least 1.65, SHALL
    constrain prose blocks to at most 68 characters per line, and SHALL keep all text visible
    and non-overlapping when line height is overridden to 1.5 times the font size, letter
    spacing to 0.12 times, word spacing to 0.16 times, and paragraph spacing to 2 times the
    font size.
11. THE Portfolio_Site SHALL use `<a>` elements for navigation and `<button>` elements for
    actions, SHALL attach no click handler to a non-interactive element, and SHALL give every
    `<a>` and `<button>` a non-empty accessible name, supplying a visually hidden text label
    for any control whose visible content is an icon alone.
12. THE Portfolio_Site SHALL limit ARIA usage to `aria-labelledby` on sections and cards,
    `aria-current` on the active navigation link, `aria-busy` on the two project lists, and
    `aria-hidden` on decorative content, and SHALL apply no ARIA role that contradicts the
    native semantics of its host element.
13. WHEN a Lighthouse accessibility audit runs against the deployed page in its mobile
    configuration and in its desktop configuration, THE Portfolio_Site SHALL score 100 with
    zero failing accessibility audits in each configuration.
14. THE Portfolio_Site SHALL declare `lang="en"` on `<html>` and SHALL provide a non-empty
    `<title>` naming the author and the role.
15. WHILE a visitor traverses the document with Tab and with Shift+Tab, THE Portfolio_Site
    SHALL make every interactive control reachable within one complete pass, SHALL hold focus
    in no element, and SHALL return focus to the browser interface after the last focusable
    element.
16. WHEN a focusable element receives focus from the keyboard, THE Portfolio_Site SHALL keep
    that element and its complete focus indicator inside the viewport and unobscured by the
    sticky Site_Header.

### Requirement 10: Measured performance

**User Story:** As a visitor on a phone, I want the page to paint fast and hold still, so that
reading it takes no patience.

#### Acceptance Criteria

1. WHEN a Lighthouse mobile audit runs against the deployed site in an incognito window with
   the default mobile throttling preset and an empty cache, THE Portfolio_Site SHALL score at
   least 98 for Performance, with Largest Contentful Paint under 1.5 seconds, Cumulative Layout
   Shift under 0.01, and Interaction to Next Paint under 100 milliseconds, each taken as the
   median of three consecutive runs.
2. WHEN a Lighthouse mobile audit runs, THE Portfolio_Site SHALL report as its Largest
   Contentful Paint element a text node inside Hero_Section rendered in the display font
   family, and SHALL report no `<img>` element and no CSS background image as that element.
3. WHEN the page loads on a cold cache, THE Portfolio_Site SHALL transfer under 500KB in total
   across fewer than 20 requests, counted from navigation start until no new request has
   started for 2 seconds.
4. THE Portfolio_Site SHALL self-host at most 4 woff2 font files totalling at most 150KB on
   disk, each subset to the latin range, SHALL declare `font-display: swap` on every
   `@font-face` rule, and SHALL declare exactly two font preloads, both for families that
   render inside the initial mobile viewport.
5. THE Portfolio_Site SHALL issue zero network requests to any origin other than its own for
   the full page lifetime, including after the data fetch resolves and after any visitor
   interaction, and SHALL reference no CDN asset, analytics script, iframe, or third-party
   widget.
6. THE Portfolio_Site SHALL set `width` and `height` attributes matching the source file's
   intrinsic aspect ratio on every `<img>` before insertion into the live document, and SHALL
   reserve `min-block-size` on both project list containers from first paint so that inserting
   cards contributes no measurable layout shift.
7. THE Portfolio_Site SHALL link exactly five stylesheets directly in `<head>`, in the order
   tokens, base, layout, components, utilities, and SHALL contain zero CSS `@import` statements
   in any stylesheet.
8. THE Portfolio_Site SHALL serve every project image as WebP at 150KB or less each, with a
   `srcset` offering at least the 1x and 2x display widths and a matching `sizes` attribute,
   SHALL mark every image outside the initial viewport `loading="lazy"` and `decoding="async"`,
   and SHALL mark no image inside the initial viewport `loading="lazy"`.
9. THE Portfolio_Site SHALL observe viewport position with `IntersectionObserver` and SHALL
   register zero `scroll` event listeners, and SHALL disconnect each observer and clear each
   timer once that observer's or timer's work has completed, leaving zero attached observers
   and zero pending timers.
10. WHEN first paint has completed, THE Portfolio_Site SHALL fetch `data/projects.json`,
    keeping the file at or under 50KB and off the critical rendering path with no preload,
    prefetch, or render-blocking reference in `<head>`.
11. THE Portfolio_Site SHALL block first paint on no resource other than `index.html` and the
    five stylesheets, and SHALL load its JavaScript as a single deferred module script.
12. WHILE the network is throttled to a slow 3G profile on an empty cache, THE Portfolio_Site
    SHALL display every static section heading and its body copy without waiting on
    `data/projects.json`, and SHALL keep Cumulative Layout Shift under 0.01.
13. THE Portfolio_Site SHALL animate only the `transform` and `opacity` properties and SHALL
    leave `will-change` declared on zero elements once an animation has completed.

### Requirement 11: No-build, no-framework constraints

**User Story:** As the site author, I want the repository files to be exactly what the browser
receives, so that the project stays inspectable and demonstrates platform fundamentals.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL run from the repository files exactly as committed, with no
   bundler, transpiler, or CSS preprocessor step, containing zero build configuration file and
   zero build script, so that every file the browser requests is byte-identical to the file at
   that path in the repository.
2. THE Portfolio_Site SHALL use only HTML, CSS, and JavaScript syntax that executes natively in
   the latest two versions of Chrome, Edge, Firefox, and Safari on desktop and iOS, and SHALL
   contain zero polyfill file, zero transpiled output, and zero vendor-prefixed declaration
   that all four supported browsers accept unprefixed.
3. THE Portfolio_Site SHALL load JavaScript through exactly one `<script type="module">`
   element referencing `js/main.js`, and SHALL write every module specifier as a relative path
   with an explicit `.js` extension, with zero bare specifier and zero import map.
4. THE Portfolio_Site SHALL depend on zero third-party runtime package and SHALL load zero
   script, stylesheet, font, or image from a content delivery network or any other third-party
   origin.
5. THE Portfolio_Site SHALL organise CSS as exactly five files named `tokens.css`, `base.css`,
   `layout.css`, `components.css`, and `utilities.css`, linked as five
   `<link rel="stylesheet">` elements in `<head>` in that order, declaring
   `@layer tokens, base, layout, components, utilities;` once as the first statement of
   `tokens.css`, and using zero CSS `@import` rule.
6. THE Portfolio_Site SHALL restrict `js/main.js` to import statements, invocation of each
   imported module's `init` function, and the per-module error guard required by Requirement 5,
   holding all other behaviour in `js/modules/`, with zero DOM query, zero event listener
   registration, and zero data fetch in `js/main.js`.
7. THE Portfolio_Site SHALL expose every module in `js/modules/` through named exports only,
   with exactly one initialisation function per module whose name begins with `init`, and zero
   `export default` statement across the repository.
8. THE Portfolio_Site SHALL keep every `.html`, `.css`, and `.js` source file in the repository
   at 250 lines or fewer.
9. WHERE development tooling is installed for property checks or formatting, THE Portfolio_Site
   SHALL satisfy every criterion in this specification after that tooling's installed packages
   are deleted, and SHALL reference zero dev-tooling package from `index.html`, any CSS file,
   or any JavaScript file.
10. WHERE the site is run locally, THE Portfolio_Site SHALL be served over HTTP at
    `http://localhost:8000` by `python -m http.server 8000` run from the repository root in
    Windows `cmd`, in place of the `file://` scheme, which blocks module loading and `fetch`.
11. WHEN the page is loaded in each of the latest two versions of Chrome, Edge, Firefox, and
    Safari, THE Portfolio_Site SHALL render every section and complete module initialisation
    with zero console error, zero script syntax error, and zero unhandled promise rejection.
12. THE Portfolio_Site SHALL issue every network request made during page load to its own
    origin, with zero request to any other origin.
13. THE Portfolio_Site SHALL require no server behaviour beyond static file serving of the
    repository tree, with zero rewrite rule, zero redirect rule, and zero server-generated
    file, and SHALL include `.nojekyll` at the repository root so that GitHub Pages serves the
    committed files unmodified.

### Requirement 12: Design system fidelity

**User Story:** As a visitor forming a first impression, I want a coherent editorial visual system,
so that the presentation supports rather than undercuts the work.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL declare every colour, type size, spacing, radius, duration, and
   easing value as a custom property in `css/tokens.css`, and SHALL reference those properties
   through `var()` at every use site in `css/base.css`, `css/layout.css`, `css/components.css`,
   and `css/utilities.css`, permitting literal values outside `css/tokens.css` only for `0`,
   the `1px` hairline border width, percentage values, and the media query breakpoint values
   named in criterion 6.
2. THE Portfolio_Site SHALL use `#E6552F` as its only accent hue, exposed solely through
   `--color-tertiary` and its darker text and hover variants, SHALL declare no colour token
   outside the ink neutrals `#131210`, `#716E68`, `#5F5C57`, `#F3F0EA`, and `#FFFFFF` and that
   single accent family, and SHALL express link, active, success, and error states with ink and
   the accent rather than a second hue.
3. THE Portfolio_Site SHALL contain zero `linear-gradient`, `radial-gradient`,
   `conic-gradient`, `box-shadow`, `text-shadow`, and `drop-shadow` declarations across the
   five stylesheets in `css/`, and SHALL express every visual separation as a 1px solid
   `--color-secondary` border or rule, with `outline` permitted only for the focus indicator
   required by Requirement 9.
4. THE Portfolio_Site SHALL set the display, h1, and h2 type sizes with `clamp()` whose upper
   bounds are `5rem`, `2.5rem`, and `1.875rem` and whose lower bounds are `2.75rem`, `2rem`,
   and `1.5rem`, and SHALL produce no horizontal overflow at a viewport width of 320px.
5. THE Portfolio_Site SHALL set Fraunces for display and heading type, Inter for body and
   interface type, and JetBrains Mono for label type, SHALL declare each family with a generic
   serif, sans-serif, and monospace fallback respectively, and SHALL render labels uppercase at
   the `--text-label` size with the `--tracking-label` letter spacing.
6. THE Portfolio_Site SHALL define exactly four breakpoints, at `40em`, `48em`, `64em`, and
   `80em`, expressed as `min-width` media queries over an unprefixed mobile-first base, and
   SHALL contain no `max-width` width query and no fifth width breakpoint.
7. THE Portfolio_Site SHALL declare `color-scheme: light`, and SHALL contain no
   `prefers-color-scheme: dark` block and no dark-mode token override.
8. THE Portfolio_Site SHALL derive vertical rhythm from `--space-section` on the block-start
   and block-end padding of every `.section`, SHALL contain zero per-section padding overrides,
   and SHALL express all other spacing as one of the space tokens on the 8px base.
9. THE Portfolio_Site SHALL contain `!important` declarations only inside the
   `@media (prefers-reduced-motion: reduce)` block, and zero `!important` declarations
   elsewhere across the five stylesheets in `css/`.
10. WHEN a pointer hovers or keyboard focus reaches an accent-filled action, THE Portfolio_Site
    SHALL darken the accent fill, SHALL leave its hue and its `--color-on-primary` label colour
    unchanged, and SHALL complete the transition within `--duration-fast`.
11. THE Portfolio_Site SHALL render every primary action with a `--color-tertiary` fill, a
    `--color-on-primary` label, `--radius-md` corners, and `12px 20px` padding, every secondary
    action with a transparent fill, a 1px `--color-secondary` border, and a `--color-primary`
    label, and every card with a `--color-surface` background, `--radius-lg` corners, `24px`
    padding, and a 1px `--color-secondary` border.
12. IF a self-hosted webfont file fails to load, THEN THE Portfolio_Site SHALL render the
    affected text in that family's declared fallback at the same token size and SHALL keep
    Cumulative Layout Shift under 0.01.

### Requirement 13: Content contract for static copy

**User Story:** As the site author, I want all human-readable copy to have one authoring source, so
that content edits never require guessing which file is authoritative.

#### Acceptance Criteria

1. THE Content_Contract SHALL hold, in `data/profile.json`, the hero name, role label, and
   positioning line, the about narrative, the education entries, the contact email address and
   city, the social profile URLs, and the resume path, and SHALL hold, in `data/stack.json`,
   every technology entry assigned to exactly one named domain group, with both files parsing
   as a single JSON object and every string value non-empty after trimming.
2. THE Portfolio_Site SHALL mirror every technology entry in `data/stack.json` as exactly one
   `.tag` element inside `#tech-stack` whose trimmed text content equals that entry's name
   character-for-character, SHALL title each domain group with an `<h3>` whose trimmed text
   content equals that group's name in `data/stack.json`, and SHALL contain no `.tag` element
   inside `#tech-stack` that has no matching entry.
3. THE Portfolio_Site SHALL mirror every education entry in `data/profile.json` as exactly one
   `.education-item` whose `<h3>` trimmed text content equals that entry's `degree` value
   character-for-character and whose text content also carries that entry's institution name
   and its `startYear` and `endYear` values, and SHALL contain no `.education-item` that has no
   matching entry.
4. THE Portfolio_Site SHALL set the Resume_Section download link `href` to the `resumePath`
   value in `data/profile.json` character-for-character, where that value is a relative path
   carrying no leading slash and no scheme.
5. THE Portfolio_Site SHALL fetch `data/projects.json` at runtime and SHALL issue zero network
   requests for `data/profile.json`, `data/stack.json`, or any other file under `data/`.
6. THE Content_Contract SHALL spell every technology name identically, character-for-character
   including capitalisation, spacing, and punctuation, in `data/stack.json` and in the `tech`
   arrays of `data/projects.json`, with every `tech` entry present as an entry in
   `data/stack.json`.
7. THE Content_Contract SHALL express every education `startYear` and `endYear` as an integer
   between 2000 and the current calendar year plus 6, with every `endYear` greater than or
   equal to its `startYear`.
8. THE Content_Contract SHALL exclude street addresses and phone numbers, carrying at most one
   email address of at most 254 characters containing exactly one `@` and at most one city name
   of at most 60 characters.
9. THE Portfolio_Site SHALL contain, in `index.html`, `data/profile.json`, `data/stack.json`,
   and `data/projects.json`, zero case-insensitive occurrences of `USERNAME` or `lorem` and
   zero case-insensitive occurrences of the banned adjectives `passionate`, `cutting-edge`,
   `seamless`, `leveraged`, or `robust solution`.
10. THE Portfolio_Site SHALL set the Contact email action `href` to `mailto:` followed by the
    email address in `data/profile.json` character-for-character, and SHALL set every social
    link `href` to a social profile URL in `data/profile.json` character-for-character, with
    one link per URL and no social link whose URL is absent from `data/profile.json`.
11. THE Portfolio_Site SHALL render the hero name, role label, and positioning line and the
    about narrative as trimmed text content equal character-for-character to the corresponding
    values in `data/profile.json`.
12. THE Content_Contract SHALL hold 3 to 6 domain groups in `data/stack.json`, 3 to 8
    duplicate-free technology entries of 1 to 24 characters each per group, 1 to 3 education
    entries in `data/profile.json`, an about narrative of 200 to 600 characters, and 2 to 5
    social profile URLs, each an absolute `https://` URL.

### Requirement 14: Resume download

**User Story:** As a recruiter, I want a one-click resume download, so that I can attach it to an
internal review without extra steps.

#### Acceptance Criteria

1. THE Resume_Section SHALL provide exactly one anchor with `href="assets/resume.pdf"`, a
   `download` attribute whose value is a filename ending in `.pdf`, and
   `type="application/pdf"`, with no JavaScript click handler on the anchor or any of its
   ancestors, no generated object URL, and no `target` attribute.
2. THE Resume_Section SHALL display, within the visible text of that anchor, the format token
   `PDF`, the page count of the served file as an integer no greater than 2, and the file size
   of the served file in kilobytes, each value matching the file actually served.
3. WHERE the browser ignores the `download` attribute, as iOS Safari does, WHEN a visitor
   activates the Resume_Section download link, THE Portfolio_Site SHALL open
   `assets/resume.pdf` inline and display its first page in the browser's PDF viewer instead of
   writing the file to storage, and SHALL apply no JavaScript fallback that forces a save.
4. THE Portfolio_Site SHALL reference the resume file as the relative path `assets/resume.pdf`
   in every location that names it, with no leading slash, no `./` prefix, no URL scheme, and
   no host name.
5. WHEN a visitor activates the Resume_Section download link once with a pointer or with the
   Enter key, THE Portfolio_Site SHALL start the file transfer from that single activation,
   with no intermediate page, no confirmation step, and no new browsing context.
6. THE Portfolio_Site SHALL include a non-empty PDF file at `assets/resume.pdf` of no more than
   500KB.
7. IF `assets/resume.pdf` cannot be retrieved, THEN THE Resume_Section SHALL keep its heading
   and download link present and unmodified and SHALL perform no retry, no fallback fetch, and
   no scripted error message, leaving the browser's own failure indication as the only signal.

### Requirement 15: Static deployment on GitHub Pages

**User Story:** As the site author, I want deployment to be a push to the default branch, so that
shipping carries no pipeline to maintain or debug.

#### Acceptance Criteria

1. THE Portfolio_Site SHALL reference every internal asset — stylesheet, JavaScript module,
   JSON data file, font, image, and `assets/resume.pdf` — with a path that is relative to the
   referencing file, carries no leading slash, carries no scheme or host, and matches the
   on-disk filename character for character including letter case.
2. THE Portfolio_Site SHALL include, at the repository root, an empty `.nojekyll` file, a
   `robots.txt` file that permits crawling of the site and names the absolute `sitemap.xml`
   location, a `sitemap.xml` file listing the canonical URL as its only entry, and a `404.html`
   file that loads the same five stylesheets and site header and footer as `index.html` and
   contains exactly one link to the home page.
3. THE Portfolio_Site SHALL declare in `index.html` a canonical URL, an Open Graph title of 1
   to 60 characters, an Open Graph description of 50 to 200 characters, an Open Graph image, an
   Open Graph url, a Twitter card declaration, and one `Person` JSON-LD block that parses as
   valid JSON, where the canonical URL, Open Graph url, Open Graph image, and JSON-LD url
   values are each absolute URLs rooted at the deployed origin.
4. THE Portfolio_Site SHALL provide an Open Graph image measuring exactly 1200 by 630 pixels at
   a file size of at most 200KB.
5. THE Portfolio_Site SHALL deploy by pushing the default branch, with no continuous
   integration workflow file in the repository, no committed build output, no committed
   dependency directory, and no step required beyond the push.
6. IF a visitor requests a path under the deployed origin that matches no file in the
   repository, THEN THE Portfolio_Site SHALL serve `404.html`, presenting the site shell, a
   message indicating the page was not found, and a working link to the home page.
7. WHEN the default branch is pushed, THE Portfolio_Site SHALL serve the pushed version of
   every changed file at the deployed origin within 10 minutes.
8. WHEN `index.html` is loaded from the deployed origin, THE Portfolio_Site SHALL resolve every
   stylesheet, JavaScript module, JSON data file, font, and image request without a
   missing-file or blocked-request failure, and SHALL log zero console errors.

### Requirement 16: Security and privacy

**User Story:** As a reviewer reading the source, I want safe DOM construction and no tracking, so
that the code reads as trustworthy and visitors are not profiled.

#### Acceptance Criteria

1. THE Project_Renderer SHALL assign no value to `innerHTML` and no value to `outerHTML`, call
   no `insertAdjacentHTML`, no `document.write`, and no `document.writeln`, and create no node
   from a markup string, on every code path including the validation-failure, Fallback_Message,
   and zero-card paths.
2. WHEN a project `title`, `tagline`, `summary`, `role`, `status`, `tech` item, `highlights`
   item, or `image.alt` value of 1 to 500 characters contains `<`, `>`, `&`, `"`, `'`, or a
   backtick, THE Project_Renderer SHALL render that value as a single text node whose
   characters equal the input value exactly, with no entity decoding and no character removal,
   and SHALL leave the rendered card's descendant element count equal to the descendant element
   count of a template clone carrying the same set of present optional fields.
3. THE Project_Renderer SHALL assign an `href` attribute only where the value is a string
   beginning with `https://` followed by at least one host character, and SHALL assign no
   `href` carrying a `javascript:`, `data:`, `vbscript:`, `http:`, `file:`, protocol-relative,
   or relative value.
4. THE Project_Renderer SHALL set `rel` to a value containing `noopener` on every rendered
   anchor whose `href` begins with `https://`, and SHALL set no `target` attribute on any
   rendered anchor.
5. THE Portfolio_Site SHALL reference no analytics script, no tracking pixel, no tag manager,
   no third-party font stylesheet, no `@font-face` source outside `assets/fonts/`, and no
   CDN-hosted script or stylesheet in `index.html`, `404.html`, or any file under `css/` or
   `js/`.
6. THE Portfolio_Site SHALL track no `.env` file, no private key file, and no file containing
   an API key or access token, and SHALL issue no request that requires a credential.
7. IF a value present in a project's `links` object is not an absolute `https://` URL, THEN THE
   Project_Renderer SHALL treat that project as invalid under Requirement 5.3 and SHALL render
   no `href` carrying that value.
8. WHEN a visitor loads the page and scrolls from the Hero_Section to the Footer, THE
   Portfolio_Site SHALL leave the document cookie count at zero and the `localStorage`,
   `sessionStorage`, and IndexedDB entry counts at zero.
9. WHEN the page finishes loading with no visitor interaction, THE Portfolio_Site SHALL issue
   network requests only to its own origin, requesting only its own document, stylesheet,
   module, JSON, font, and image files.
