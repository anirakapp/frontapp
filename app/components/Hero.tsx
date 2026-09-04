import type { ReactElement } from "react";
import Image from "next/image";

export default function Hero(): ReactElement {
  return (
    <section className="cc-hero">
      <div className="cc-hero__copy">
        <h1>
          Calculá fácil
          <br />
          para tu reunión
        </h1>
        <p>Te ayudamos a saber cuánto comprar y dónde conseguirlo cerca tuyo.</p>
      </div>

      <div className="cc-hero__image" aria-hidden="true">
        <Image
          src="/assets/hero/reunion.jpg"
          alt=""
          width={520}
          height={220}
          priority
        />
      </div>
    </section>
  );
}
