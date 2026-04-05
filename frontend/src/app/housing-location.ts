export interface HousingLocationInfo {
  id: number;
  urlImagenCampeon: string;
  nombre: string;
  clases: string[];
  fechaLanzamiento: string;
  ultimoCambio: string;
  esenciaAzul: number;
  riotPoints: number;
  lolUrl: string;
  habilidades: ChampionAbility[];
}

export interface ChampionAbility {
  habilidad: string;
  nombre: string;
  descripcion: string;
  urlImagenHabilidad: string;
}