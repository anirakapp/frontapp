import type { ReactElement } from "react";
import Image from "next/image";
import "../styles/hero.css";

export default function Hero(): ReactElement {
  return (
    <section className="cc-hero">
      <div className="cc-hero__copy">
        <h1 className="cc-hero__title">
          Calculá fácil
          <br />
          para tu reunión
        </h1>

        <p className="cc-hero__lead">
          Te ayudamos a saber{" "}
          <span className="cc-hero__rotator" aria-live="polite">
            <span className="cc-hero__rotator-item cc-hero__rotator-item--a">
             cuánto necesitás comprar.
            </span>
            <span className="cc-hero__rotator-item cc-hero__rotator-item--b">
              dónde conseguirlo cerca tuyo.
            </span>
          </span>
        </p>
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
