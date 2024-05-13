import { BuyItem, GetStoreItems, GetUserItemBalance, IsItemAvailableToBuy } from "../database/telegram"

export const GetStoreItemsResponce = async (req, res) => {
    const items = await GetStoreItems();
    res.status(200).send(JSON.stringify({
        items
    }))
}

export const BalanceResponce = async (req, res) => {
    const body = req.body

    if (!body.itemId || !body.login) {
        res.status(400).send("Nessesary parameters missed")
    }

    const balance = await GetUserItemBalance (body.login, body.itemId);
    res.status(200).send(JSON.stringify({
        balance: balance || 0
    }))
}

export const CheckAvailableResponce = async (req, res) => {
    const body = req.body

    if (!body.itemId || !body.login || !body.amount) {
        res.status(400).send("Nessesary parameters missed")
    }

    const isAvailable = await IsItemAvailableToBuy (body.login, body.itemId, body.amount);
    res.status(200).send(JSON.stringify(isAvailable))
}

export const BuyResponce = async (req, res) => {
    const body = req.body
    if (!body.telegramData || !body.telegramData.hash || body.telegramData.username) {
        res.status(400).send("Auth data wrong or not provided")
    }
    if (!body.itemId || !body.amount) {
        res.status(400).send("Buying parameters missed")
    }
    if (body.amount <= 0) {
        res.status(400).send("Invalid amount")
    }
    const buy = await BuyItem (body.telegramData.username, body.itemId, body.amount);
    res.status(200).send(JSON.stringify(buy));
}
