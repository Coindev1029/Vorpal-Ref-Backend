import { Race } from "../../types";
import { runQuery } from "../connection";

export interface Star {
    id?: number;
    owner?: string; 
    name: string;
    is_live: boolean;
    creation: number;
    updated?: number | null;
    level: number;
    fuel?: number;
    level_up_fuel?: number;
    fuel_spendings?: number;
    habitable_zone_min?: number;
    habitable_zone_max?: number;
    planet_slots?: number;
    mass?: number;
    race: Race;
    coords: number[]; 
}

export async function createStar (params: Star) {
    const query = `
    INSERT INTO public.stars (
        owner, name, is_live, creation, updated, level, fuel, levelUpFuel, fuelSpendings, 
        habitable_zone_min, habitable_zone_max, planet_slots, mass, race, coords
    ) VALUES (
        '${params.owner || ''}', 
        '${params.name}', 
        ${params.is_live}, 
        to_timestamp(${params.creation}), 
        ${params.updated ? `to_timestamp(${params.updated})` : 'NULL'}, 
        ${params.level}, 
        ${params.fuel || 'NULL'}, 
        ${params.level_up_fuel || 'NULL'}, 
        ${params.fuel_spendings || 'NULL'}, 
        ${params.habitable_zone_min || 'NULL'}, 
        ${params.habitable_zone_max || 'NULL'}, 
        ${params.planet_slots || 'NULL'}, 
        ${params.mass || 'NULL'}, 
        '${params.race}', 
        '{${params.coords.join(',')}}'
    ) ;
`;
return await runQuery(query);
}

export async function setStarOwner (starId: number, newOwner: String) {
    const query = `UPDATE public.stars SET owner = '${newOwner}' WHERE id = ${starId};`;
    return await runQuery(query);   
}

export async function getAllStars () {
    const query = `SELECT * FROM public.stars;`;
    return await runQuery(query);
}

export async function updateAllStarsFuel () {
    const query = `
        UPDATE public.stars 
        SET fuel = CASE 
            WHEN fuel - fuelSpendings <= 0 THEN 0 
            ELSE fuel - fuelSpendings 
        END,
        is_live = CASE 
            WHEN fuel - fuelSpendings <= 0 THEN false 
            ELSE is_live 
        END
        WHERE is_live = true 
        RETURNING *;
    `;
    return await runQuery(query);
}