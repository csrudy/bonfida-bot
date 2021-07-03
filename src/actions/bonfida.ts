import { BONFIDA_API_URL_BASE, BONFIDA_OFFICIAL_POOLS_MAP, BOT_STRATEGY_BASE_URL, COMPETITION_BOTS_POOLS_MAP, EXTERNAL_SIGNAL_PROVIDERS_MAP, STRATEGY_TYPES, TRADING_VIEW_BOT_PERFORMANCE_ENDPOINT_BASE } from "../constants/bonfidaBots"
import { fetchPoolBalances, fetchPoolInfo, PoolAssetBalance, PoolInfo } from "@bonfida/bot";
import { abbreviateAddress, apiGet } from "../utils/utils";
import { MARKETS, TOKEN_MINTS } from "@project-serum/serum";
import { Connection, PublicKey, TokenAmount } from "@solana/web3.js";
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
  const response = await apiGet(url);
  return response
}

export const getBonfidaPoolMarketData = ( tokenMintMapBySympol: Map<string, string>, poolInfo:PoolInfo ): PoolMarketData => {
  const { authorizedMarkets } = poolInfo;

  const markets = authorizedMarkets.map<string>((marketAddress) => {
    const market =  MARKETS.find(m => m.address.toBase58() === marketAddress.toBase58())
    const marketName = market ? market.name : abbreviateAddress(marketAddress)
    return marketName
  })
  const displayMarket = markets[0];
  const marketSymbols = displayMarket.split("/");
  const mintA = tokenMintMapBySympol.get(marketSymbols[0]);
  const mintB = tokenMintMapBySympol.get(marketSymbols[1]);
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
export type PoolData = {
  poolInfo: PoolInfo;
  tokenAmount: TokenAmount;
  poolAssetBalance: PoolAssetBalance[]
  assetMints: string[]
}
export interface PoolDataBySeed {
  [poolSeed: string]: PoolData
}
export const createPoolDataBySeedMap = async (connection: Connection, seeds: Buffer[]): Promise<PoolDataBySeed> => {
  const poolInfoBySeed: PoolDataBySeed = {}
  for (const seed of seeds) {
    const poolInfo = await fetchPoolInfo(connection, seed);
    const [tokenAmount, poolAssetBalance] = await fetchPoolBalances(
      connection,
      seed
    );
    const assetMints = poolAssetBalance.map<string>(assetBalance=> assetBalance.mint)
    const poolSeed = new PublicKey(seed).toBase58()
    poolInfoBySeed[poolSeed] = {
      poolInfo,
      tokenAmount,
      poolAssetBalance,
      assetMints
    }
  }
  return poolInfoBySeed
}

export type TokenPriceMap = {
  [symbol: string]: number
}
export const createTokenPriceMap = async (mints: Set<string>): Promise<TokenPriceMap> => {
  const priceMap: TokenPriceMap  = {}
  for (const mint of mints) {
    const tokenPrice = await getTokenPrice(mint)
    priceMap[mint] = tokenPrice
  }
  return priceMap
}

export const getBonfidaPoolTokenPrice = (tokenPriceMap: TokenPriceMap, tokenAmount: TokenAmount, poolAssetBalance: PoolAssetBalance[]) => {
  let totalValueOfPool = 0;
  for (const assetBalance of poolAssetBalance) {
    const price = tokenPriceMap[assetBalance.mint]
    if (assetBalance.tokenAmount.uiAmount) { 
      totalValueOfPool += price * assetBalance.tokenAmount.uiAmount
    }
  }
  const tokenPrice = tokenAmount.uiAmount
    ? totalValueOfPool / tokenAmount.uiAmount
    : 0;
  return tokenPrice;
}

export const getTokenPrice = async (mintAddress: string): Promise<number> => {
  const token = TOKEN_MINTS.find((a) => a.address.toBase58() === mintAddress);

  if (!token) {
    throw new Error('Token does not exist');
  }

  if (['USDC', 'USDT'].includes(token?.name || '')) {
    return 1.0;
  }

  try {
    const result = await apiGet(
      `${BONFIDA_API_URL_BASE}orderbooks/${token.name}USDC`,
    );
    if (!result.success) {
      throw new Error('Error getting price');
    }
    const { bids, asks } = result.data;
    if (!bids || !asks) {
      throw new Error('Error getting price');
    }
    return (bids[0].price + asks[0].price) / 2;
  } catch (err) {
    console.log(`Error getting midPrice err`);
    throw new Error('Error getting price');
  }
};
