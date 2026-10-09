const base = import.meta.env.BASE_URL

export const img = (file: string) => `${base}${file}`

export const PRELOAD_IMAGES = [
  'ada.jpg',
  'grace.jpg',
  'alan.jpg',
  'margaret.jpg',
  'katherine.jpg',
  'linus.jpg',
  'boss.jpg',
  'you.jpg',
  'cookie-cutter.jpg',
].map(img)

export const CREDITS = {
  people:
    'Photos via Wikimedia Commons: Ada Lovelace by A. E. Chalon (public domain); Grace Hopper by James S. Davis, U.S. Navy (public domain); Alan Turing, possibly by A. R. Chaffin (public domain); Margaret Hamilton and Katherine Johnson by NASA (public domain); Linus Torvalds by Raysonho (CC0).',
  boss: 'Boss avatar: AI-generated image.',
  you: 'Silhouette: AI-generated image.',
  cookie: 'Photo: "Keks ausstechen" by Anna reg, CC BY-SA 3.0 AT, via Wikimedia Commons.',
  logos: 'Logos: Simple Icons (CC0). Trademarks of their respective owners.',
}
