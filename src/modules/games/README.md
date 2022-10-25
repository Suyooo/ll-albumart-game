Game mode modules export the following properties and methods:

* `getGameInstance: (day: number, albumInfo: AlbumInfo, image: Image, scaledImage: Canvas) => GameInstance`, where `day`
  is the current day number to use for seeding the RNG, `albumInfo` contains info about the title and artist of the
  album, `image` is the original album art file in full resolution, and `scaledImage` is the same art, but pre-scaled to
  the set canvas size to use for your image manipulation, possibly with transparent padding at the top and bottom. This
  method should return a game instance object (see below).
* `stacked: boolean` defines whether you draw the entire image every step (for example, `game-pixelized.ts`) or you only
  draw additions to the last step using a transparent canvas (for example, `game-bubbles.ts`). If false, only the canvas
  for the current guess will be shown on the site. If true, all canvases from the one for the first guess to the current
  guess will be drawn stacked.

The game instance should implement two methods:

* `getCanvasForGuess(failed: number) => Canvas` returns the canvas to show for the current guess (0 for the first guess,
  up to 5 for the sixth guess).
* `getShareCanvas() => Canvas` should return a canvas representing the first guess, which is used as a preview image
  when someone shares their result.

Finally, some meta info is defined in `/src/data/gamepool.json`:

* `filename: string`: The filename without extension of the module
* `startOnDay: number`: On which day the game mode should become a possible random pick. This ensures that on one day,
  all players will get the same game, even if the pool and thus the weights change in the middle of the day, and that
  going back, the random pick can be reconstructed for all previous days.
* `name: string`: A very short description of the game mode that might show on the site.
* `weight: number`: How likely this mode is to be picked. The default is 1000. Weights can be changed in production to
  balance appearance rates (for example, the weights for `game-blinds-h.ts` and `game-blinds-v.ts` are halved - they
  are very similar, so in total, "blinds" type game modes have the same chance as the other game modes), or in testing
  to make the randomness less of a pain (change all other weights to 0 to guarantee your in-dev mode to be picked).

Some important hints:

* If running the game locally with `vite dev`/`vite serve`, save files are ignored and the current round is randomized
  on each refresh, to help with testing game modes on different arts.
* Use `/src/modules/rng.ts` for random numbers instead of `Math.random()`, and only use `day`/`failed`/constants for the
  seeding. The image created should always be the same for every user on the same day on the same guess. When testing,
  try refreshing after each skip to make sure the image does not change.
* Watch out for non-square covers. In these cases, `scaledImage` will have transparent areas at the top and bottom. This
  might be a problem if you resize or move the canvas a lot, as previous steps might peek through in the final result.
  Always test your games with some wide aspect ratio images, like Dreams of the Superstar.
* Since `getShareCanvas` should represent the first guess, you can usually just make a call to `getCanvasForGuess(0)`
  and that's all. If your game mode only reveals very small parts of the image though, you might want to instead return
  a rearranged image (see `game-tiles.ts` for an example). Make sure it is always square.
* Balance is hard. Guess 1 should be very hard, while Guess 6 should be reasonable, but not a straight giveaway. Try
  checking against existing game modes and balancing along the same lines. One way to make this easier is to move any
  dials you can move for balancing into a constant that can be easily adjusted (see `game-pixelized.ts`, for example -
  the `SIZES` array is way at the top and allows quick and easy changes for testing balance).
* node-canvas (`canvas` on npm) is used to allow both a browser client and Node.JS on the server to generate the same
  image. Ensure that you only use standard canvas methods, even if node-canvas implements a few helpers. (The non-
  standard parts are listed on [their GitHub page](https://github.com/Automattic/node-canvas#non-standard-apis).)
* Performance might be hard depending on how many operations you do. One way to help is to set `stacked` and only draw
  changed regions for guesses 2-6. Another possibility is to use `requestAnimationFrame` to only draw some parts of the
  image in each frame (see `game-bubbles.ts` for an example). Make sure the album art is fully obscured on every frame
  if you use this method. (You can also use this approach for fancy animations! See `game-tiles.ts`)

If you've made a neat game mode, feel free to send in a pull request so it can be added to the site :)