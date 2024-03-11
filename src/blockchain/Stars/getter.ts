import Web3 from "web3";
import { opBSCData } from "../../blockchain/config";
import { StarNFTABI } from "./ABI";
import { Race, StarData, StarList, StarParams } from "../../types";


const contracts = {
    plasma: "0xE9497F5387074d5eEbb25e9D0a471E88797cb3FB",
    starNFT: "0x0EE0275faCF743F774fC3aeF5F54eAF7e0E7072d"
}

const nft = contracts.starNFT
const reader = new Web3()

reader.setProvider(new Web3.providers.HttpProvider(opBSCData.rpcUrl));
const contract = new reader.eth.Contract(StarNFTABI, nft);

export function ExtractRace ( str : string) : Race {
    switch (str) {
        case "Waters" :
            return "Waters";
        case "Humans" :
            return "Waters";
        case "Insects" :
            return "Insects";
        case "Lizards":
            return "Lizards";
    default:
        throw new Error("wrong race")
    }
}


export async function GetAllStarData () : Promise<StarList> {
    return new Promise(async (reslove, reject) => {
        const stars : StarList = []
        let cntr = 0
        GetStarsCount ().then(async (total) => {
            while (cntr < total) {
                try {
                   const dt : any[] = await contract.methods.GetStarParams(cntr.toString()).call()
                   if(!dt[10]) {  // Planet slots always larger than zero
                      break;
                   }
       
                   const starParams : StarParams = {
                       name: String(dt[0]),
                       isLive: Boolean(dt[1]),
                       creation: Number(dt[2]),
                       updated: Number(dt[3]),
                       level: Number(dt[4]),
                       fuel: Number(dt[5]),
                       levelUpFuel: Number(dt[6]),
                       fuelSpendings: Number(dt[7]),
                       habitableZoneMin: Number(dt[8]),
                       habitableZoneMax: Number(dt[9]),
                       planetSlots: Number(dt[10]),
                       mass: Number(dt[11]),
                       race: ExtractRace(dt[12]),
                       coords: {
                           X: (Number(dt[13][0]) / 1000000) - 1000000,
                           Y: (Number(dt[13][1]) / 1000000) - 1000000,
                           Z: (Number(dt[13][2]) / 1000000) - 1000000
                       }
                   }
                   const owner : string = await contract.methods.ownerOf(cntr.toString()).call()
                   const starData : StarData = {
                       id: cntr,
                       owner: owner,
                       params: starParams
                   }
                   stars.push(starData)
                   cntr += 1
                } catch (e) {
                   break;
                }
            }
            reslove(stars);
        }).catch(e => {
            reject(e)
        })
    })
}

export async function GetStarsCount () : Promise<number> {
    return new Promise(async (reslove, reject) => {
        try {
            const contract = new reader.eth.Contract(StarNFTABI, nft)
            const count : number = Number(await contract.methods.GetTotalStarCount().call())
            reslove(count) 
        } catch(e) {
            reject(e.message)
        }
    })
}

export async function GetSingleStarData ( starId : number ) : Promise<StarData | null> {
    return new Promise(async (resolve, reject) => {
        try {
            const dt : any[] = await contract.methods.GetStarParams(starId.toString()).call()
            if(!dt[10]) { 
               reject("Received data is invalid")
               return null
            }
            const starParams : StarParams = {
                name: String(dt[0]),
                isLive: Boolean(dt[1]),
                creation: Number(dt[2]),
                updated: Number(dt[3]),
                level: Number(dt[4]),
                fuel: Number(dt[5]),
                levelUpFuel: Number(dt[6]),
                fuelSpendings: Number(dt[7]),
                habitableZoneMin: Number(dt[8]),
                habitableZoneMax: Number(dt[9]),
                planetSlots: Number(dt[10]),
                mass: Number(dt[11]),
                race: ExtractRace(dt[12]),
                coords: {
                    X: (Number(dt[13][0]) / 1000000) - 1000000,
                    Y: (Number(dt[13][1]) / 1000000) - 1000000,
                    Z: (Number(dt[13][2]) / 1000000) - 1000000
                }
            }
            const owner : string = await contract.methods.ownerOf(starId.toString()).call()
            const starData : StarData = {
                id: starId,
                owner: owner,
                params: starParams
            }
            resolve(starData)
         } catch (e) {
            reject(e.message)
         }
    })
}