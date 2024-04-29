import { TelegramAuthData } from "types"
import { CheckTelegramAuth } from "utils/auth";

export const AuthByTelegram = (req, res) => {
    const data: TelegramAuthData = req.body;
    res.status(200).send(CheckTelegramAuth(data))
}