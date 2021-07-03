import React, { useEffect, useRef, useState } from "react";
import {
  Connection,
  ParsedAccountData,
  PublicKey,
  RpcResponseAndContext,
  TokenAmount,
} from "@solana/web3.js";
import { useConnection, useConnectionConfig } from "../../contexts/connection";
import {
  getPoolsSeedsBySigProvider,
  getPoolTokenMintFromSeed,
  PoolAssetBalance,
} from "@bonfida/bot";
import { Table } from "antd";
import { getUserParsedAccounts } from "../../utils/utils";
import { useWallet } from "../../contexts/wallet";
import { TokenPrice } from "./TokenPriceCell";
import { InceptionPerformanceCell } from "./InceptionPerformanceCell";
import { PositionValueCell } from "./PositionValueCell";
import { MarketsCell } from "./MarketsCell";
import { PlatformCell } from "./PlatformCell";
import { BotNameCell } from "./BotNameCell";
import {
  getBonfidaPoolNameData,
  getBonfidaPoolMarketData,
  getBonfidaPoolTokenPrice,
  createTokenPriceMap,
  createPoolDataBySeedMap,
  getUserPoolTokenBalance,
  getBonfidaPoolPositionValue,
  PositionValue,
} from "../../actions/bonfida";
import { PoolMarketData, PoolNameData } from "../../types/automatedStrategies";

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

interface PoolTableRow {
  platform: PlatformMetaData;
  markets: PoolMarketData;
  name: PoolNameData;
  tokenPrice: number;
  balance: number | null;
  inceptionPerformance: {
    poolSeed: string;
    tokenAmount: TokenAmount;
    poolAssetBalance: PoolAssetBalance[];
  };
  positionValue: PositionValue;
}

const getBonfidaPools = async (
  connection: Connection,
  walletPublicKey: PublicKey,
  tokenMintMapBySymbol: Map<string, string>
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
      .map((o) => o.assetMints)
      .flat()
  );
  // avoid making multiple api calls for same tokens
  const tokenPriceMap = await createTokenPriceMap(allPoolAssetMints);

  for (const seed of userPoolSeeds) {
    const seedKey = new PublicKey(seed).toBase58();
    const poolData = poolInfoMap[seedKey];
    const { poolInfo, tokenAmount, poolAssetBalance } = poolData;
    const { mintKey } = poolInfo;
    const markets = getBonfidaPoolMarketData(tokenMintMapBySymbol, poolInfo);
    const name = getBonfidaPoolNameData(poolInfo);
    const poolSeed = new PublicKey(seed).toBase58();
    const tokenPrice = getBonfidaPoolTokenPrice(
      tokenPriceMap,
      tokenAmount,
      poolAssetBalance
    );

    const balance = userPoolBalanceMap[mintKey.toBase58()].value.uiAmount;
    const positionValue = getBonfidaPoolPositionValue(
      tokenPrice,
      balance,
      tokenAmount,
      poolAssetBalance,
      tokenMintMapBySymbol
    );
    const poolRowData = {
      markets,
      name,
      platform: PLATFORM_META[PLATFORMS_ENUM.BONFIDA],
      balance,
      tokenPrice,
      inceptionPerformance: {
        poolSeed,
        tokenAmount,
        poolAssetBalance,
      },
      positionValue,
    };
    poolTableRows.push(poolRowData);
  }

  return poolTableRows;
};

export const AutomatedStrategies = () => {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const { tokenMap } = useConnectionConfig();
  const tokenMintMapBySymbol = useRef(new Map<string, string>());
  tokenMap.forEach((tokenInfo, mint) => {
    tokenMintMapBySymbol.current.set(tokenInfo.symbol, mint);
  });
  const connection = useConnection();
  const [strategyData, setStrategyData] = useState<PoolTableRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    if (publicKey) {
      setLoading(true);
      getBonfidaPools(connection, publicKey, tokenMintMapBySymbol.current).then(
        (data) => {
          setStrategyData(data);
          setLoading(false);
        }
      );
    }
  }, [connection, publicKey]);

  const columns = [
    {
      title: "Platform",
      dataIndex: "platform",
      key: "platform",
      render: (platformProps: PoolTableRow["platform"]) => (
        <>
          <PlatformCell {...platformProps} />
        </>
      ),
    },
    {
      title: "Markets",
      dataIndex: "markets",
      key: "markets",
      render: (markets: PoolTableRow["markets"]) => (
        <>
          <MarketsCell {...markets} />
        </>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (nameProps: PoolTableRow["name"]) => (
        <>
          <BotNameCell {...nameProps} />
        </>
      ),
    },
    {
      title: "Token Price",
      dataIndex: "tokenPrice",
      key: "tokenPrice",
      render: (tokenPrice: PoolTableRow["tokenPrice"]) => (
        <>
          <TokenPrice tokenPrice={tokenPrice} />
        </>
      ),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
    },
    {
      title: "Inception Performance",
      dataIndex: "inceptionPerformance",
      key: "inceptionPerformance",
      render: (inceptionPerfomance: PoolTableRow["inceptionPerformance"]) => (
        <>
          <InceptionPerformanceCell {...inceptionPerfomance} />
        </>
      ),
    },
    {
      title: "Value of Your Positiion (USD)",
      dataIndex: "positionValue",
      key: "positionValue",
      render: (positionValue: PoolTableRow["positionValue"]) => (
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
