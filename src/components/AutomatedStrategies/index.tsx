import React, { useEffect, useState } from "react";
import { formatUSD } from "../../utils/utils";
import { useWallet } from "../../contexts/wallet";
import { TokenPrice } from "./TokenPriceCell";
import { InceptionPerformanceCell } from "./InceptionPerformanceCell";
import { PositionValueCell } from "./PositionValueCell";
import { MarketsCell } from "./MarketsCell";
import { PlatformCell } from "./PlatformCell";
import { BotNameCell } from "./BotNameCell";
import { Collapse, Table } from "antd";
import { getBonfidaPools, PoolTableRow } from "../../actions/bonfida";
import { useConnection, useConnectionConfig } from "../../contexts/connection";
const { Panel } = Collapse;

export enum PLATFORMS_ENUM {
  BONFIDA = "bonfida",
}
export const PLATFORM_META = {
  bonfida: {
    label: "Bonfida",
    tokenMint: "EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp",
  },
};

export const AutomatedStrategies = () => {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const { tokenMap } = useConnectionConfig();
  const connection = useConnection();
  const [poolTableData, setPoolTableData] = useState<PoolTableRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    if (publicKey) {
      setLoading(true);
      getBonfidaPools(connection, publicKey, tokenMap).then((data) => {
        setPoolTableData(data);
        setLoading(false);
      });
    }
  }, [connection, publicKey, tokenMap]);

  const totalAutomatedStrategyValue = poolTableData.reduce<number>(
    (acc, val) => (acc += val.positionValue.totalValue),
    0
  );
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
      render: (inceptionPerformance: PoolTableRow["inceptionPerformance"]) => (
        <>
          <InceptionPerformanceCell
            inceptionPerformance={inceptionPerformance}
          />
        </>
      ),
    },
    {
      title: "Value of Your Position (USD)",
      dataIndex: "positionValue",
      key: "positionValue",
      render: (positionValue: PoolTableRow["positionValue"]) => (
        <>
          <PositionValueCell {...positionValue} />
        </>
      ),
    },
  ];
  const header = (
    <div className="automated-strategies-header">
      <h2>
        <strong>Automated Strategies</strong>
      </h2>
      <h2>
        <strong>{formatUSD.format(totalAutomatedStrategyValue)}</strong>
      </h2>
    </div>
  );

  return (
    <div className={"automated-strategies-container"}>
      <Collapse defaultActiveKey={1}>
        <Panel
          showArrow={false}
          header={header}
          className={"automated-stragtegies"}
          key="1"
        >
          <Table
            columns={columns}
            dataSource={poolTableData}
            rowClassName={"pool-row"}
            pagination={false}
            loading={loading}
            className={"automated-strategies-table"}
          ></Table>
        </Panel>
      </Collapse>
    </div>
  );
};
