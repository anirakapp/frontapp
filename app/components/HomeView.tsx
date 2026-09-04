"use client";

import { useMemo, useState, type ReactElement } from "react";
import Header from "./Header";
import Hero from "./Hero";
import StepIndicator, { type StepId } from "./StepIndicator";
import PeopleForm from "./PeopleForm";
import MenuSelector from "./MenuSelector";
import DrinksSelector from "./DrinksSelector";
import SummarySidebar from "./SummarySidebar";
import BusinessesSection from "./BusinessesSection";
import SponsorBanner from "./SponsorBanner";
import Footer from "./Footer";
import ResultModal from "./ResultModal";
import { postCalculo, isApiError } from "../lib/api";
import { DEFAULT_DRINKS } from "../lib/drinksData";
import type { CalculoResponse } from "../lib/types";

interface HomeViewProps {
  ciudad: string;
}

export default function HomeView({ ciudad }: HomeViewProps): ReactElement {
  const [adultos, setAdultos] = useState(42);
  const [ninos, setNinos] = useState(8);
  const [menuSeleccionado, setMenuSeleccionado] = useState<string[]>(["asado"]);
  const [bebidasSeleccionadas, setBebidasSeleccionadas] =
    useState<string[]>(DEFAULT_DRINKS);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDrinksError, setShowDrinksError] = useState(false);
  const [resultado, setResultado] = useState<CalculoResponse | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const personas = adultos + ninos;

  const completedSteps = useMemo<StepId[]>(() => {
    const done: StepId[] = [];
    if (personas > 0) done.push("personas");
    if (menuSeleccionado.length > 0) done.push("menu");
    if (bebidasSeleccionadas.length > 0) done.push("bebidas");
    if (resultado) done.push("resultado");
    return done;
  }, [personas, menuSeleccionado, bebidasSeleccionadas, resultado]);

  const activeStep: StepId = resultado ? "resultado" : "personas";

  async function handleCalcular(): Promise<void> {
    setErrorMessage(null);

    if (bebidasSeleccionadas.length === 0) {
      setShowDrinksError(true);
      return;
    }
    setShowDrinksError(false);

    setLoading(true);
    try {
      // El cálculo real (cantidades) lo hace el backend: index.js -> routes -> controllers.
      const data = await postCalculo({
        personas,
        adultos,
        ninos,
        menu: menuSeleccionado,
        bebidas: bebidasSeleccionadas,
      });
      setResultado(data);
      setModalOpen(true);
    } catch (error) {
      const message = isApiError(error)
        ? error.message
        : "No pudimos calcular tu compra. Verificá que el backend esté corriendo.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cc-page">
      <Header ciudad={ciudad} />

      <main className="cc-main">
        <Hero />

        <div className="cc-layout">
          <div className="cc-card">
            <StepIndicator completed={completedSteps} active={activeStep} />

            <PeopleForm
              adultos={adultos}
              ninos={ninos}
              onChangeAdultos={setAdultos}
              onChangeNinos={setNinos}
            />

            <MenuSelector
              selected={menuSeleccionado}
              onChange={setMenuSeleccionado}
            />

            <DrinksSelector
              selected={bebidasSeleccionadas}
              onChange={setBebidasSeleccionadas}
              showRequiredError={showDrinksError}
            />

            <button
              type="button"
              className="cc-btn cc-btn--calcular"
              onClick={() => void handleCalcular()}
              disabled={loading}
            >
              {loading ? "Calculando…" : "Calcular mi compra"}
              <span aria-hidden="true">→</span>
            </button>

            {errorMessage && (
              <p className="cc-error" role="alert">
                {errorMessage}
              </p>
            )}
          </div>

          <SummarySidebar personas={personas} resultado={resultado} loading={loading} />
        </div>

        <BusinessesSection ciudad={ciudad} />
        <SponsorBanner />
      </main>

      <Footer />

      {modalOpen && resultado && (
        <ResultModal resultado={resultado} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
