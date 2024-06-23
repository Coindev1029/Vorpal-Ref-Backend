import { Request, Response } from "express";
import { GetChannelSubscribeList } from "../telegram/handlers/subscribe";
import { TelegramAuthData } from "../types"
import { CheckTelegramAuth, GetSignableMessage, ValidateByInitData } from "../utils/auth";
import { web3 } from "./duel";

export const AuthByTelegram = (req: Request, res: Response) => {

    const data: TelegramAuthData = req.body;
    res.status(200).send(CheckTelegramAuth(data))
}

export const IsNeedSubscribes = async (req: Request, res: Response) => {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
        res.status(400).send(JSON.stringify({
            error: "Invalid user id"
        }))
    }
    const subscribes = await GetChannelSubscribeList(userId);
    const isSubscribed = (subscribes.length === 0) ? true : false;
    res.status(200).send({
        subscribed: isSubscribed
    })
}

export const UniversalAuth = async (req: Request, res: Response) => { 
    const body = req.body;
    if (!body.signature && !body.telegramData && !body.telegramInitData) {
        res.status(400).send(JSON.stringify({error: "Auth data wrong or not provided"}))
    }
    if (body.signature) {
        const msg = GetSignableMessage();
        const address = body.signature ? web3.eth.accounts.recover(msg, body.signature)
        .toLowerCase() : "";
        return address;
    }

    if (body.telegramInitData) {
        console.log("Validation result: ", ValidateByInitData (body.telegramInitData))
        console.log("Entered data: ", body.telegramInitData)
        const validationResult = ValidateByInitData (body.telegramInitData);
        if (!validationResult) {
            return null
        }
        try {
            const parsedData = JSON.parse(body.telegramInitData);
            console.log("Parsed: ", parsedData);
            return parsedData.username || parsedData.id
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    if (body.telegramData) {
       return CheckTelegramAuth(body.telegramData).success ? body.telegramData.username || body.telegramData.id : null
    }
}