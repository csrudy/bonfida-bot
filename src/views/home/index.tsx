import { Button, Col, Row } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { AutomatedStrategies } from "../../components/AutomatedStrategies";
import { ConnectButton } from "../../components/ConnectButton";

export const HomeView = () => {
  return (
    <Row gutter={[16, 16]} align="middle">
      <Col span={24}>
        <AutomatedStrategies></AutomatedStrategies>
      </Col>

      <Col span={12}>
        <ConnectButton />
      </Col>
      <Col span={12}>
        <Link to="/faucet">
          <Button>Faucet</Button>
        </Link>
      </Col>
      <Col span={24}>
        <div className="builton" />
      </Col>
    </Row>
  );
};
