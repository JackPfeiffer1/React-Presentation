// #show
function Card(props) {
  return (
    <div className="card bordered">
      <img src={props.photo} />
      <h2>{props.name}</h2>
      <p>{props.role}</p>
    </div>
  );
}
// #endshow

export default Card;
