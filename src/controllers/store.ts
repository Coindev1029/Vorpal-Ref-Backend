import { Request, Response } from "express";
import { CheckTelegramAuth } from "../utils/auth";
import { BuyItem, GetStoreItems, GetUserAllItemBalances, GetUserItemBalance, IsItemAvailableToBuy } from "../models/telegram";

export const GetStoreItemsResponce = async (req: Request, res: Response) => {
    const items = await GetStoreItems();
    res.status(200).send(JSON.stringify({
        items
    }))
}

export const BalanceResponce = async (req: Request, res: Response) => {
    const body = req.body

    if (!body.itemId || !body.login) {
        res.status(400).send("Nessesary parameters missed")
    }

    const balance = await GetUserItemBalance (body.login, body.itemId);
    res.status(200).send(JSON.stringify({
        balance: balance || 0
    }))
}

export const BalanceAllResponce = async (req: Request, res: Response) => {
    const body = req.body

    if (!body.login) {
        res.status(400).send("Nessesary parameters missed")
    }

    const balance = await GetUserAllItemBalances (body.login);
    res.status(200).send(JSON.stringify({
        balance: balance || 0
    }))
}

export const CheckAvailableResponce = async (req: Request, res: Response) => {
    const body = req.body

    if (!body.itemId || !body.login || !body.amount) {
        res.status(400).send(JSON.stringify({error: "Nessesary parameters missed"}))
    }

    const isAvailable = await IsItemAvailableToBuy (body.login, body.itemId, body.amount);
    res.status(200).send(JSON.stringify(isAvailable))
}

export const BuyResponce = async (req: Request, res: Response) => {
    const body = req.body;
    console.log("Buy request body: ", req.body);
    if (!body.telegramData || !body.telegramData.hash || !body.telegramData.username) {
        res.status(400).send(JSON.stringify({error: "Auth data wrong or not provided"}))
    }
    if (!body.itemId || !body.amount) {
        res.status(400).send(JSON.stringify({error: "Buying parameters missed"}))
    }
    if (body.amount <= 0) {
        res.status(400).send(JSON.stringify({error: "Invalid amount"}))
    }
    const auth = CheckTelegramAuth(body.telegramData);
    console.log("Auth result on buy: ", auth);
    if (!auth.success) {
        res.status(403).send(JSON.stringify({error: "Auth failed"}))
    }
    const buy = await BuyItem (body.telegramData.username, body.itemId, body.amount);
    res.status(200).send(JSON.stringify(buy));
}
