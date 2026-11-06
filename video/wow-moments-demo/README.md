# wow-moments demo video

The Remotion source for [`assets/wow-moments-menu.gif`](../../assets/wow-moments-menu.gif), shown under "A real menu" in the [wow-moments README](../../skills/wow-moments/README.md).

It replays the real output of one run of the skill on the `landing-page` fixture: the scan's menu, the pick `A1, A2` and the verdict. The text lives in [`src/data.ts`](src/data.ts), copied from that run. A line too long for one row keeps its opening words and is cut with "…". Don't write new lines by hand: if the skill's output changes, run it again and copy the new output.

## Render

```bash
npm ci
npm run dev                                                    # Remotion Studio preview
npx remotion render WowMomentsDemo out/demo.mp4                # 1280×720, 30 fps, 26 s
ffmpeg -y -i out/demo.mp4 -vf "fps=15,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" out/demo.gif
cp out/demo.gif ../../assets/wow-moments-menu.gif
```

The GIF is 960px wide at 15 fps (about 1.7 MB). `ffmpeg` isn't installed by `npm ci`.

## Gotchas

- **License.** Remotion is free for individuals and companies of up to three people. Larger companies need a [Company License](https://www.remotion.pro/license). This video is made for a personal project.
- **Colours** are Rezi UI tokens (light page, dark terminal), copied by hand from the shared Pencil file into `src/Composition.tsx`. They don't update on their own.
- **Geist Mono has no `⏺` glyph**, so the "skill loaded" marker renders as a filled dot.
