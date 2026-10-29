function Header() {
  return (
    <header className="hero">
      <div className="hero-copy">
        <p className="hero-kicker">
          <span className="kicker-mark" aria-hidden="true">CS / 01</span>
          The engineering field guide
        </p>
        <h1>Computer Science<br /><em>Roadmap</em></h1>
        <p className="hero-description">
          A practical map through the ideas, tools, and craft behind modern
          computing. Choose a direction. Build your way forward.
        </p>
      </div>
      <div className="route-illustration" aria-hidden="true">
        <span className="route-label route-label-start">START HERE</span>
        <span className="route-node route-node-start" />
        <span className="route-line route-line-one" />
        <span className="route-node route-node-middle" />
        <span className="route-line route-line-two" />
        <span className="route-node route-node-end" />
        <span className="route-label route-label-end">MAKE SOMETHING</span>
        <span className="route-coordinate">A FIELD GUIDE TO COMPUTING</span>
      </div>
    </header>
  );
}

export default Header;
