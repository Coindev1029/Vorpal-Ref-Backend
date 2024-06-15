import { Request, Response } from "express";
import { timeUpdateRequestLimit } from "../blockchain/config";
import { actualStarList, lastUpdateRequqstTime, UpdateLastTime, UpdateSingleStar, UpdateStars } from "../blockchain/Stars/watcher";

export const GetAllStars = (req: Request, res: Response) => {
    res.status(200).send(actualStarList); // actualStarList
 }

export const UpdateAllStars = async (req: Request, res: Response) => {
    const date = new Date().getTime();
    const timePast = date - lastUpdateRequqstTime;
    if (timePast > timeUpdateRequestLimit) {
      UpdateLastTime(date);
      await UpdateStars();
      res.status(200).send({success: true, message: 'Star update requested'});
    } else {
      res.status(200).send({success: false, message: 'Too small request interval'}); // actualStarList
    }
  }

export const UpdateOneStar = async (req: Request, res: Response) => {
  const date = new Date().getTime();
  const timePast = date - lastUpdateRequqstTime;
  try {
    if (timePast > timeUpdateRequestLimit) {
      const starId = Number(req.params.id);
      if (starId > 0 && starId < actualStarList.length) {
        UpdateLastTime(date);
        await UpdateSingleStar(Math.ceil(starId));
        res.status(200).send({success: true, message: 'Star update requested'});
      } else {
        res.status(400).send({success: false, message: 'Wrong star id'});
      }
    } else {
      res.status(200).send({success: false, message: 'Too small request interval'}); // actualStarList
    }
  } catch (e) {
    res.status(400).send({success: false, message: 'Error in processing : ' + e.message});
  }
}