import type { ReactElement } from "react";

export default function SponsorBanner(): ReactElement {
  return (
    <section className="cc-sponsor">
      <span className="cc-sponsor__icon" aria-hidden="true">
        <img
          src="/assets/hero/negocio.jpg"
          alt=""
          className="cc-sponsor__icon-img"
        />
      </span>

      <div className="cc-sponsor__copy">
        <h3>¿Tenés un comercio?</h3>
        <p>
          Auspiciá tu negocio y llegá a miles de personas cuando más te
          necesitan.
        </p>
      </div>

      <button type="button" className="cc-sponsor__cta">
        Quiero información
      </button>
    </section>
  );
}