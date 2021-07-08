import { BONFIDA_OFFICIAL_AND_COMPETITION_POOLS, BONFIDA_OFFICIAL_POOLS_MAP, BOT_STRATEGY_BASE_URL, COMPETITION_BOTS_POOLS_MAP, EXTERNAL_SIGNAL_PROVIDERS_MAP, STRATEGY_TYPES, TRADING_VIEW_BOT_PERFORMANCE_ENDPOINT_BASE } from "../constants/bonfidaBots"
import { fetchPoolBalances, fetchPoolInfo, getPoolsSeedsBySigProvider, getPoolTokenMintFromSeed, PoolAssetBalance, PoolInfo } from "@bonfida/bot";
import { abbreviateAddress, apiGet, formatAmount, getTokenByName, getTokenName, getTokenPrice, getUserParsedAccounts } from "../utils/utils";
import { MARKETS } from "@project-serum/serum";
//@ts-ignore
import { AWESOME_MARKETS } from '@dr497/awesome-serum-markets';
import { Connection, ParsedAccountData, PublicKey, RpcResponseAndContext, TokenAmount } from "@solana/web3.js";
import { TokenInfoMap } from "@solana/spl-token-registry";
import { PLATFORMS_ENUM, PLATFORM_META } from "../components/AutomatedStrategies";

export interface PlatformData {
  label: string;
  tokenMint: string;
};
export interface PoolMarketData {
  mintA: string | undefined;
  mintB: string | undefined;
  name: string;
  otherMarkets: string[];
}
export interface PoolNameData {
  name: string;
  poolUrl: string;
  address: PublicKey;
}
export type InceptionPerformance = number | null;
export type Balance = number | null;
export type TokenPrice = number;
export interface PositionValueData {
  totalValue: number;
  assetBalances: AssetBalances
}
export interface PoolTableRow {
  platform: PlatformData;
  markets: PoolMarketData;
  name: PoolNameData;
  tokenPrice: TokenPrice;
  balance: Balance;
  inceptionPerformance: InceptionPerformance;
  positionValue: PositionValueData;
}
interface AssetBalances {
  [tokenSymbol: string]: {
    symbol: string,
    value: string
  }
}
interface TokenAccountPubkeytMapByMint {
  [mint: string]: PublicKey;
};
interface UserPoolBalanceMap {
  [poolSeed: string]: RpcResponseAndContext<TokenAmount>;
};

export const getBonfidaPools = async (
  connection: Connection,
  walletPublicKey: PublicKey,
  tokenMap: TokenInfoMap
): Promise<PoolTableRow[]> => {
  const userTokenAccounts = await getUserParsedAccounts(
    connection,
    walletPublicKey
  );
  const tokenAccountPubkeyMapByMint = userTokenAccounts.reduce<
    TokenAccountPubkeytMapByMint
  >((tokenAccountMapByMint, userTokenAccount) => {
    const mint = (userTokenAccount.account.data as ParsedAccountData).parsed
      .info.mint;
    tokenAccountMapByMint[mint] = userTokenAccount.pubkey;
    return tokenAccountMapByMint;
  }, {});

  const bonfidaPoolSeeds = await getPoolsSeedsBySigProvider(connection);
  const userPoolSeeds: Buffer[] = [];
  const userPoolMints: string[] = [];
  const userPoolBalanceMap: UserPoolBalanceMap = {};

  for (const seed of bonfidaPoolSeeds) {
    // some pools are in bad states and cannot be fetched
    const mint = await getPoolTokenMintFromSeed(seed).catch(() => {});
    if (mint && tokenAccountPubkeyMapByMint[mint.toBase58()]) {
      const userPoolTokenBalance = await getUserPoolTokenBalance(
        connection,
        tokenAccountPubkeyMapByMint[mint.toBase58()]
      );
      if (userPoolTokenBalance.value.amount !== '0') {
        userPoolBalanceMap[mint.toBase58()] = userPoolTokenBalance
        userPoolMints.push(mint.toBase58());
        userPoolSeeds.push(seed);
      }

    }
  }
  const poolTableRows = [];
  const poolInfoMap = await createPoolDataBySeedMap(connection, userPoolSeeds);
  const allPoolAssetMints = new Set(
    Object.values(poolInfoMap)
      .map((o) => o.poolInfo.assetMintkeys)
      .flat()
  );
  // avoid making multiple api calls for same tokens
  const tokenPriceMap = await createTokenPriceMap(allPoolAssetMints);

  for (const seed of userPoolSeeds) {
    const poolSeed = new PublicKey(seed).toBase58();
    const poolData = poolInfoMap[poolSeed];
    const { poolInfo, tokenAmount, poolAssetBalance } = poolData;
    const { mintKey } = poolInfo;
    const marketsData = getBonfidaPoolMarketData(tokenMap, poolInfo);
    const nameData = getBonfidaPoolNameData(poolInfo);
    const tokenPrice = getBonfidaPoolTokenPrice(
      tokenPriceMap,
      tokenAmount,
      poolAssetBalance
    );
    const inceptionPerformance = await getInceptionPerformance(
      poolSeed,
      tokenPrice
    );
    const balance = userPoolBalanceMap[mintKey.toBase58()].value.uiAmount;
    const positionValue = getBonfidaPoolPositionValue(
      tokenMap,
      tokenPrice,
      balance,
      tokenAmount,
      poolAssetBalance
    );
    const poolRowData = {
      balance,
      tokenPrice,
      inceptionPerformance,
      positionValue,
      platform: PLATFORM_META[PLATFORMS_ENUM.BONFIDA],
      markets: marketsData,
      name: nameData,
    };
    poolTableRows.push(poolRowData);
  }
  const sortByPositionValue = (a: PoolTableRow, b: PoolTableRow) =>  b.positionValue.totalValue - a.positionValue.totalValue;
  return poolTableRows.sort(sortByPositionValue)
};

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

export const getInceptionPerformance = async (poolSeed: string, tokenPrice: number): Promise<(number | null)> => {
  let initialPoolTokenUsdValue =
    BONFIDA_OFFICIAL_AND_COMPETITION_POOLS[poolSeed]?.initialPoolTokenUsdValue || null;
  // TODO: Investigate cors issue with TRADING_VIEW_BOT_PERFORMANCE_ENDPOINT_BASE, could be blocked from non-bonfida origin
  // if (initialPoolTokenUsdValue == null) {
  //   //try to get performance data from tradingview
  //   const { performance } = await getTradingviewBotPerformance(poolSeed);
  //   if (performance.length) {
  //     initialPoolTokenUsdValue = performance[0].poolTokenUsdValue;
  //   }
  // }
  const performanceValue =
    initialPoolTokenUsdValue !== null
      ? 100 * (tokenPrice / initialPoolTokenUsdValue - 1)
      : initialPoolTokenUsdValue;
  return performanceValue;
}

export const getBonfidaPoolMarketData = (tokenMap: TokenInfoMap, poolInfo:PoolInfo): PoolMarketData => {
  const { authorizedMarkets } = poolInfo;

  const markets = authorizedMarkets.map<string>((marketAddress) => {
    const market =  MARKETS.concat(AWESOME_MARKETS).find(m => m.address.toBase58() === marketAddress.toBase58())
    const marketName = market ? market.name : abbreviateAddress(marketAddress)
    return marketName
  })
  const displayMarket = markets[0];
  const marketSymbols = displayMarket.split("/");
  const mintA = getTokenByName(tokenMap, marketSymbols[0])?.address
  const mintB = getTokenByName(tokenMap, marketSymbols[1])?.address
  const otherMarkets = markets.length > 1 ? markets.slice(1) : [];

  const poolMarketData = {
      mintA,
      mintB,
      otherMarkets,
      name: displayMarket,
  }
  
  return poolMarketData;
}

const getPoolName = (poolInfo: PoolInfo): string => {
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

export const getBonfidaPoolNameData = (poolInfo: PoolInfo): PoolNameData => {
  const { seed, address } = poolInfo;
  const poolSeed = new PublicKey(seed).toBase58();
  const name = getPoolName(poolInfo)
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
}
export interface PoolDataBySeed {
  [poolSeed: string]: PoolData
}
export const createPoolDataBySeedMap = async (connection: Connection, seeds: Buffer[]): Promise<PoolDataBySeed> => {
  const poolDataBySeed: PoolDataBySeed = {}
  for (const seed of seeds) {
    const poolInfo = await fetchPoolInfo(connection, seed);
    const [tokenAmount, poolAssetBalance] = await fetchPoolBalances(
      connection,
      seed
    );
    const poolSeed = new PublicKey(seed).toBase58()
    poolDataBySeed[poolSeed] = {
      poolInfo,
      tokenAmount,
      poolAssetBalance,
      
    }
  }
  return poolDataBySeed
}

export type TokenPriceMap = {
  [symbol: string]: number
}
export const createTokenPriceMap = async (mints: Set<PublicKey>): Promise<TokenPriceMap> => {
  const priceMap: TokenPriceMap  = {}
  for (const mint of mints) {
    const tokenPrice = await getTokenPrice(mint.toBase58())
    priceMap[mint.toBase58()] = tokenPrice
  }
  return priceMap
}
/**
* The price of a pool token is derived from the
* total value and current price of assets held by the pool
* devided by the total supply of the pool token
*/
export const getBonfidaPoolTokenPrice = (
  tokenPriceMap: TokenPriceMap,
  tokenAmount: TokenAmount,
  poolAssetBalance: PoolAssetBalance[]
  ): number => {
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


export const getBonfidaPoolPositionValue = (
  tokenMap: TokenInfoMap,
  tokenPice: number,
  tokenBalance: number | null,
  poolTokenAmount: TokenAmount,
  poolAssetBalance: PoolAssetBalance[]
  ): PositionValueData => {  
  const positionRatio = tokenBalance == null ||poolTokenAmount.uiAmount == null ? 0 : tokenBalance / poolTokenAmount.uiAmount;
  const assetBalances = poolAssetBalance.reduce<AssetBalances>(
    (acc, asset) => {
      const { tokenAmount } = asset;
      if (tokenAmount && tokenAmount.uiAmount) {
        const userAssetAmount = tokenAmount.uiAmount * positionRatio;
        const tokenSymbol = getTokenName(tokenMap, asset.mint);
        if (tokenSymbol) {
          acc[tokenSymbol] = {
            symbol: tokenSymbol,
            value: formatAmount(userAssetAmount, tokenAmount.decimals, false),
          }
        }
      }
      return acc;
    }, {});
  const totalValue = tokenBalance !== null ? tokenPice * tokenBalance : 0;
  return {totalValue, assetBalances}
}

export const getUserPoolTokenBalance = async (connection: Connection, publicKey: PublicKey) => {
  const balance = await connection.getTokenAccountBalance(publicKey,"recent")
  return balance
}