# LL! Guess That Album

This is the source code for the Love Live! album art guessing game, playable here: https://llalbum.suyo.be/

If you want to see how the game modes are implemented or want to make one yourself, head to the `src/modules/games`
folder. Another readme will await you there.

-   `npm run dev` will serve random rounds every refresh for testing. You can set the `VITE_LOCK_DAY` environment variable
    to instead use a certain day for rerolling.
-   Sharing will include an URL with the day number. Use the rules in `contrib` to redirect social media bots to
    specially crafted pages with meta data (generated each day by a `npm run make-share` cronjob) while users will be
    shown the index page.
