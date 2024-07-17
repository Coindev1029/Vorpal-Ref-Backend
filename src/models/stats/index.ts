import { runQuery } from '../../models/connection';
import { DuelPlayerStats, PlayerSummaryStats } from '../../types';

export async function addDuelPlayerStats(
  stats: DuelPlayerStats[],
): Promise<any[] | null> {
  if (stats.length === 0) return null;
  const values = stats
    .map(
      (stat) =>
        `('${stat.duel_id}', '${stat.player}', ${stat.damage_total}, ${stat.experience}, ${stat.gold})`,
    )
    .join(', ');

  const query = `
      INSERT INTO duel_player_stats (duel_id, player, damage_total, experience, gold)
      VALUES ${values}
      RETURNING *;
  `;
  return await runQuery(query);
}

export async function getDuelStatsByDuelId(
  duel_id: string,
): Promise<DuelPlayerStats[] | null> {
  const query = `
      SELECT * FROM duel_player_stats
      WHERE duel_id = '${duel_id}';
    `;
  const result = await runQuery(query);
  return result ? (result as DuelPlayerStats[]) : null;
}

export async function getDuelStatsByPlayerId(
    player: string,
  ): Promise<DuelPlayerStats[] | null> {
    const query = `
        SELECT * FROM duel_player_stats
        WHERE player = '${player}';
      `;
    const result = await runQuery(query);
    return result ? (result as DuelPlayerStats[]) : null;
  }
  

export async function getPlayerAggregateStats(
  player: string,
): Promise<PlayerSummaryStats | null> {
  const query = `
      SELECT 
        player,
        SUM(damage_total) AS total_damage,
        SUM(experience) AS total_experience,
        SUM(gold) AS total_gold
      FROM duel_player_stats
      WHERE player = '${player}'
      GROUP BY player;
    `;
  const result = await runQuery(query);
  if (result && result.length > 0) {
    return result[0] as PlayerSummaryStats;
  }
  return null;
}
