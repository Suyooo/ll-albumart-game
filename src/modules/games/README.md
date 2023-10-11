Game mode modules export the following properties and methods:

-   `getGameInstance: (day: number, albumInfo: AlbumInfo, image: Image, scaledImage: Canvas) => GameInstance`, where `day`
    is the current day number to use for seeding the RNG, `albumInfo` contains info about the title and artist of the
    album, `image` is the original album art file in full resolution, and `scaledImage` is the same art, but pre-scaled to
    the set canvas size to use for your image manipulation, possibly with transparent padding at the top and bottom. This
    method should return a game instance object (see below).
-   `stacked: boolean` defines whether you draw the entire image every step (for example, `game-pixelized.ts`) or you only
    draw additions to the last step using a transparent canvas (for example, `game-bubbles.ts`). If false, only the canvas
    for the current guess will be shown on the site. If true, all canvases from the one for the first guess to the current
    guess will be drawn stacked.

The game instance should implement two methods:

-   `getCanvasForGuess(failed: number) => Canvas` returns the canvas to show for the current guess (0 for the first guess,
    up to 5 for the sixth guess).
-   `getShareCanvas() => Canvas` should return a canvas representing the first guess, which is used as a preview image
    when someone shares their result.

Finally, some meta info is defined in `/src/data/gamepool.json`:

-   `filename: string`: The filename without extension of the module
-   `startOnDay: number`: On which day the game mode should become a possible random pick. This ensures that on one day,
    all players will get the same game, even if the pool and thus the weights change in the middle of the day, and that
    going back, the random pick can be reconstructed for all previous days.
-   `name: string`: A label for the game mode, used for filters and the such.
-   `description: string`: A short description (two lines max) of what the game mode does to the image, so players can
    use it as a hint as to what they should be looking for in the image.
-   `weight: number`: How likely this mode is to be picked. The default is 1000. Weights can be changed in production to
    balance appearance rates (for example, the weights for `game-blinds-h.ts` and `game-blinds-v.ts` are halved - they
    are very similar, so in total, "blinds" type game modes have the same chance as the other game modes), or in testing
    to make the randomness less of a pain (change all other weights to 0 to guarantee your in-dev mode to be picked).

Some important hints:

-   If running the game locally with `vite dev`/`vite serve`, and the `INDEV_LOCK_DAY` constant is set to `0` in the
    `vite.config.ts` config file, save files are ignored and the current round is randomized on each refresh. This makes
    it easier to test game modes on a lot of different album arts. Just set the game mode's weight to a very high number
    to make sure it's the most likely outcome.
-   Use `/src/modules/rng.ts` for random numbers instead of `Math.random()`, and only use `day`/`failed`/constants for the
    seeding. The image created should always be the same for every user on the same day on the same guess. When testing,
    use `vite build && vite preview` and try refreshing after each skip to make sure the image does not change.
-   Watch out for non-square covers. In these cases, `scaledImage` will have transparent areas at the top and bottom. This
    might be a problem if you resize or move the canvas a lot, as previous steps might peek through in the final result.
    Always test your games with some wide aspect ratio images, like _LL! Superstar!! Original Soundtrack - Dreams of the
    Superstar_.
-   Since `getShareCanvas` should represent the first guess, you can usually just make a call to `getCanvasForGuess(0)`
    and that's all. If your game mode only reveals very small parts of the image though, you might want to instead return
    a rearranged image (see `game-blinds-h/v.ts` for an example). Make sure it is always square.
-   Balance is hard. Guess 1 should be very difficult, while guess 6 should be reasonable, but not a straight giveaway.
    Try checking against existing game modes and balancing along the same lines. One way to make this easier is to define
    any dials you can move for balancing as a constant that can be easily adjusted (see `game-pixelized.ts`, for example -
    the `SIZES` array is way at the top and allows quick and easy changes for testing balance).
-   node-canvas (`canvas` on npm) is used to allow both a browser client and Node.JS on the server to generate the same
    image. Ensure that you only use standard canvas methods, even if node-canvas implements a few helpers. (The
    non-standard parts are listed on [their GitHub page](https://github.com/Automattic/node-canvas#non-standard-apis).)
-   Performance might be slow depending on how many operations you do. One way to help is to set `stacked` and only draw
    changed regions for guesses 2-6. Another possibility is to make the function `async` and use `yieldToMain()` from
    `canvasUtil.ts` to split the work into batches (see `game-bubbles.ts` for an example). However, if you use this
    approach, make sure that (a) the album art is fully obscured no matter which state the canvas might be shown in, and
    (b) that the `getShareCanvas` method is synchronous, as the share canvas script will not `await` any promises.
-   Also, if you use any temporary canvases at all to help with the configuration, make sure you never use the full image.
    Use only the scale canvas and call `releaseCanvas()` in `canvasUtil.ts` on them after you're done, because iOS is
    trash and has extremely awful limits specifically for total canvas size
-   You can use `requestAnimationFrame` to only draw some parts of the image in each frame and make neat animations (see
    `game-tiles.ts` for an example). The same guidelines as above apply: fully obscure the album art at every step, and
    don't do any animations in `getShareCanvas`. If you use `getCanvasForGuess(0)` for the share canvas, you should use
    `typeof requestAnimationFrame !== "undefined"` to check whether the code is running in a browser, where the method is
    available, or it's running on the server, where the animation should be skipped and the entire canvas drawn at once.

If you've made a neat game mode, feel free to send in a pull request, so it can be added to the site :)
