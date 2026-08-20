/* ============================================================================
   trip.js - the single data file behind your whole trip app.
   ----------------------------------------------------------------------------
   Everything the app shows lives in this one file: the itinerary, hotels,
   tickets, tips, and every UI string. Fill it in, deploy the folder as a
   static site, done. No build step, no backend.

   The data below is a complete demo trip for a fictional family of four
   (Omar, Layla, Sara and Noor): a week from Berlin to Lake Garda and
   Venice. The places are real; every booking number, code and phone
   number is made up. Replace it all with your own trip.

   Conventions used throughout:
   - All dates are pre-formatted display strings EXCEPT `start`, `end`,
     `from`, `to` and the `dayplan` keys, which must be ISO (YYYY-MM-DD).
     The app only does date math on the ISO fields (countdown, "you are
     here", today's plan).
   - Every block on a stage page is OPTIONAL. Omit a key (or set it null)
     and the block simply doesn't render. Mix and match per stage:
       arrive      how you get there (flight or drive)
       transfer    pre-booked chauffeur rides
       hotel       where you sleep (with photo gallery + booking numbers)
       car         rental car pickup (shown on the pickup stage)
       carReturn   rental car drop-off reminder (shown on the departure stage)
       outing      a timed evening walking plan with map pins
       activity    a pre-booked activity with QR entry code
       days        day-by-day program cards
       info        plain info cards (e.g. for a shopping stop)
       recs        curated recommendation cards ("don't miss these")
       boarding    boarding passes with barcode images
   - `maps` fields hold a Google Maps SEARCH QUERY (plain text), `url` /
     `*Maps` fields hold a full link. The app builds the rest.
   - RTL: the app was originally built in Arabic. Set lang/dir below and
     translate `strings` and your content - the layout mirrors correctly.
   ========================================================================== */

const TRIP = {
  /* -------------------------------------------------------------------------
     App basics
     ---------------------------------------------------------------------- */
  pin: "1234",            // 4-digit family code for the PIN gate. This is a
                          // convenience lock, not encryption: don't put
                          // secrets in the app you couldn't show a stranger.
                          // Unlock link to share once: https://yoursite/?key=1234
  lang: "en",             // BCP-47 language tag for <html lang>
  dir: "ltr",             // "ltr" or "rtl" - the whole layout mirrors
  title: "Our Trip",      // app name (PIN screen + browser tab)
  subtitle: "Berlin to Lake Garda",   // home screen headline
  dateRange: "October 3 - 9, 2026",   // home screen subline (display only)
  start: "2026-10-03",    // ISO. Before this date the app shows a countdown,
  end: "2026-10-09",      //  between start/end it highlights today's stage.
  footer: "Made with love for the best family", // home screen footer line

  /* -------------------------------------------------------------------------
     The travelers. Keys are referenced by tickets and boarding passes.
     `name` is the short display name; `full` the name on documents.
     ---------------------------------------------------------------------- */
  people: {
    omar:  { name: "Omar",  full: "Omar Traveler" },
    layla: { name: "Layla", full: "Layla Traveler" },
    sara:  { name: "Sara",  full: "Sara Traveler" },
    noor:  { name: "Noor",  full: "Noor Traveler" },
  },

  /* -------------------------------------------------------------------------
     Every UI string in the app. Translate this object (plus your content)
     and the app speaks your language. Two entries are FUNCTIONS so your
     language's plural rules fit.
     ---------------------------------------------------------------------- */
  strings: {
    pinPrompt: "Enter the family code",
    tabTrip: "Trip",
    tabInfo: "Essentials",
    copied: "Copied",
    countdown: (d) => d === 1 ? "1 day until takeoff" : d + " days until takeoff",
    tripOver: "The trip is over - welcome home!",
    today: "Today",
    youAreHere: "You are here",
    details: "Details",
    nights: (n) => n === 1 ? "1 night" : n + " nights",
    dayStop: "Day trip",
    openRoute: "Open the route in Maps",
    stay: "Your stay",
    viewOnMap: "View on map",
    call: "Call",
    walletBooking: "Booking card in Apple Wallet",
    checkin: "Check-in",
    checkout: "Check-out",
    confNumber: "Booking number",
    confPin: "PIN",
    confExtra: "Additional booking number",
    confCopied: "Booking number copied",
    copy: "Copy",
    swipeRooms: (room) => "Swipe to see photos of your " + room,
    bookingDoc: "Original booking document (PDF)",
    boarding: "Boarding",
    seat: "Seat",
    addToWallet: "Add to Apple Wallet",
    driver: "A private driver is waiting for you",
    rideCopied: "Ride number copied",
    tripCar: "Your trip car",
    pickup: "Pickup",
    dropoff: "Drop-off",
    pickupStation: "Pickup station",
    dropoffStation: "Drop-off station at the airport",
    dropoffTime: "Drop-off time",
    dropoffOnMap: "Drop-off station in Maps",
    carDoc: "Car booking document (PDF)",
    bookedActivity: "Booked activity",
    when: "When",
    meetingPoint: "Meeting point in Maps",
    yourProgram: "Your program there",
    ticketsReady: "Your tickets are ready here",
    dontMiss: "Don't miss these",
    halal: "Halal",
    openInMaps: "Open in Maps",
    tickets: "Tickets",
    ticketsTitle: "Park tickets",
    ticketsSub: "Everyone has their own ticket - add it to your wallet with one tap",
    ticketsPdf: "Tickets PDF",
    everyone: "Everyone",
    infoSub: "Numbers, documents and tips for the road",
    emergencyCall: "Emergency call",
    allDocs: "All documents",
    bookingNumbers: "Booking numbers",
    usefulNumbers: "Numbers that matter",
    tipsTitle: "Tips that make it easier",
  },

  /* -------------------------------------------------------------------------
     STAGES - the heart of the trip. One entry per city/stop, in order.
     Required per stage: id, city, cityLatin, dates, from, to, nights, who,
     img, teaser. Everything else is optional (see the block list on top).
     - id: URL slug. The special id "home" renders as the return-leg card.
     - cityLatin: secondary name in local spelling - what you'd show a taxi
       driver. (In the original Arabic app this was the Latin-script name.)
     - who: who of the family is on this stage (display string).
     - hasTickets: set true on ONE stage to give it the tickets-page button.
     ---------------------------------------------------------------------- */
  stages: [
    {
      id: "garda",
      city: "Lake Garda",
      cityLatin: "Riva del Garda",
      country: "Italy",
      dates: "Sat Oct 3 - Wed Oct 7",
      from: "2026-10-03", to: "2026-10-06",
      nights: 4,
      who: "all four of you",
      img: "assets/img/garda.jpg",
      teaser: "Mountains dropping straight into blue water, castle villages and the best gelato of the trip",

      /* arrive: kind "flight" or "drive". `lines` are label/value rows.
         For drives, `mapsTo` (a search query) adds an "open route" button. */
      arrive: {
        kind: "flight",
        title: "Flying in from Berlin",
        lines: [
          { label: "Flight", value: "AL 152, non-stop" },
          { label: "Booking reference", value: "DEMO-PNR" },
          { label: "Departure", value: "Sat Oct 3, 09:40, Berlin BER" },
          { label: "Arrival", value: "11:20, Verona" },
          { label: "Baggage", value: "One 23 kg bag per person" },
        ],
      },

      /* transfer: pre-booked chauffeur rides with copyable ride numbers. */
      transfer: {
        rides: [
          { route: "Verona airport to the hotel", when: "Sat Oct 3, 12:00", id: "DEMO-RIDE-1" },
        ],
        tips: [
          "The driver waits in arrivals with a name sign - take your time with the bags",
          "The ride along the lake takes about an hour. Sit on the right for the views",
          "Nothing to pay in the car, it's all settled with the booking",
        ],
      },

      /* hotel: `imgs` is a swipeable gallery - use photos of YOUR booked
         room type. `conf`/`confPin` render with a copy button. `pass` (a
         .pkpass file) and `doc` (a PDF) are optional extras. */
      hotel: {
        name: "Du Lac et Du Parc Grand Resort",
        nameLatin: "Du Lac et Du Parc, Riva del Garda",
        address: "Viale Rovereto 44, 38066 Riva del Garda",
        phone: "+391234567890",
        phoneDisplay: "+39 123 456 7890",
        imgs: [
          "assets/img/room-garda-1.jpg",
          "assets/img/room-garda-2.jpg",
          "assets/img/room-garda-3.jpg",
          "assets/img/resort-pool.jpg",
        ],
        checkin: "Sat from 15:00",
        checkout: "Wed until 11:00",
        conf: "DEMO-52180",
        confPin: null,
        room: "family suite",
        tips: [
          "The resort park runs straight down to the lakefront - grab loungers before 10:00",
          "Breakfast until 10:30. The pancake station is where the kids will live",
          "Bikes are free to borrow at the concierge, the lakeside path to Torbole is flat and easy",
          "Payment at check-out; the booking is guaranteed, nothing was charged yet",
        ],
      },

      /* car: rental pickup block. The drop-off reminder lives on the
         departure stage as `carReturn` (see the "home" stage below). */
      car: {
        name: "Family SUV",
        nameLatin: "BMW X5 or similar",
        desc: "An automatic SUV with room for the four of you and the luggage. You pick it up in town on Sunday morning; from then on the lake, the park and Venice are all yours.",
        img: "assets/img/car-demo.jpg",
        conf: "DEMO-24680",
        pickupWhen: "Sun Oct 4, 10:00",
        pickupPlace: "Car rental, Riva del Garda",
        pickupHint: "The station is a 10-minute walk from the hotel, along the lakefront",
        dropWhen: "Fri Oct 9, before 10:30",
        dropPlace: "Verona Airport Car Rental Return",
        included: "Fully prepaid: full insurance with zero excess, unlimited kilometers, 24/7 roadside assistance.",
        tips: [
          "Bring the main driver's license, passport and a credit card in the same name",
          "Italian old towns have camera-enforced no-drive zones (ZTL). Park outside the signs and walk in - the fines find you at home",
          "Return day: fill the tank at the station by the airport exit first",
        ],
      },

      /* activity: a booked tour/event. `qr` is the string encoded into a
         QR code rendered on-device; `code` is the human-readable code.
         NOTE: the built-in renderer draws QR codes only - for Aztec codes
         (airline boarding passes) use `boarding` with a PNG instead. */
      activity: {
        name: "Sunset cruise on the lake",
        latin: "Riva del Garda · private boat",
        img: "assets/img/cruise.jpg",
        date: "Tue Oct 6",
        time: "17:30, be at the pier 17:15",
        teaser: "Two hours on the water as the cliffs turn golden: along the west shore to Limone and back, with a swim stop if the day is warm. One pass covers all four of you.",
        code: "DEMO-TICKET",
        qr: "DEMO-TICKET",
        meetMaps: "https://www.google.com/maps/search/?api=1&query=Porto%20di%20Riva%20del%20Garda",
        tips: [
          "Meeting point: the main pier at Riva harbour, look for the blue flag",
          "Bring jackets - it cools down fast on the water after sunset",
          "The skipper takes photos of the family at the bow, just ask",
        ],
      },

      /* recs: swipeable recommendation cards. `maps` is a search query.
         `halal: true` adds a badge. Icons: see js/icons.js for all names. */
      recs: [
        { icon: "sparkle", name: "Monte Baldo cable car", latin: "Funivia Malcesine", why: "Rotating cabins climb 1,700 m out of Malcesine: the whole lake at your feet, and easy walks on top. Go before 10:00 to skip the queue", maps: "Funivia Malcesine Monte Baldo" },
        { icon: "map-pin", name: "Malcesine old town", latin: "Castello Scaligero", why: "Cobbled lanes winding up to a castle on a cliff over the water. Climb the tower, then gelato in the harbour", maps: "Castello Scaligero di Malcesine" },
        { icon: "waves", name: "Varone waterfall", latin: "Cascata del Varone", why: "A waterfall thundering inside a mountain gorge, walkways and all. Twenty minutes from the hotel and the kids' favourite hour of the trip", maps: "Cascata del Varone Riva del Garda" },
        { icon: "coffee", name: "Riva lakefront at dusk", latin: "Riva del Garda promenade", why: "The evening walk: mountains glowing pink, boats coming home, and gelato at the harbour. No plan needed, just go", maps: "Riva del Garda lakefront promenade" },
      ],
    },

    {
      id: "gardaland",
      city: "Gardaland",
      cityLatin: "Gardaland Resort",
      country: "Italy",
      dates: "Mon Oct 5",
      from: "2026-10-05", to: "2026-10-05",
      nights: 0,
      who: "all four of you",
      img: "assets/img/gardaland.jpg",
      teaser: "Italy's biggest theme park, an hour down the lake - tickets are ready in the app",
      hasTickets: true,   /* this stage gets the button to the tickets page */
      arrive: {
        kind: "drive",
        title: "By car from Riva",
        lines: [
          { label: "Distance", value: "About 65 km along the east shore" },
          { label: "Duration", value: "About an hour" },
          { label: "Tip", value: "Leave 8:45 to be at the gates for opening" },
        ],
        note: "The lakeside road is half the fun: castles, olive groves and lake views all the way down.",
        mapsTo: "Gardaland Resort",
      },
      hotel: null,
      days: [
        {
          date: "Mon Oct 5",
          icon: "ticket",
          title: "Park day",
          text: "Gates open at 10:00. Head straight to the back of the park and work forward - the big coasters are empty for the first hour. Your four tickets are on the tickets page, one per person.",
        },
      ],
      recs: [],
    },

    {
      id: "venice",
      city: "Venice",
      cityLatin: "Venezia",
      country: "Italy",
      dates: "Wed Oct 7 - Fri Oct 9",
      from: "2026-10-07", to: "2026-10-08",
      nights: 2,
      who: "all four of you",
      img: "assets/img/venice.jpg",
      teaser: "Two nights in the city on the water: canals, bridges and no cars anywhere",
      arrive: {
        kind: "drive",
        title: "By car from Lake Garda",
        lines: [
          { label: "Distance", value: "About 160 km" },
          { label: "Duration", value: "Two hours on the A4" },
          { label: "Parking", value: "Tronchetto garage, then one vaporetto stop" },
        ],
        note: "Venice is car-free: park at Tronchetto (covered, about 25 EUR/day) and take the people mover or vaporetto. The hotel is right by the Grand Canal.",
        mapsTo: "Tronchetto Parking Venezia",
      },
      hotel: {
        name: "NH Venezia Santa Lucia",
        nameLatin: "Cannaregio, by Santa Lucia station",
        address: "Cannaregio 116, 30121 Venezia",
        phone: "+391234567891",
        phoneDisplay: "+39 123 456 7891",
        maps: "https://maps.app.goo.gl/LS5jSoEGPqTpbzxu7",  /* optional: exact pin for the map button */
        imgs: [
          "assets/img/room-venice-1.jpg",
          "assets/img/room-venice-2.jpg",
          "assets/img/room-venice-3.jpg",
        ],
        checkin: "Wed from 14:00",
        checkout: "Fri until 11:00",
        conf: "DEMO-90417",
        confPin: null,
        room: "family room",
        tips: [
          "A few minutes from Santa Lucia station, with canal views from the front rooms",
          "Ask for the quieter rooms to the back courtyard if you're light sleepers",
          "Vaporetto stop Ferrovia is two minutes away; get the family day passes there",
        ],
      },

      /* outing: a timed evening plan. `schedule` rows are time + text;
         `places` become map buttons (first one is highlighted). */
      outing: {
        name: "Your first Venice evening",
        latin: "San Marco · Rialto",
        date: "Wed Oct 7",
        teaser: "The classic first evening, done the easy way: down the Grand Canal by boat as the light goes golden, the big sights at dusk, dinner in the lanes, and the Rialto bridge lit up on the way home.",
        schedule: [
          { t: "17:30", x: "Vaporetto line 1 from Ferrovia, direction Lido - grab the open seats at the back" },
          { t: "18:10", x: "Get off at San Marco: the whole palace square opens up in evening light" },
          { t: "18:30", x: "Walk the square, the Basilica facade and the two columns by the water" },
          { t: "19:30", x: "Dinner in the small lanes north of the square - follow the locals, not the menus with photos" },
          { t: "21:00", x: "Walk to the Rialto bridge, all lit up over the Grand Canal" },
          { t: "21:30", x: "Easy 20-minute walk back to the hotel through Santa Croce" },
        ],
        places: [
          { name: "Piazza San Marco", maps: "Piazza San Marco Venezia" },
          { name: "Rialto Bridge", maps: "Ponte di Rialto Venezia" },
        ],
        tips: [
          "Comfortable shoes beat style here - Venice is bridges and steps all the way",
          "Keep phones zipped in front pockets in the thick crowds around San Marco",
        ],
      },
      recs: [
        { icon: "shopping-bag-open", name: "Rialto market", latin: "Mercato di Rialto", why: "Fruit, fish and theatre, every morning except Sunday. Go before 11:00, buy peaches, eat them on the canal steps", maps: "Mercato di Rialto Venezia" },
        { icon: "coffee", name: "Gelato at Suso", latin: "Gelatoteca Suso", why: "The queue moves fast and it's worth it - the salted pistachio is famous for a reason. Two minutes from Rialto", maps: "Gelatoteca Suso Venezia" },
        { icon: "sparkle", name: "The flooded bookshop", latin: "Libreria Acqua Alta", why: "Books stacked in gondolas and bathtubs against the floods, cats included. The courtyard staircase of old books is the photo of the trip", maps: "Libreria Acqua Alta Venezia" },
        { icon: "waves", name: "Cross by traghetto", latin: "Traghetto San Tomà", why: "A standing gondola ride across the Grand Canal for a couple of euros - the local shortcut most tourists never find", maps: "Traghetto San Toma Venezia" },
      ],

      /* boarding: boarding-pass cards, one per person. `img` is a
         PRE-RENDERED barcode image (airlines use Aztec codes, which the
         on-device QR renderer can't draw - render them to PNG offline,
         e.g. with bwip-js, and reference the files here). `pass` (.pkpass)
         is optional. `codeLabel` prints under the barcode next to the seat. */
      boarding: {
        route: "Verona to Berlin",
        codeLabel: "AL 155",
        info: "Boarding passes for Friday's flight home - one per person, add them to your phones tonight. At the airport: drop the car by 10:30, bag drop closes 12:30, gate closes 13:10.",
        passes: [
          { person: "omar",  seat: "7A", img: "tickets/bp-demo.png" },
          { person: "layla", seat: "7B", img: "tickets/bp-demo.png" },
          { person: "sara",  seat: "7C", img: "tickets/bp-demo.png" },
          { person: "noor",  seat: "7D", img: "tickets/bp-demo.png" },
        ],
      },
    },

    {
      /* The special "home" stage: rendered as the return-leg card at the
         end of the timeline. `flightsLabel` is the short line shown on
         the home-screen card. */
      id: "home",
      city: "Home to Berlin",
      cityLatin: "Verona → Berlin",
      country: "",
      dates: "Fri Oct 9",
      from: "2026-10-09", to: "2026-10-09",
      nights: 0,
      who: "all four of you",
      img: "assets/img/berlin.jpg",
      teaser: "Drop the car, one last espresso, and home by mid-afternoon",
      flightsLabel: "AL 155",
      arrive: {
        kind: "flight",
        title: "The flight home",
        lines: [
          { label: "Flight", value: "AL 155, non-stop" },
          { label: "Departure", value: "Fri Oct 9, 13:30, Verona" },
          { label: "Arrival", value: "15:10, Berlin BER" },
          { label: "Baggage", value: "One 23 kg bag per person" },
        ],
        note: "Leave Venice by 9:00 - it's 90 minutes to Verona airport plus the car return.",
      },
      carReturn: {
        title: "Rental car drop-off",
        when: "Fri Oct 9, before 10:30",
        place: "Verona Airport Car Rental Return",
        maps: "https://www.google.com/maps/search/?api=1&query=Verona%20Airport%20Car%20Rental%20Return",
        conf: "DEMO-24680",
        tips: [
          "Fill the tank at the station by the airport exit first",
          "Photograph the car from all sides at the drop-off, takes one minute",
        ],
      },
      hotel: null,
      recs: [],
    },
  ],

  /* -------------------------------------------------------------------------
     PARKS / TICKETED VENUES - the tickets page. Each ticket belongs to a
     person (key from `people`). `code` is rendered as a QR code on-device
     AND printed below it. `pass` (.pkpass file) is optional per ticket.
     ---------------------------------------------------------------------- */
  parks: [
    {
      id: "gardaland",
      name: "Gardaland",
      latin: "Gardaland Resort",
      date: "Mon Oct 5",
      time: "Gates open 10:00",
      color: "ep",
      note: "Show the code at the turnstile straight from this page. (Demo codes - they won't open any real gate.)",
      tickets: [
        { person: "omar",  code: "DEMO-TICKET-1", tariff: "Adult" },
        { person: "layla", code: "DEMO-TICKET-2", tariff: "Adult" },
        { person: "sara",  code: "DEMO-TICKET-3", tariff: "Adult" },
        { person: "noor",  code: "DEMO-TICKET-4", tariff: "Child under 10" },
      ],
      pdf: null,
    },
  ],

  /* -------------------------------------------------------------------------
     ESSENTIALS - the second tab: emergency number, shared map list,
     documents, booking numbers, phone numbers and general tips.
     ---------------------------------------------------------------------- */
  essentials: {
    emergency: { number: "112", text: "The single emergency number across Europe: police, ambulance, fire. Free from any phone." },

    /* areasMap (optional): link to a shared Google Maps list, e.g. pins of
       areas to avoid, or all your saved places. Family members save the
       list once and the pins stay visible in their Maps app. */
    areasMap: {
      url: "https://www.google.com/maps",
      title: "Your pins, on everyone's map",
      text: "Link a shared Google Maps list here - restaurants you picked, parking garages, places to avoid at night. Everyone saves it once and the pins show up in their own Maps app. (Demo link)",
      btn: "Open the list and save it",
    },

    contacts: [
      { name: "Du Lac et Du Parc (Lake Garda)", phone: "+391234567890", display: "+39 123 456 7890" },
      { name: "NH Venezia Santa Lucia", phone: "+391234567891", display: "+39 123 456 7891" },
    ],

    tips: [
      { icon: "wallet", title: "Cards and cash", text: "Cards work almost everywhere, but keep 50 EUR in coins and small notes: gelato stands, parking machines and the traghetto are cash country." },
      { icon: "car-simple", title: "The ZTL trap", text: "Italian old towns are camera-enforced no-drive zones (ZTL). Never follow the navi past a ZTL sign - park outside and walk. The fine arrives months later at home." },
      { icon: "info", title: "Water from the tap", text: "Tap water is safe everywhere, and Venice's public fountains run with cold alpine water - bring bottles and refill all day." },
      { icon: "sun", title: "October weather", text: "Lake days are warm in the sun and cool in the shade; Venice evenings get crisp. Layers win, and one rain jacket each earns its place." },
    ],

    /* Quick-copy list of every booking number in one place. */
    bookings: [
      { name: "Lake Garda resort", conf: "DEMO-52180", pin: null },
      { name: "Venice hotel", conf: "DEMO-90417", pin: null },
      { name: "Rental car", conf: "DEMO-24680", pin: null },
      { name: "Airport driver", conf: "DEMO-RIDE-1", pin: null },
    ],

    /* PDFs served from docs/ - empty list hides the section. The demo
       ships no documents; put your booking PDFs in docs/ and list them:
       { name: "Hotel booking (PDF)", file: "docs/hotel-garda.pdf" } */
    docs: [],
  },

  /* -------------------------------------------------------------------------
     DAY PLAN - one line per ISO date. During the trip, the home screen
     shows today's line at the top. Keys must be ISO dates.
     ---------------------------------------------------------------------- */
  dayplan: {
    "2026-10-03": "Travel day: takeoff 09:40, your driver waits at Verona airport, lake by lunchtime",
    "2026-10-04": "Pick up the car at 10:00, then Malcesine: old town, castle and the harbour gelato",
    "2026-10-05": "Gardaland! Leave 8:45, gates open 10:00 - tickets are on the tickets page",
    "2026-10-06": "Slow lake day: Varone waterfall in the morning, sunset cruise at 17:30",
    "2026-10-07": "Drive to Venice (2 h), park at Tronchetto - evening plan is on the Venice page",
    "2026-10-08": "Venice day: Rialto market in the morning, then get lost on purpose",
    "2026-10-09": "Home: leave by 9:00, drop the car 10:30, takeoff 13:30. Safe travels!",
  },
};
