import { GetSignableMessage } from "../utils/auth";
import { web3 } from "../responces";


export async function NotifyDuelFinishFor (login: string) {
    return new Promise(async (resolve, reject) => {
        const fetch = (await import('node-fetch')).default;
        const signature = web3.eth.accounts.sign(await GetSignableMessage(), process.env.ADMIN_PRIVATE_KEY || "");
        const url = `${process.env.BATTLE_SERVER_HOST}/api/duelcancelled`
        fetch(url, {
            method: 'post',
            headers: {
                "Content-Type": "application/json"
              },
            body: JSON.stringify({
                signature,
                login
            })
        }).then((res) => {
             console.log(res)
             resolve(res.status === 200 ? true: false)   
        })
    })

}