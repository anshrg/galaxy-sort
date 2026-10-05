// The galaxy set. `type` is the guided-sort answer; `guided: false` means free-sort only.
// `clue` is shown when a student's choice differs from the teacher's; keep it 1–2 short
// sentences, second person, no jargon without a quick explanation.
// Images: 480×480 JPEGs in images/galaxies/, cropped/padded from the ESA/Hubble "screen" size.

export const TYPES = {
  elliptical: {
    label: 'Elliptical',
    short: 'Smooth oval or ball. No arms.',
    clue: 'A smooth, fuzzy glow shaped like a ball or an egg. No arms, no lumps.',
  },
  spiral: {
    label: 'Spiral',
    short: 'Flat disk with arms that swirl out.',
    clue: 'A flat, spinning disk with arms that wind out from a bright center. Seen from the side, it looks like a thin line.',
  },
  irregular: {
    label: 'Irregular',
    short: 'Messy and lumpy. No clear shape.',
    clue: 'No clear shape. Lumpy and patchy, often full of bright young stars. Colliding galaxies go here too.',
  },
};

export const GALAXIES = [
  {
    id: 'ic2006',
    name: 'IC 2006',
    type: 'elliptical',
    guided: true,
    clue: 'A smooth, round glow that slowly fades out at the edges. No arms and no lumps.',
    credit: 'ESA/Hubble & NASA; J. Schmidt & J. Blakeslee',
    source: 'https://esahubble.org/images/heic1508a/',
  },
  {
    id: 'm59',
    name: 'Messier 59',
    type: 'elliptical',
    guided: true,
    clue: 'A smooth, stretched-out oval. Ellipticals can be round or egg-shaped, but they’re always smooth.',
    credit: 'ESA/Hubble & NASA, P. Côté',
    source: 'https://esahubble.org/images/potw1921a/',
  },
  {
    id: 'ngc1132',
    name: 'NGC 1132',
    type: 'elliptical',
    guided: true,
    clue: 'A giant, smooth oval. The tiny dots around it are other galaxies far behind it, not arms.',
    credit: 'NASA, ESA & the Hubble Heritage (STScI/AURA)-ESA/Hubble Collaboration; M. West (ESO)',
    source: 'https://esahubble.org/images/heic0804a/',
  },
  {
    id: 'm74',
    name: 'Messier 74',
    type: 'spiral',
    guided: true,
    clue: 'See the arms winding out from the bright center? That’s a spiral, seen from straight above.',
    credit: 'NASA, ESA & the Hubble Heritage (STScI/AURA)-ESA/Hubble Collaboration',
    source: 'https://esahubble.org/images/heic0719a/',
  },
  {
    id: 'ngc1300',
    name: 'NGC 1300',
    type: 'spiral',
    guided: true,
    clue: 'A straight, bright bar across the middle, with arms curling off each end. This is a “barred spiral”. Our own Milky Way probably looks like this.',
    credit: 'NASA, ESA & the Hubble Heritage Team (STScI/AURA)',
    source: 'https://esahubble.org/images/opo0501a/',
  },
  {
    id: 'ugc11537',
    name: 'UGC 11537',
    type: 'spiral',
    guided: true,
    clue: 'A spiral seen at a tilt, like a plate held at an angle. You can still see the arms and dark dust lanes wrapping around.',
    credit: 'ESA/Hubble & NASA, A. Seth',
    source: 'https://esahubble.org/images/potw2146a/',
  },
  {
    id: 'ugc10043',
    name: 'UGC 10043',
    type: 'spiral',
    guided: true,
    tricky: true,
    clue: 'This one is easy to miss. It’s a flat spiral seen exactly from the side, like looking at a plate edge-on. The thin dark line of dust is the giveaway.',
    credit: 'ESA/Hubble & NASA, R. Windhorst, W. Keel',
    source: 'https://esahubble.org/images/potw2447a/',
  },
  {
    id: 'ngc1427a',
    name: 'NGC 1427A',
    type: 'irregular',
    guided: true,
    clue: 'No center and no arms, just a lumpy cloud of bright blue young stars.',
    credit: 'NASA, ESA & the Hubble Heritage Team (STScI/AURA)',
    source: 'https://esahubble.org/images/opo0509a/',
  },
  {
    id: 'ngc7292',
    name: 'NGC 7292',
    type: 'irregular',
    guided: true,
    clue: 'Patchy and messy with no clear shape. Irregular galaxies are often small and busy making new stars.',
    credit: 'ESA/Hubble & NASA, C. Kilpatrick',
    source: 'https://esahubble.org/images/potw2324a/',
  },
  {
    id: 'ngc4449',
    name: 'NGC 4449',
    type: 'irregular',
    guided: true,
    clue: 'Bright clumps scattered everywhere, with no pattern. The pink spots are clouds of gas where new stars are being born.',
    credit: 'NASA, ESA, A. Aloisi (STScI/ESA) & the Hubble Heritage (STScI/AURA)-ESA/Hubble Collaboration',
    source: 'https://esahubble.org/images/heic0711a/',
  },
  {
    id: 'antennae',
    name: 'The Antennae',
    type: 'irregular',
    guided: true,
    tricky: true,
    clue: 'Two spiral galaxies in the middle of a collision. The collision scrambled their shapes, so astronomers call this a “merger” and sort it with the irregulars.',
    credit: 'NASA, ESA & the Hubble Heritage Team (STScI/AURA)-ESA/Hubble Collaboration; B. Whitmore (STScI)',
    source: 'https://esahubble.org/images/heic0615a/',
  },
  {
    id: '3c273',
    name: 'Quasar 3C 273',
    type: 'quasar',
    guided: false,
    clue: 'It looks like a star, but it’s a quasar: a galaxy whose central black hole shines so brightly that it drowns out the rest of the galaxy. Its light took over 2 billion years to reach us.',
    credit: 'ESA/Hubble & NASA',
    source: 'https://esahubble.org/images/potw1346a/',
  },
];

export const imageUrl = (g) => `images/galaxies/${g.id}.jpg`;
