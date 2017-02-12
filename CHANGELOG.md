# Changelog

This file documents all the notable changes for each version of Spritebot.
Spritebot adheres to [Semantic Versioning](http://semver.org/).

---

## [1.2.1] — 2017-02-11

### Fixed

- Removed duplicate `id=""` attributes from the `<svg` tag.
- Added some Illustrator fixes to remove all the `data-name=""` attributes from the SVG code.
- Prevent the images from being dragged, making the app seem more like a website.
- Fixed a bug when the main window is closed, and multiple files are dropped, only the last one would compress.

---

## [1.2.0] — 2017-01-13

### Added

- A menu item for `Copy SVG as “Symbol”` that will always copy a pretty `<symbol>` tag with the correct ID.

---

## [1.1.1] — 2017-01-02

### Fixed

- The file sizes wrapped sometimes when larger.

---

## [1.1.0] — 2016-12-18

### Added

- Added the “Copy SVG <use> Statement” menu item and shortcut for easier coding.

### Changed

- Changed the “Copy Sprite Sheet” shortcut to match “Save” instead of copy.

### Fixed

- Fixed the menu on Windows.
- Made the app a little wider for better Windows support.

---

## [1.0.1] — 2016-12-17

### Changed

- Accidentally launched with some debugging stuff turned on.

---

## [1.0.0] — 2016-12-17

### Added

- Initial release of the Spritebot desktop app.
