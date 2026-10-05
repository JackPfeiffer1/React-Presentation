import { img } from '../assets/images'
import type { Person } from '../demo/people'

/** The plain HTML/CSS profile card from before React: same markup the editor on slide 2 shows. */
export function HtmlCard({ person, bordered = false }: { person: Person; bordered?: boolean }) {
  return (
    <div className={`card ${bordered ? 'bordered' : ''}`}>
      <img src={img(person.photo)} alt="" />
      <h2>{person.name}</h2>
      <p>{person.role}</p>
    </div>
  )
}
