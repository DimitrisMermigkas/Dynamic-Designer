DynamicDesigner (design-system)
================================

High-level overview
-------------------
This repository is an npm workspaces monorepo for building and delivering
dynamic, configurable visual designs used with PRODUCT.ME-style playback.

It contains two main packages:

  designer (@jms/designer)
    React-based authoring pipeline that produces deployable HTML bundles.
    The production flow builds a generic template that loads a per-design
    configuration (design.js). Builds can be packaged (for example as a zip)
    for backend integration: each design variant ships its own design.js and
    references media (often under a media/ folder or via shared libraries).

    The package also publishes a Rollup-built library (ESM/CJS) consumed by
    the client app, with optional obfuscation for release builds.

  client
    The primary web application: React (Create React App), Material UI,
    Redux, and canvas tooling (Fabric.js, drag-and-drop, previews). It
    depends on the local @jms/designer workspace package so the authoring UI
    and the generated runtime stay aligned.

Typical workflow
----------------
  - Authors use the client app to compose layouts, schedules, and assets.
  - The designer package builds the runtime bundle and library artifacts
    needed for packaging or embedding.
  - A backend or deployment job can regenerate artifacts when designs change
    (for example refreshing design.js for all stored configurations).

Root scripts (npm)
------------------
  start:designer / start:client     Dev servers for each workspace
  build:designer / build:client     Production-oriented builds
  build:all                         Build designer then client

Technology summary
------------------
  React 18, TypeScript (where configured), Rollup (designer library),
  Redux Toolkit + persistence (client), MUI v6, Emotion, Zod validation,
  optional JS obfuscation on production builds.

For package-specific setup and deployment notes, see designer/README.md and
client/README.md.
