import { TRADING_VIEW_BOT_PERFORMANCE_ENDPOINT_BASE } from "../constants/bonfidaBots"
import { PoolInfo } from "@bonfida/bot";
import { TokenInfo } from "@solana/spl-token-registry";
import { abbreviateAddress, marketNameFromAddress } from "../utils/utils";
import { MARKETS } from "@project-serum/serum";
import { PublicKey } from "@solana/web3.js";

type BotPerfomance = {
  time: number;
  poolSeed: string,
  poolTokenUsdValue: number
}
export type TradingBotPerformanceResponse = {
  performance: BotPerfomance[]
}

export type PoolMarketData = {
  mintA: string | undefined,
  mintB: string | undefined, 
  name: string, 
  otherMarkets: string[]
}

export const getTradingviewBotPerformance = async (poolSeed: string): Promise<TradingBotPerformanceResponse> => {
  const url = `${TRADING_VIEW_BOT_PERFORMANCE_ENDPOINT_BASE}${poolSeed}`
  const response = await fetch(url);
  return response.json()
}


export const getPoolMarkets = ( tokenMapBySympol: Map<string, string>, poolInfo:PoolInfo ): PoolMarketData => {
  const { authorizedMarkets } = poolInfo;

  const markets = authorizedMarkets.map<string>((marketAddress) => {
    const market =  MARKETS.find(m => m.address.toBase58() === marketAddress.toBase58())
    const marketName = market ? market.name : abbreviateAddress(marketAddress)
    return marketName
  })
  const displayMarket = markets[0];
  const marketSymbols = displayMarket.split("/");
  const mintA = tokenMapBySympol.get(marketSymbols[0]);
  const mintB = tokenMapBySympol.get(marketSymbols[1]);
  const otherMarkets = markets.length > 1 ? markets.slice(1) : [];

  const poolMarketData = {
      mintA,
      mintB,
      otherMarkets,
      name: displayMarket,
  }
  
  return poolMarketData;
}