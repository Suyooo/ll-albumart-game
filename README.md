# LL! Guess That Album

This is the source code for the Love Live! album art guessing game, playable here: https://llalbum.suyo.be/

## Setup

-   If you want to use this as a base for a different game:
    -   Put your images into the `public` folder, then prepare `src/data/albumpool.json`. You can use `npm run test` to
        check for problems with the album image files.
    -   Clear all entries from `src/data/rerolls.ts`, and set a new first day date in `ZERO_DAY_TIMESTAMP` in
        `src/modules/daily.ts`.
-   Run `npm install` and `npm run build` to build the files. You can then upload the `dist` folder to your server.
-   Sharing will include an URL with the day number. Use the rules in `contrib` to redirect social media bots to special
    pages with meta data, while users will be shown the index page. You must also set up a daily cron job at reset time
    calling `npm run make-share` to create those social media bot files.
-   To allow for moderation of rounds, use your browser's dev tools to create the key `llalbum-modmode-day-offset` in
    Local Storage and set it to `1`. From the next refresh of the page onwards, the rounds you play will be one day
    ahead of those for regular players, allowing you to edit `src/data/rerolls.ts` to reroll bad rounds (requiring a
    rebuild and upload of the new files). Note that you will have to delete your data to see a new round after a reroll,
    so you might want to do this in a seperate browser profile to keep your own stats. For advanced moderation tools,
    see `src/lib/ModMode.svelte`.

## Game Modes

If you want to see how the game modes are implemented or want to make one yourself, head to the `src/modules/games`
folder. Another readme will await you there.

`npm run dev` will serve random rounds every refresh for testing. You can set the `VITE_LOCK_DAY` environment variable
to instead use a certain day for rerolling.
