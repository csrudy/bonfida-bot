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
import { CalculatorFilled } from "@ant-design/icons";
import { getBonfidaPools, PoolTableRow } from "../../actions/bonfida";
import { useConnection, useConnectionConfig } from "../../contexts/connection";
const { Panel } = Collapse;

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
        setPoolTableData(
          data.sort(
            (a, b) => b.positionValue.totalValue - a.positionValue.totalValue
          )
        );
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
      render: (inceptionPerformance: PoolTableRow["inceptionPerformance"]) => (
        <>
          <InceptionPerformanceCell
            inceptionPerformance={inceptionPerformance}
          />
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
  const header = (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span>
        <CalculatorFilled />
        <span style={{ fontSize: "18px", fontWeight: 800, marginLeft: "1rem" }}>
          AUTOMATED STRATEGIES
        </span>
      </span>

      <h2>
        <strong>{formatUSD.format(totalAutomatedStrategyValue)}</strong>
      </h2>
    </div>
  );

  return (
    <>
      <Collapse defaultActiveKey={1}>
        <Panel showArrow={false} header={header} key="1">
          <Table
            columns={columns}
            dataSource={poolTableData}
            pagination={false}
            loading={loading}
          ></Table>
        </Panel>
      </Collapse>
    </>
  );
};
