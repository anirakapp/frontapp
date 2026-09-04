"use client";

import { useRef, useState, useMemo, type ReactElement } from "react";
import type { CalculoResponse, Negocio } from "../lib/types";
import { useNegociosCercanos } from "../hooks/useNegociosCercanos";
import { categoriasRelevantes } from "../lib/categoriasNegocio";

interface ResultModalProps {
  resultado: CalculoResponse;
  onClose: () => void;
}

function normalizarWhatsapp(numero: string | undefined): string | null {
  if (!numero) return null;

  const digitos = numero.replace(/\D/g, "");

  if (!digitos) return null;
  if (digitos.startsWith("54")) return digitos;
  if (digitos.startsWith("9")) return `54${digitos}`;

  return `549${digitos}`;
}

function ordenarPorPromoYDistancia(negocios: Negocio[]): Negocio[] {
  return [...negocios].sort((a, b) => {
    if (a.auspiciado !== b.auspiciado) return a.auspiciado ? -1 : 1;
    return a.distanciaKm - b.distanciaKm;
  });
}

export default function ResultModal({
  resultado,
  onClose,
}: ResultModalProps): ReactElement {
  const captureRef = useRef<HTMLDivElement>(null);

  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const {
    negocios,
    loading: cargandoNegocios,
    error: errorNegocios,
    sinUbicacion,
  } = useNegociosCercanos();

  const {
    negociosMostrados,
    filtradosPorCategoria,
  } = useMemo(() => {
    const habilitados = ordenarPorPromoYDistancia(
      negocios.filter((n) => n.habilitado)
    );

    const relevantes = categoriasRelevantes(resultado.menu, resultado.bebidas);

    const coinciden = habilitados.filter((n) =>
      relevantes.has(n.categoria.toLowerCase())
    );

    // Si nada coincide con lo que eligió, mostramos igual los negocios
    // cercanos que haya (mejor eso que una lista vacía sin necesidad).
    if (coinciden.length > 0) {
      return { negociosMostrados: coinciden, filtradosPorCategoria: true };
    }
    return { negociosMostrados: habilitados, filtradosPorCategoria: false };
  }, [negocios, resultado.menu, resultado.bebidas]);

  /**
   * Genera la imagen a partir solamente del contenido
   * que está dentro de captureRef (hero + resumen, nada más).
   */
  async function generateImage(): Promise<Blob | null> {
    const element = captureRef.current;

    if (!element) return null;

    try {
      const { default: html2canvas } = await import("html2canvas");

      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      return await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png", 1);
      });
    } catch (error) {
      console.error("Error generando imagen:", error);
      return null;
    }
  }

  async function handleDownload(): Promise<void> {
    setDownloading(true);
    setDownloadError(null);

    try {
      const blob = await generateImage();

      if (!blob) {
        throw new Error("No se pudo generar la imagen");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `cuanto-compro-${resultado.personas}-personas.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      setDownloadError("No se pudo generar la imagen. Intentá nuevamente.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleWhatsApp(): Promise<void> {
    setSharing(true);
    setDownloadError(null);

    try {
      const blob = await generateImage();

      if (!blob) {
        throw new Error("No se pudo generar la imagen");
      }

      const file = new File(
        [blob],
        `cuanto-compro-${resultado.personas}-personas.png`,
        { type: "image/png" }
      );

      const message = "Gracias por usar cuantosomos.app 🛒❤️";

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({ text: message, files: [file] });
        return;
      }

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      console.error("Error compartiendo:", error);
      setDownloadError(
        "No se pudo compartir la imagen. Podés descargarla y enviarla por WhatsApp."
      );
    } finally {
      setSharing(false);
    }
  }

  function handleWhatsappNegocio(negocio: Negocio): void {
    const numero = normalizarWhatsapp(negocio.whatsapp);

    if (!numero) return;

    const mensaje = `Hola ${negocio.nombre}! Te escribo desde cuantosomos.app 👋`;
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, "_blank");
  }

  return (
    <div
      className="cc-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resultado-modal-heading"
    >
      <div className="cc-modal__backdrop" onClick={onClose} />

      <div className="cc-modal__panel">
        <button
          type="button"
          className="cc-modal__close"
          onClick={onClose}
          aria-label="Cerrar resultado"
        >
          ✕
        </button>

        {/* ==================================================
            TODO LO QUE ESTÁ ACÁ ADENTRO SE CAPTURA.
            Solo hero + resumen. NO poner negocios ni acciones acá.
            ================================================== */}
        <div ref={captureRef} className="cc-modal__capture">
          <section className="cc-modal__hero">
            <span className="cc-modal__hero-badge">✓ Resultado</span>

            <h2 id="resultado-modal-heading">
              Tu compra para {resultado.personas} personas
            </h2>

            <p>Esto es lo que necesitás según lo que elegiste.</p>
          </section>

          <section className="cc-modal__resumen">
            <h3>Resumen de la compra</h3>

            <ul>
              {resultado.resumen.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>
                    {item.cantidad} {item.unidad}
                  </strong>
                </li>
              ))}
            </ul>

            {resultado.consejo && (
              <p className="cc-modal__consejo">💡 {resultado.consejo}</p>
            )}

            <div className="cc-modal__share-footer">
              <p>
                Gracias por usar <strong>cuantosomos.app</strong> ❤️
              </p>
            </div>
          </section>
        </div>

        {/* ==================================================
            ESTO NO SE CAPTURA — negocios sugeridos según lo elegido
            ================================================== */}
        <section className="cc-modal__negocios" aria-labelledby="negocios-heading">
          <h3 id="negocios-heading">Negocios sugeridos cerca tuyo</h3>

          {cargandoNegocios && <p>Buscando negocios cerca…</p>}

          {!cargandoNegocios && sinUbicacion && (
            <p>Activá tu ubicación para ver negocios sugeridos cerca tuyo.</p>
          )}

          {!cargandoNegocios && errorNegocios && (
            <p className="cc-error">{errorNegocios}</p>
          )}

          {!cargandoNegocios &&
            !sinUbicacion &&
            !errorNegocios &&
            negociosMostrados.length === 0 && (
              <p>No se encontraron negocios cerca tuyo.</p>
            )}

          {negociosMostrados.length > 0 && (
            <>
              {!filtradosPorCategoria && (
                <p className="cc-modal__negocios-nota">
                  No encontramos negocios de lo que elegiste cerca tuyo, pero sí estos:
                </p>
              )}

              <ul className="cc-negocios-list">
                {negociosMostrados.map((negocio) => {
                  const numeroWhatsapp = normalizarWhatsapp(negocio.whatsapp);

                  return (
                    <li key={negocio.id} className="cc-negocio-card">
                      <div className="cc-negocio-card__info">
                        <span className="cc-negocio-card__nombre">{negocio.nombre}</span>

                        {negocio.direccion && (
                          <span className="cc-negocio-card__direccion">
                            📍 {negocio.direccion}
                          </span>
                        )}

                        <div className="cc-negocio-card__chips">
                          {negocio.auspiciado && (
                            <span className="cc-chip cc-chip--promo">Promocionado</span>
                          )}

                          {negocio.badge && (
                            <span className="cc-chip cc-chip--oferta">{negocio.badge}</span>
                          )}

                          <span className="cc-chip">{negocio.categoria}</span>

                          <span className="cc-chip cc-chip--distancia">
                            {negocio.distanciaKm.toFixed(1)} km
                          </span>
                        </div>
                      </div>

                      {numeroWhatsapp ? (
                        <button
                          type="button"
                          className="cc-btn cc-btn--whatsapp cc-btn--small"
                          onClick={() => handleWhatsappNegocio(negocio)}
                        >
                          💬 Enviar mensaje
                        </button>
                      ) : (
                        <span className="cc-negocio-card__sin-whatsapp">
                          Este negocio no tiene WhatsApp cargado
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>

        {/* ==================================================
            ESTO NO SE CAPTURA
            ================================================== */}
        <div className="cc-modal__actions">
          <div className="cc-modal__actions-row">
            <button
              type="button"
              className="cc-btn cc-btn--primary cc-btn--compact"
              onClick={() => void handleDownload()}
              disabled={downloading || sharing}
            >
              {downloading ? "Generando…" : "📸 Descargar"}
            </button>

            <button
              type="button"
              className="cc-btn cc-btn--whatsapp cc-btn--compact"
              onClick={() => void handleWhatsApp()}
              disabled={downloading || sharing}
            >
              {sharing ? "Preparando…" : "💬 Compartir"}
            </button>
          </div>

          <button
            type="button"
            className="cc-btn cc-btn--ghost cc-btn--link"
            onClick={onClose}
          >
            Volver a editar
          </button>
        </div>

        {downloadError && (
          <p className="cc-error" role="alert">
            {downloadError}
          </p>
        )}
      </div>

      <style jsx>{`
        .cc-modal__actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px 16px 16px;
        }

        .cc-modal__actions-row {
          display: flex;
          gap: 8px;
        }

        .cc-modal__actions-row .cc-btn {
          flex: 1 1 0;
          min-width: 0;
          padding: 10px 10px;
          font-size: 14px;
          line-height: 1.2;
          border-radius: 10px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cc-btn--link {
          background: transparent;
          border: none;
          padding: 6px;
          font-size: 13px;
          text-decoration: underline;
          align-self: center;
        }

        .cc-modal__negocios-nota {
          font-size: 13px;
          opacity: 0.75;
          margin-bottom: 8px;
        }

        .cc-negocio-card__direccion {
          display: block;
          font-size: 12px;
          color: var(--cc-text-muted);
          margin-top: 2px;
        }

        @media (max-width: 420px) {
          .cc-modal__actions-row .cc-btn {
            font-size: 13px;
            padding: 9px 6px;
          }
        }
      `}</style>
    </div>
  );
}