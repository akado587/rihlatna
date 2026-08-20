# Instructions for AI assistants (Claude Code, Cursor, Codex, ...)

You are helping someone turn their travel bookings into a working family trip
app. The person may have no coding experience. Be friendly, ask in their
language, and never assume they know what a terminal, commit or deploy is.

## The design is fixed

The design is part of the product: every app built from this template
should look exactly as polished as the screenshots in the README. Your
job is the data, not the design.

Limit your changes to these files:

- `js/trip.js` (the trip data - this is 95% of your work)
- `assets/img/` (photos)
- `tickets/` (barcode PNGs, .pkpass files)
- `docs/` (booking PDFs the family should be able to open in the app)
- the `VERSION` constant in `sw.js` (bump it once per content update)

Leave `index.html`, `css/`, `js/app.js`, `js/icons.js`, `js/qrcode.js`,
the rest of `sw.js`, `vercel.json` and `_headers` untouched, unless the
user explicitly asks you to customize the design. If they do, it's their
fork and their call - help them. Just don't restyle, "improve" or
refactor the app on your own initiative.

## The workflow: from a folder of bookings to a live app

The user drops everything into `bookings/` - flight confirmations, hotel
bookings, park tickets, rental car papers, screenshots. PDFs, images,
emails, any format, any language. Then they say something like "build my
trip app". You:

1. **Read everything in `bookings/`.** Extract only what a document
   actually says. Never invent a time, a booking number or an address.
   If a field is unclear or missing, put it on a list.

2. **Interview the user about the gaps.** A short, human conversation:
   who is traveling (first names are enough), what 4-digit PIN they want,
   which language the app should be in, and whatever your gap list needs
   ("Your hotel booking doesn't mention a check-out time - do you know it?").
   Ask about the fun parts too: any booked activities, restaurant plans,
   things the family shouldn't miss. Rihlatna apps shine when they carry
   tips, not just bookings.

3. **Write `js/trip.js`.** The file documents its own schema in the
   comments; the demo data shows every feature. Replace the demo with the
   user's trip. Match every block to what the family actually has - every
   block is optional. Translate the `strings` object if the app language
   is not English, and set `lang`/`dir` (the layout handles RTL by itself).

4. **Verify before you show anything.** Go back through the source
   documents one by one and check every date, time, number and name you
   extracted against them. Check that ISO dates (`start`, `end`, `from`,
   `to`, `dayplan` keys) are consistent with each other. Tell the user
   explicitly which fields you could not verify.

5. **Handle images.** Ask for the family's own photos first (a city shot
   per stage, room photos if they have them). Otherwise use Wikimedia
   Commons and note author + license. Either way, re-encode every image
   and strip all metadata (EXIF can contain GPS positions of their home):
   resize to max 1600px, save as JPEG without metadata. Verify the strip.

6. **Handle tickets.** QR-based tickets need only the code string in
   `trip.js` - the app renders QR codes itself. Airline boarding passes
   use Aztec barcodes, which the app cannot render: generate a PNG per
   pass (`bwip-js` with `bcid: "azteccode"`, include a quiet zone),
   decode it again to verify, and reference the PNGs in the `boarding`
   block. `.pkpass` files go into `tickets/` and get linked via `pass`
   fields so the family can add them to Apple Wallet.

7. **Deploy.** Recommend Vercel (config is included). If the user has
   never deployed: walk them through signing up with their GitHub account
   and importing the repo, or run `npx vercel` with them. Netlify works
   too (`_headers` is included). GitHub Pages does not serve `.pkpass`
   correctly - advise against it.

8. **Hand over the link.** The family link is
   `https://their-url/?key=THEIRPIN` - it unlocks and remembers each
   device. Remind them: after any later change, bump `VERSION` in `sw.js`
   and redeploy, and the family gets the update on next open.

## Privacy rules

- `bookings/` is gitignored on purpose. Never commit it, never remove it
  from `.gitignore`, never copy raw bookings into the deployed folders
  except the PDFs the user explicitly wants inside the app (`docs/`).
- If real tickets, passports or booking PDFs end up in the app, the
  user's copy of this repo should stay private. Say so proactively.
- The PIN is a convenience lock, not encryption. Warn the user before
  putting anything in the app they couldn't show a stranger (passport
  scans, credit card numbers). Suggest leaving such things out.
- Strip metadata from every photo (step 5), without exception.

## Quality bar

Before you call it done: run a local server (`python3 -m http.server`),
open the app, and click through every stage, the tickets page and the
essentials tab. Check it on a phone-sized viewport (390px wide). Broken
image paths and overflowing buttons are the two classic mistakes.
