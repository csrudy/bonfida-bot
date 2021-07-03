import { BONFIDA_OFFICIAL_POOLS_MAP, BOT_STRATEGY_BASE_URL, COMPETITION_BOTS_POOLS_MAP, EXTERNAL_SIGNAL_PROVIDERS_MAP, STRATEGY_TYPES, TRADING_VIEW_BOT_PERFORMANCE_ENDPOINT_BASE } from "../constants/bonfidaBots"
import { PoolInfo } from "@bonfida/bot";
import { abbreviateAddress } from "../utils/utils";
import { MARKETS } from "@project-serum/serum";
import { PublicKey } from "@solana/web3.js";
import { PoolMarketData } from "../types/automatedStrategies";

type BotPerfomance = {
  time: number;
  poolSeed: string,
  poolTokenUsdValue: number
}
export type TradingBotPerformanceResponse = {
  performance: BotPerfomance[]
}



export const getTradingviewBotPerformance = async (poolSeed: string): Promise<TradingBotPerformanceResponse> => {
  const url = `${TRADING_VIEW_BOT_PERFORMANCE_ENDPOINT_BASE}${poolSeed}`
  const response = await fetch(url);
  return response.json()
}

export const getBonfidaPoolMarketData = ( tokenMapBySympol: Map<string, string>, poolInfo:PoolInfo ): PoolMarketData => {
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

const getBotName = (poolInfo: PoolInfo): string => {
  const { seed, signalProvider } = poolInfo;
  const poolSeedString = new PublicKey(seed).toBase58();
  if (BONFIDA_OFFICIAL_POOLS_MAP.hasOwnProperty(poolSeedString)) {
    return BONFIDA_OFFICIAL_POOLS_MAP[poolSeedString].name;
  } else if (
    COMPETITION_BOTS_POOLS_MAP.hasOwnProperty(poolSeedString)
  ) {
    return COMPETITION_BOTS_POOLS_MAP[poolSeedString].name;
  }
   else if (
    EXTERNAL_SIGNAL_PROVIDERS_MAP.hasOwnProperty(signalProvider.toBase58())
  ) {
    return EXTERNAL_SIGNAL_PROVIDERS_MAP[signalProvider.toBase58()].displayName;
  }
  return STRATEGY_TYPES.CUSTOM;
};

export const getBonfidaPoolNameData = (poolInfo: PoolInfo) => {
  const { seed, address } = poolInfo;
  const poolSeed = new PublicKey(seed).toBase58();
  const name = getBotName(poolInfo)
  const poolUrl = BOT_STRATEGY_BASE_URL + poolSeed;
  const poolNameData = {
    name,
    poolUrl,
    address
  }
  return poolNameData
}

