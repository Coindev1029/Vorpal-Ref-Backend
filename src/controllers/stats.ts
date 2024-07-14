import { Request, Response } from "express";
import { IsAdminBySignature } from "./common";
import { DuelPlayerStats } from "../types";
import { addDuelPlayerStats, getDuelStatsByDuelId, getDuelStatsByPlayerId, getPlayerAggregateStats } from "../models/stats";

export const addStats = async (req: Request, res: Response) => {
    try {
      const body = req.body;
      if (!body.signature || !(await IsAdminBySignature(body.signature))) {
        res.status(403).send({ error: "No rights to add" });
        return;
      }
      const stats: DuelPlayerStats[] = body.stats;
      try {
        const result = await addDuelPlayerStats(stats);
        if (result) {
            res.status(200).send({success: true })
            return;
        } else {
            res.status(403).send({error: "Failed to write statistics" })
            return;
        }
      } catch (e) {
        res.status(500).send({ error: "Failed to write statistics" })
        return;
      }
    } catch (e) {
        console.log(e);
        res.status(500).send({ error: "Server error" })
        return;
    }
}

export const getStatsByDuel = async (req: Request, res: Response) => {
    const params = req.params;
    if (!params.duelId) {
        res.status(400).send({ error: "Duel id is nessesary" });
        return;
    }
    try {
        const stats = await getDuelStatsByDuelId(params.duelId);
        if (stats) {
          res.status(200).send({stats});
        } else {
          res.status(404).send({ error: "No stats found for the given player" });
        }
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: "An error occurred while fetching stats" });
        return;
    }
}

export const getStatsByPalyer = async (req: Request, res: Response) => {
    const params = req.params;
    if (!params.player) {
        res.status(400).send({ error: "Player id is nessesary" });
        return;
    }

    try {
        const stats = await getDuelStatsByPlayerId(params.player);
        if (stats) {
          res.status(200).send({stats});
        } else {
          res.status(404).send({ error: "No stats found for the given player" });
        }
      } catch (e) {
        console.error(e);
        res.status(500).send({ error: "An error occurred while fetching stats" });
        return;
      }
}

export const getSAggregateStatsByPalyer = async (req: Request, res: Response) => {
    const { player } = req.params;

    if (!player) {
      res.status(400).send({ error: "Player id is required" });
      return;
    }
  
    try {
      const stats = await getPlayerAggregateStats(player);
      if (stats) {
        res.status(200).send({stats});
      } else {
        res.status(404).send({ error: "No stats found for player" });
      }
    } catch (e) {
      console.error(e);
      res.status(500).send({ error: "Штеуктфд ыукмук уккщк" });
    }
}