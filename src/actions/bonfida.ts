import { BONFIDA_API_URL_BASE, BONFIDA_OFFICIAL_AND_COMPETITION_POOLS, BONFIDA_OFFICIAL_POOLS_MAP, BOT_STRATEGY_BASE_URL, COMPETITION_BOTS_POOLS_MAP, EXTERNAL_SIGNAL_PROVIDERS_MAP, STRATEGY_TYPES, TRADING_VIEW_BOT_PERFORMANCE_ENDPOINT_BASE } from "../constants/bonfidaBots"
import { fetchPoolBalances, fetchPoolInfo, getPoolsSeedsBySigProvider, getPoolTokenMintFromSeed, PoolAssetBalance, PoolInfo } from "@bonfida/bot";
import { abbreviateAddress, apiGet, formatAmount, getTokenByName, getTokenName, getUserParsedAccounts } from "../utils/utils";
import { MARKETS, TOKEN_MINTS } from "@project-serum/serum";
import { Connection, ParsedAccountData, PublicKey, RpcResponseAndContext, TokenAmount } from "@solana/web3.js";
import { TokenInfoMap } from "@solana/spl-token-registry";
export enum PLATFORMS_ENUM {
  BONFIDA = "bonfida",
}

const PLATFORM_META = {
  bonfida: {
    label: "Bonfida",
    tokenMint: "EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp",
  },
};

type PlatformMetaData = {
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

export interface PoolTableRow {
  platform: PlatformMetaData;
  markets: PoolMarketData;
  name: PoolNameData;
  tokenPrice: TokenPrice;
  balance: Balance;
  inceptionPerformance: InceptionPerformance;
  positionValue: PositionValue;
}
export const getBonfidaPools = async (
  connection: Connection,
  walletPublicKey: PublicKey,
  tokenMap: TokenInfoMap
): Promise<PoolTableRow[]> => {
  const userTokenAccounts = await getUserParsedAccounts(
    connection,
    walletPublicKey
  );

  type TokenAccountPubkeytMapByMint = {
    [mint: string]: PublicKey;
  };

  const tokenAccountPubkeytMapByMint = userTokenAccounts.reduce<
    TokenAccountPubkeytMapByMint
  >((tokenAccountMapByMint, userTokenAccount) => {
    const mint = (userTokenAccount.account.data as ParsedAccountData).parsed
      .info.mint;
    tokenAccountMapByMint[mint] = userTokenAccount.pubkey;
    return tokenAccountMapByMint;
  }, {});
  type UserPoolBalanceMap = {
    [poolSeed: string]: RpcResponseAndContext<TokenAmount>;
  };
  const bonfidaPoolSeeds = await getPoolsSeedsBySigProvider(connection);
  const userPoolSeeds: Buffer[] = [];
  const userPoolMints: string[] = [];
  const userPoolBalanceMap: UserPoolBalanceMap = {};

  for (const seed of bonfidaPoolSeeds) {
    // some pools are in bad states and cannot be fetched
    const mint = await getPoolTokenMintFromSeed(seed).catch(() => {});
    if (mint && tokenAccountPubkeytMapByMint[mint.toBase58()]) {
      userPoolSeeds.push(seed);
      userPoolBalanceMap[mint.toBase58()] = await getUserPoolTokenBalance(
        connection,
        tokenAccountPubkeytMapByMint[mint.toBase58()]
      );
      userPoolMints.push(mint.toBase58());
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
    const seedKey = new PublicKey(seed).toBase58();
    const poolData = poolInfoMap[seedKey];
    const { poolInfo, tokenAmount, poolAssetBalance } = poolData;
    const { mintKey } = poolInfo;
    const markets = getBonfidaPoolMarketData(tokenMap, poolInfo);
    const name = getBonfidaPoolNameData(poolInfo);
    const poolSeed = new PublicKey(seed).toBase58();
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
      markets,
      name,
      platform: PLATFORM_META[PLATFORMS_ENUM.BONFIDA],
      balance,
      tokenPrice,
      inceptionPerformance,
      positionValue,
    };
    poolTableRows.push(poolRowData);
  }

  return poolTableRows;
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
  if (initialPoolTokenUsdValue == null) {
    //try to get performance data from tradingview
    const { performance } = await getTradingviewBotPerformance(poolSeed);
    if (performance.length) {
      initialPoolTokenUsdValue = performance[0].poolTokenUsdValue;
    }
  }
  const performanceValue =
    initialPoolTokenUsdValue !== null
      ? 100 * (tokenPrice / initialPoolTokenUsdValue - 1)
      : initialPoolTokenUsdValue;
  return performanceValue;
}

export const getBonfidaPoolMarketData = (tokenMap: TokenInfoMap, poolInfo:PoolInfo): PoolMarketData => {
  const { authorizedMarkets } = poolInfo;

  const markets = authorizedMarkets.map<string>((marketAddress) => {
    const market =  MARKETS.find(m => m.address.toBase58() === marketAddress.toBase58())
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

type AssetBalances = {
  [tokenSymbol: string]: {
    symbol: string,
    value: string
  }
}
export interface PositionValue {
  totalValue: number;
  assetBalances: AssetBalances
}
export const getBonfidaPoolPositionValue = (
  tokenMap: TokenInfoMap,
  tokenPice: number,
  tokenBalance: number | null,
  poolTokenAmount: TokenAmount,
  poolAssetBalance: PoolAssetBalance[]
  ): PositionValue=> {  
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

export const getUserPoolTokenBalance = async (connection: Connection, publicKey: PublicKey) => {
  const balance = await connection.getTokenAccountBalance(publicKey,"recent")
  return balance
}