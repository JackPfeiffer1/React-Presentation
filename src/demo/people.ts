export type Person = { id: string; name: string; role: string; photo: string }

export const PEOPLE: Person[] = [
  { id: 'ada', name: 'Ada Lovelace', role: 'First programmer', photo: 'ada.jpg' },
  { id: 'grace', name: 'Grace Hopper', role: 'Navy admiral, coder', photo: 'grace.jpg' },
  { id: 'alan', name: 'Alan Turing', role: 'Codebreaker', photo: 'alan.jpg' },
  { id: 'margaret', name: 'Margaret Hamilton', role: 'Apollo software lead', photo: 'margaret.jpg' },
  { id: 'katherine', name: 'Katherine Johnson', role: 'NASA mathematician', photo: 'katherine.jpg' },
  { id: 'linus', name: 'Linus Torvalds', role: 'Created Linux', photo: 'linus.jpg' },
]

export function usageLine(p: Pick<Person, 'name' | 'role' | 'photo'>): string {
  return `<Card name="${p.name}" role="${p.role}" photo="${p.photo}" />`
}
