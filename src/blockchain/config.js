const config = {
    chainId: 97,
    rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    startBlock: 28489906,
    contracts: {
        VRPUSDT: '0x30aEF32c9590B060D43877eD19047E58cC75015b',
        VAOUSDT: '0xbAf4fBBD6a6A962FA36c5F2Bb5aa36929D7Fe14C',
        VRPBUSD: '0x6b3aD5fD39CcE379702a296d8318b3faB4b6F7B6',
        VAOBUSD: '0x0E181a04c06b81828651501b2F5B955d3d0A8d18'
    },
    saleTokens: {
        VRP: '0x7c9D9b99cD40ac20F59F9fe228ebB3e2483e970d',
        VAO: '0x0049b0e734Ae8eabee364326FbFeFb273B5f0b7e'
    },
    paymentTokens: {
        USDT: '0xCDf4F354596e68671dB43AcB64f2da14862e8403',
        BUSD: '0xAd8a6e033cbaCD0910234c596f15ef8326B7cDF1'
    }
}



module.exports = {
    config
  }