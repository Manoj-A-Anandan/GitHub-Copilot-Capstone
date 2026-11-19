# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Create tasks from a title, rejecting empty or whitespace-only titles and
  titles longer than 255 Unicode code points.
- Show successfully saved tasks immediately as incomplete and clear the input.
- Save tasks in browser `localStorage` and restore them after a page refresh.
- Provide reread and explicitly confirmed replacement controls for unreadable
  saved data, and render task titles as text.

### Changed

- Limit the **Replace saved tasks** control to unreadable-initial-load recovery;
  hide and disable it when storage is readable or recovery has succeeded.
