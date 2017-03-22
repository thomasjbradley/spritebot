# ![](.readme/spritebot-logo.png) Spritebot

*Your awkwardly ostentatious optimizing robot.*

![](.readme/screenshot.png)

**This application is essentially a GUI wrapper around [SVGO](https://github.com/svg/svgo), but without all the configuration of [SVGOMG](https://jakearchibald.github.io/svgomg/).**

I was inspired to create it because my students needed a simpler SVG batch processing tool since [SVG-GUI](https://github.com/svg/svgo-gui) isn’t maintained any more.

The additional feature Spritebot brings, that isn’t available in the other tools, is the generation of SVG sprite sheets.

Built with Javascript, Node.js & Electron.

---

## Download

Download the latest version of Spritebot below:

### [⬇ Download for MacOS](https://github.com/thomasjbradley/spritebot/releases/download/v1.2.2/Spritebot-1.2.2.dmg)
### [⬇ Download for Windows](https://github.com/thomasjbradley/spritebot/releases/download/v1.2.2/Spritebot-Setup-1.2.2.exe)

---

## Using the sprite sheets

The sprite sheets that Spritebot creates will have `<symbol>` tags for each active SVG that’s been added into Spritebot.

*If the SVGs are reverted to their original, unoptimized format they will not be included in the sprite sheet.*

The `id` for each `<symbol>` will be the SVGs filename without the `.svg` extension.

### Using an external SVG image file

Save the sprite sheet into your images folder. Then, in your HTML, you can use the SVG `<use>` statement to display a single sprite at a time:

```html
<svg><use xlink:href="images/sprite-sheet.svg#icon-green" /></svg>
```

### Using sprites pasted into HTML

You can paste the sprite sheet into your HTML file directly, then use the sprites from there.

I suggest hiding the `<svg>` tag with the `hidden` attribute, like so:

```html
<svg hidden>
  ⋮
</svg>
```

Then further down, in your HTML you can use a single sprite with the `<use>` statement:

```html
<svg><use xlink:href="#icon-green" /></svg>
```

### More tutorials…

[**Check out the lessons & tutorials I use for my students for more details information.**](https://learn-the-web.algonquindesign.ca/topics/advanced-svg/)

---

## License & copyright

© 2016 Thomas J Bradley — [GPL](LICENSE).
