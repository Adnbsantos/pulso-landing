import { getSupabaseServer } from "./supabase";

export type CoordenadasCapturadas = {
  latitude: number;
  longitude: number;
} | null;

/**
 * Tenta capturar a localização do navegador (com a permissão da
 * pessoa). SEMPRE resolve -- nunca rejeita -- porque a captura de GPS
 * é opcional: se a pessoa negar a permissão, o dispositivo não
 * suportar, ou demorar mais que o timeout, o cadastro tem que
 * continuar normalmente, só sem a coordenada.
 */
export function capturarLocalizacao(timeoutMs = 5000): Promise<CoordenadasCapturadas> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        resolve({
          latitude: Number(posicao.coords.latitude.toFixed(6)),
          longitude: Number(posicao.coords.longitude.toFixed(6)),
        });
      },
      () => resolve(null),
      { timeout: timeoutMs, maximumAge: 60_000 }
    );
  });
}

// Distância Haversine (km) entre dois pontos -- usada só pra comparar
// e achar a RA mais PRÓXIMA (a ordem relativa importa, não o valor
// exato em si).
function distanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Dado um ponto GPS, acha a RA cujo centro está mais perto -- usa a
 * tabela regioes_administrativas.latitude_centro/longitude_centro
 * (populada em 04/08/2026 com as mesmas coordenadas já usadas no
 * pulso-app). É uma aproximação por centro, não fronteira real de RA
 * -- suficiente pra sugerir, mas por isso a pessoa sempre pode
 * corrigir na Fase 2 (é uma sugestão, não uma trava).
 */
export async function raMaisProxima(latitude: number, longitude: number): Promise<number | null> {
  const supabase = getSupabaseServer();
  const { data: ras } = await supabase
    .from("regioes_administrativas")
    .select("id, latitude_centro, longitude_centro")
    .not("latitude_centro", "is", null);

  if (!ras || ras.length === 0) return null;

  let maisPertoId: number | null = null;
  let menorDistancia = Infinity;

  for (const ra of ras) {
    const d = distanciaKm(latitude, longitude, ra.latitude_centro, ra.longitude_centro);
    if (d < menorDistancia) {
      menorDistancia = d;
      maisPertoId = ra.id;
    }
  }

  return maisPertoId;
}
