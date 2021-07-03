import React, { useEffect, useState } from "react";
import {
  Connection,
  ParsedAccountData,
  PublicKey,
  TokenAmount,
} from "@solana/web3.js";
import { useConnection, useConnectionConfig } from "../../contexts/connection";
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
  TokenAccountParser,
} from "../../contexts/accounts";
import { useWallet } from "../../contexts/wallet";
import { TokenPrice } from "./TokenPriceCell";
import { InceptionPerformanceCell } from "./InceptionPerformanceCell";
import { PositionValueCell } from "./PositionValueCell";
import { MarketsCell } from "./MarketsCell";
import { PlatformCell } from "./PlatformCell";
import { BotNameCell } from "./BotNameCell";
import { getPoolMarkets, PoolMarketData } from "../../actions/bonfida";

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

interface PoolRow {
  platform: PlatformMeta;
  markets: PoolMarketData;
  name: {
    name: string;
    poolSeed: string;
    address: PublicKey;
  };
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

const getBotName = (poolInfo: PoolInfo): string => {
  const { seed, signalProvider } = poolInfo;
  const poolSeedString = new PublicKey(seed).toBase58();
  if (BONFIDA_OFFICIAL_POOLS_MAP.hasOwnProperty(poolSeedString)) {
    return BONFIDA_OFFICIAL_POOLS_MAP[poolSeedString].name;
  } else if (
    EXTERNAL_SIGNAL_PROVIDERS_MAP.hasOwnProperty(signalProvider.toBase58())
  ) {
    return EXTERNAL_SIGNAL_PROVIDERS_MAP[signalProvider.toBase58()].displayName;
  }
  return STRATEGY_TYPES.CUSTOM;
};

const getBonfidaPools = async (
  connection: Connection,
  walletPublicKey: PublicKey,
  tokenMapBySympol: Map<string, string>
): Promise<PoolRow[]> => {
  const userTokenAccounts = await getUserParsedAccounts(
    connection,
    walletPublicKey
  );
  // userTokenAccounts.forEach((account, index) => {
  //   cache.add(account.pubkey, account, TokenAccountParser);
  // });
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
  const poolRows = [];
  for (const seed of userPoolSeeds) {
    const poolInfo = await fetchPoolInfo(connection, seed);
    const markets = getPoolMarkets(tokenMapBySympol, poolInfo);
    const botName = getBotName(poolInfo);
    const poolSeed = new PublicKey(seed).toBase58();
    const [tokenAmount, poolAssetBalance] = await fetchPoolBalances(
      connection,
      seed
    );
    const poolData = {
      markets,
      name: {
        poolSeed,
        name: botName,
        address: poolInfo.address,
      },
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
    poolRows.push(poolData);
  }

  return poolRows;
};

export const AutomatedStrategies = () => {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const { tokenMap } = useConnectionConfig();
  const tokenMapBySympol = new Map<string, string>();
  tokenMap.forEach((tokenInfo, mint) => {
    tokenMapBySympol.set(tokenInfo.symbol, mint);
  });
  const connection = useConnection();
  const [strategyData, setStrategyData] = useState<PoolRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    if (publicKey) {
      setLoading(true);
      getBonfidaPools(connection, publicKey, tokenMapBySympol).then((data) => {
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
      render: (platformProps: PoolRow["platform"]) => (
        <>
          <PlatformCell {...platformProps} />
        </>
      ),
    },
    {
      title: "Markets",
      dataIndex: "markets",
      key: "markets",
      render: (markets: PoolRow["markets"]) => (
        <>
          <MarketsCell {...markets} />
        </>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (nameProps: PoolRow["name"]) => (
        <>
          <BotNameCell {...nameProps} />
        </>
      ),
    },
    {
      title: "Token Price",
      dataIndex: "tokenPrice",
      key: "tokenPrice",
      render: ({ tokenAmount, poolAssetBalance }: PoolRow["tokenPrice"]) => (
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
      render: (inceptionPerfomance: PoolRow["inceptionPerformance"]) => (
        <>
          <InceptionPerformanceCell {...inceptionPerfomance} />
        </>
      ),
    },
    {
      title: "Value of Your Positiion (USD)",
      dataIndex: "positionValue",
      key: "positionValue",
      render: (positionValue: PoolRow["positionValue"]) => (
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
