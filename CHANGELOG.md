# Changelog

This file documents all the notable changes for each version of Spritebot.
Spritebot adheres to [Semantic Versioning](http://semver.org/).

---

## [Unreleased]

### Fixed

- Fixed a bug with SVGs that used `xlink:href` internally—they weren’t being processed properly.
- Fixed a bug where the SVG queue wasn’t reset properly when all the files where cleared from the interface.

---

## [1.3.2] — 2017-08-30

### Fixed

- The `viewBox` detection code when attempting for force `width`/`height` attributes didn’t accommodate decimal places.

---

## [1.3.1] — 2017-07-24

### Fixed

- Prevent sprite sheets from getting all their symbols removed because SVGO things they are useless.
- When a sprite sheet is re-dropped the correct symbol list was not being shown—it had older symbols from previous drops listed.
- When saving a sprite sheet Spritebot now remembers the correct folder & filename instead of constantly resetting to the `~/Downloads` folder.

---

## [1.3.0] — 2017-07-21

### Added

- Because there is no more “Pretty” toggle, the nav bar looked imbalanced so I added a “Add” button.
- When dropping a file that’s already been processed it is now re-processed instead of ignored.
- When dropping a sprite sheet, the symbols are displayed, can be removed, and merged with other SVGs and sprite sheets.

### Changed

- Removed the “Pretty” option and made it so the “Copy” commands all output pretty. Based on user-testing this is the most likely use-case, and the “Pretty” toggle was confusing users.
- Updated all the dependencies.

### Fixed

- Removed the `text-decoration` from underneath all the fancy ampersands.

---

## [1.2.3] — 2017-03-28

### Changed

- Added a small robot illustration to the start screen to differentiate Spritebot from the other Toolbots.

### Fixed

- Fixed a double-spacing bug when adding IDs to the `<svg>` tag.
- The correct ID is now added to the SVG when copied in pretty mode.

---

## [1.2.2] — 2017-03-22

### Changed

- Changed the button focus styles to be more nicely styled and not quite as abrasive.

---

## [1.2.1] — 2017-02-11

### Changed

- Signed the app with an Apple Developer Certificate.

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
