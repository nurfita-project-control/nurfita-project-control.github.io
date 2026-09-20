import { phaseOnePlants } from "@/lib/project-data";
import {
  rabAreaRequirements,
  type RabAreaRequirement,
  type RabPlantRequirement,
} from "@/lib/rab-data.generated";

export type RequirementScope = {
  id: string;
  code: string;
  name: string;
  wing: "Selatan" | "Utara";
  soilM3: number | null;
  formationM2: number | null;
  plants: RabPlantRequirement[];
  source: "Tahap 1" | "RAB";
};

export const phaseOneScopeId = "tahap-1-selatan";

export const phaseOneScope: RequirementScope = {
  id: phaseOneScopeId,
  code: "TAHAP 1",
  name: "Lima area merah · pekerjaan mulai 21 September 2026",
  wing: "Selatan",
  soilM3: null,
  formationM2: null,
  plants: phaseOnePlants.map((plant) => ({ ...plant })),
  source: "Tahap 1",
};

export const contractAreaScopes: RequirementScope[] = rabAreaRequirements.map((area) => ({
  id: area.id,
  code: area.code,
  name: area.name,
  wing: area.wing,
  soilM3: area.soilM3,
  formationM2: area.formationM2,
  plants: area.plants,
  source: "RAB",
}));

export const allRequirementScopes = [phaseOneScope, ...contractAreaScopes];

export function normalizePlantName(value: string) {
  const normalized = value.trim().toLocaleLowerCase("id");
  const aliases: Record<string, string> = {
    "cengal pasir": "Cengal Pasir",
    damar: "Damar",
    "dracaena merah hijau": "Dracaena Merah Hijau",
    "drasaena merah hijau": "Dracaena Merah Hijau",
    "ophiopogon daun panjang": "Ophiopogon Daun Panjang",
    "ophiopoon daun pjg": "Ophiopogon Daun Panjang",
    "ophiopogon daun pjg": "Ophiopogon Daun Panjang",
    "ophiopogon kucai mini": "Ophiopogon Kucai Mini",
    "palem chamaedorea": "Palem Chamaedorea",
    "palem kamaedorea": "Palem Chamaedorea",
    "paku - pakuan": "Paku-pakuan",
    "paku-pakuan": "Paku-pakuan",
    "spatiphyllum": "Spathiphyllum",
    "ubi hias": "Ubi Hias",
  };
  if (aliases[normalized]) return aliases[normalized];
  return value.trim();
}

function aggregatePlants(areas: RabAreaRequirement[]) {
  const totals = new Map<string, RabPlantRequirement>();
  for (const area of areas) {
    for (const plant of area.plants) {
      const name = normalizePlantName(plant.name);
      const key = `${name}|${plant.unit}`;
      const current = totals.get(key);
      totals.set(key, {
        name,
        unit: plant.unit,
        quantity: (current?.quantity || 0) + plant.quantity,
      });
    }
  }
  return [...totals.values()].sort((a, b) => a.name.localeCompare(b.name, "id"));
}

export function wingRequirement(wing: "Selatan" | "Utara"): RequirementScope {
  const areas = rabAreaRequirements.filter((area) => area.wing === wing);
  return {
    id: `sayap-${wing.toLowerCase()}`,
    code: wing.toUpperCase(),
    name: `Total kontrak Sayap ${wing}`,
    wing,
    soilM3: areas.reduce((sum, area) => sum + area.soilM3, 0),
    formationM2: areas.reduce((sum, area) => sum + area.formationM2, 0),
    plants: aggregatePlants(areas),
    source: "RAB",
  };
}

export function scopeById(id: string) {
  if (id === phaseOneScopeId) return phaseOneScope;
  if (id === "sayap-selatan") return wingRequirement("Selatan");
  if (id === "sayap-utara") return wingRequirement("Utara");
  return contractAreaScopes.find((scope) => scope.id === id) || phaseOneScope;
}

export function plantUnitTotal(plants: RabPlantRequirement[], unit: string) {
  return plants
    .filter((plant) => plant.unit === unit)
    .reduce((sum, plant) => sum + plant.quantity, 0);
}

export { rabAreaRequirements };
