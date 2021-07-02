import React, { useEffect, useState } from "react";
import {
  Connection,
  ParsedAccountData,
  PublicKey,
  TokenAmount,
} from "@solana/web3.js";
import { ReactComponent as BonfidaLogo } from "../../assets/fida.svg";
import { useConnection } from "../../contexts/connection";
import {
  fetchPoolBalances,
  fetchPoolInfo,
  getPoolsSeedsBySigProvider,
  getPoolTokenMintFromSeed,
  PoolAssetBalance,
  PoolInfo,
} from "@bonfida/bot";
import { Table } from "antd";
import {
  getUserParsedAccounts,
  marketNameFromAddress,
} from "../../utils/utils";
import {
  BONFIDA_OFFICIAL_POOLS_MAP,
  EXTERNAL_SIGNAL_PROVIDERS_MAP,
  STRATEGY_TYPES,
} from "../../constants/bonfidaBots";
import { BalanceCell } from "./BalanceCell";
import {
  cache,
  getMultipleAccounts,
  MintParser,
} from "../../contexts/accounts";
import { useWallet } from "../../contexts/wallet";
import { TokenPrice } from "./TokenPriceCell";
import { InceptionPerformanceCell } from "./InceptionPerformanceCell";
import { PositionValueCell } from "./PositionValueCell";
import { MarketsCell } from "./MarketsCell";
import { PlatformCell } from "./PlatformCell";

enum AUTOMATED_STRATEGY_PLATFORMS_ENUM {
  BONFIDA = "bonfida",
}

const PLATFORM_META = {
  bonfida: {
    label: "Bonfida",
    tokenMint: "EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp",
  },
};

export declare type PoolSeed = string;
interface PlatformMeta {
  label: string;
  tokenMint: string;
}

interface UserPoolData {
  platform: PlatformMeta;
  markets: string[];
  strategy: string;
  tokenPrice: {
    tokenAmount: TokenAmount;
    poolAssetBalance: PoolAssetBalance[];
  };
  balance: PoolInfo;
  inceptionPerformance: {
    poolSeed: PoolSeed;
    tokenAmount: TokenAmount;
    poolAssetBalance: PoolAssetBalance[];
  };
  positionValue: {
    mint: PublicKey;
    tokenAmount: TokenAmount;
    poolAssetBalance: PoolAssetBalance[];
  };
}

const getStrategyFromPool = (poolInfo: PoolInfo): string => {
  const { seed, signalProvider } = poolInfo;
  const poolSeedString = new PublicKey(seed).toBase58();
  if (BONFIDA_OFFICIAL_POOLS_MAP.hasOwnProperty(poolSeedString)) {
    return BONFIDA_OFFICIAL_POOLS_MAP[poolSeedString].strategyType;
  } else if (
    EXTERNAL_SIGNAL_PROVIDERS_MAP.hasOwnProperty(signalProvider.toBase58())
  ) {
    return EXTERNAL_SIGNAL_PROVIDERS_MAP[signalProvider.toBase58()].displayName;
  }
  return STRATEGY_TYPES.CUSTOM;
};

const getBonfidaPools = async (
  connection: Connection,
  walletPublicKey: PublicKey
): Promise<UserPoolData[]> => {
  const userTokenAccounts = await getUserParsedAccounts(
    connection,
    walletPublicKey
  );
  const userTokenMints = new Set<string>(
    userTokenAccounts.map(
      (userTokenAccount) =>
        (userTokenAccount.account.data as ParsedAccountData).parsed.info.mint
    )
  );
  const bonfidaPoolSeeds = await getPoolsSeedsBySigProvider(connection);
  const userPoolSeeds: Buffer[] = [];
  const userPoolMints: string[] = [];

  for (const seed of bonfidaPoolSeeds) {
    // some pools are in bad states and cannot be fetched
    const mint = await getPoolTokenMintFromSeed(seed).catch(() => {});
    if (mint && userTokenMints.has(mint.toBase58())) {
      userPoolSeeds.push(seed);
      userPoolMints.push(mint.toBase58());
    }
  }

  const mints = await getMultipleAccounts(connection, userPoolMints, "single");
  mints.keys.forEach((id, index) => {
    const mint = mints.array[index];
    if (mint) {
      cache.add(id, mint, MintParser);
    }
  });
  const userPoolsData = [];
  for (const seed of userPoolSeeds) {
    const poolInfo = await fetchPoolInfo(connection, seed);
    const markets = poolInfo.authorizedMarkets
      .map(marketNameFromAddress)
      .filter((e): e is string => e !== null);
    const strategy = getStrategyFromPool(poolInfo);
    const poolSeed = new PublicKey(seed).toBase58();
    const [tokenAmount, poolAssetBalance] = await fetchPoolBalances(
      connection,
      seed
    );
    const poolData = {
      markets,
      strategy,
      platform: PLATFORM_META[AUTOMATED_STRATEGY_PLATFORMS_ENUM.BONFIDA],
      balance: poolInfo,
      tokenPrice: {
        tokenAmount,
        poolAssetBalance,
      },
      inceptionPerformance: {
        poolSeed,
        tokenAmount,
        poolAssetBalance,
      },
      positionValue: {
        mint: poolInfo.mintKey,
        tokenAmount,
        poolAssetBalance,
      },
    };
    userPoolsData.push(poolData);
  }

  return userPoolsData;
};

export const AutomatedStrategies = () => {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const connection = useConnection();
  const [strategyData, setStrategyData] = useState<UserPoolData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    if (publicKey) {
      setLoading(true);
      getBonfidaPools(connection, publicKey).then((data) => {
        setStrategyData(data);
        setLoading(false);
      });
    }
  }, [connection, publicKey]);

  const columns = [
    {
      title: "Platform",
      dataIndex: "platform",
      key: "platform",
      render: (platformProps: UserPoolData["platform"]) => (
        <>
          <PlatformCell {...platformProps} />
        </>
      ),
    },
    {
      title: "Markets",
      dataIndex: "markets",
      key: "markets",
      render: (markets: UserPoolData["markets"]) => (
        <>
          <MarketsCell markets={markets} />
        </>
      ),
    },
    {
      title: "Strategy",
      dataIndex: "strategy",
      key: "strategy",
    },
    {
      title: "Token Price",
      dataIndex: "tokenPrice",
      key: "tokenPrice",
      render: ({
        tokenAmount,
        poolAssetBalance,
      }: UserPoolData["tokenPrice"]) => (
        <>
          <TokenPrice
            tokenAmount={tokenAmount}
            poolAssetBalance={poolAssetBalance}
          />
        </>
      ),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (poolInfo: PoolInfo) => (
        <>
          <BalanceCell poolInfo={poolInfo} />
        </>
      ),
    },
    {
      title: "Inception Performance",
      dataIndex: "inceptionPerformance",
      key: "inceptionPerformance",
      render: (inceptionPerfomance: UserPoolData["inceptionPerformance"]) => (
        <>
          <InceptionPerformanceCell {...inceptionPerfomance} />
        </>
      ),
    },
    {
      title: "Value of Your Positiion (USD)",
      dataIndex: "positionValue",
      key: "positionValue",
      render: (positionValue: UserPoolData["positionValue"]) => (
        <>
          <PositionValueCell {...positionValue} />
        </>
      ),
    },
  ];

  return (
    <div>
      <h1>AUTOMATED STRATEGIES MODULE</h1>
      <Table
        columns={columns}
        dataSource={strategyData}
        pagination={false}
        loading={loading}
      ></Table>
    </div>
  );
};
