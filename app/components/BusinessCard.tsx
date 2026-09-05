"use client";
import { useState, type ReactElement } from "react";
import Image from "next/image";
import type { Negocio } from "../lib/types";
import { formatearDistancia } from "../lib/format";
import { likeBusiness, unlikeBusiness, isApiError } from "../lib/api";
import { getToken } from "../lib/auth";

interface BusinessCardProps {
  negocio: Negocio;
}

export default function BusinessCard({ negocio }: BusinessCardProps): ReactElement {
  const [liked, setLiked] = useState(Boolean(negocio.likeadoPorMi));
  const [likes, setLikes] = useState(negocio.likes ?? 0);
  const [procesando, setProcesando] = useState(false);

  async function handleLike(): Promise<void> {
    const token = getToken();
    if (!token) {
      // Ajustá esta ruta a donde tengas el login de usuarios (no el de admin).
      window.location.href = "/login";
      return;
    }
    if (procesando) return;

    setProcesando(true);
    // Optimista: actualizamos ya, y si falla, revertimos.
    const likedAntes = liked;
    const likesAntes = likes;
    setLiked(!likedAntes);
    setLikes(likedAntes ? likesAntes - 1 : likesAntes + 1);

    try {
      const actualizado = likedAntes
        ? await unlikeBusiness(token, negocio.id)
        : await likeBusiness(token, negocio.id);
      setLiked(Boolean(actualizado.likeadoPorMi));
      setLikes(actualizado.likes ?? 0);
    } catch (err) {
      setLiked(likedAntes);
      setLikes(likesAntes);
      if (isApiError(err) && (err.status === 401 || err.status === 403)) {
        window.location.href = "/login";
      }
    } finally {
      setProcesando(false);
    }
  }

  return (
    <article className="cc-business">
      <div className="cc-business__image">
        {negocio.auspiciado && <span className="cc-business__sponsor">Auspiciado</span>}
        <button
          type="button"
          className={liked ? "cc-business__fav cc-business__fav--activo" : "cc-business__fav"}
          aria-label={liked ? "Quitar de favoritos" : "Guardar en favoritos"}
          aria-pressed={liked}
          disabled={procesando}
          onClick={() => void handleLike()}
        >
          {liked ? "♥" : "♡"}
        </button>
        <Image src={negocio.imagen} alt={negocio.nombre} fill sizes="260px" style={{ objectFit: "cover" }} />
      </div>
      <div className="cc-business__body">
        <h3>{negocio.nombre}</h3>
        <p className="cc-business__meta">
          <span>⭐ {negocio.rating.toFixed(1)}</span>
          <span>({negocio.reviews})</span>
          <span>📍 {formatearDistancia(negocio.distanciaKm)}</span>
          {likes > 0 && <span>❤️ {likes}</span>}
        </p>
        <p className="cc-business__direccion">
          {negocio.direccion ? negocio.direccion : "Dirección no cargada"}
        </p>
        {negocio.badge && <p className="cc-business__badge">{negocio.badge}</p>}
      </div>
    </article>
  );
}
