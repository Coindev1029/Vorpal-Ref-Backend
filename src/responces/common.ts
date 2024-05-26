import { GetChannelSubscribeList } from "../telegram/handlers/subscribe";
import { TelegramAuthData } from "../types"
import { CheckTelegramAuth } from "../utils/auth";

export const AuthByTelegram = (req, res) => {

    const data: TelegramAuthData = req.body;
    res.status(200).send(CheckTelegramAuth(data))
}

export const IsNeedSubscribes = async (req, res) => {
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