import { BlockStatus } from "../models/Block";
import { NodeType } from "../models/Node";
import { BlockchainNetwork } from "../networks/BlockchainNetwork";

import {
  ITestBlockValidity,
  ITestNetworkLoad,
  ITestGasPrice,
  ITestSecurity,
  ITestConsensusEfficiency,
} from "./TestEngine";

export class BlockchainTestEngine
  implements
    ITestBlockValidity,
    ITestNetworkLoad,
    ITestGasPrice,
    ITestSecurity,
    ITestConsensusEfficiency
{
  private network: BlockchainNetwork;

  constructor(network: BlockchainNetwork) {
    this.network = network;
  }

  /** Test 1: Kiểm tra block hợp lệ */
  validateBlock(): boolean {
    console.log("Running Test: Block Validity");

    return this.network.blocks.every(
      (block) => block.status === BlockStatus.SOLVED,
    );
  }

  /** Test 2: Kiểm tra tải mạng */
  simulateLoad(): number {
    console.log("Running Test: Network Load");

    return this.network.blocks.length / (this.network.nodes.length || 1);
  }

  /** Test 3: Kiểm tra phí gas */
  analyzeGasCost(): number {
    console.log("Running Test: Gas Price");

    return (
      this.network.blocks.reduce((sum, block) => sum + block.gasPrice, 0) /
      this.network.blocks.length
    );
  }

  /** Test 4: Kiểm tra bảo mật */
  checkVulnerabilities(): boolean {
    console.log("Running Test: Security - Sybil & 51% Attack");

    return this.simulateSybilAttack() && this.simulate51Attack();
  }

  simulateSybilAttack(): boolean {
    const lightNodes = Array.from(this.network.nodes.values()).filter(
      (node) => node.type === NodeType.LIGHT_NODE,
    );

    if (lightNodes.length > this.network.nodes.length * 0.6) {
      console.log("🚨 Sybil Attack detected: Too many Light Nodes!");

      return false;
    }

    return true;
  }

  simulate51Attack(): boolean {
    const validators = Array.from(this.network.nodes.values()).filter(
      (node) => node.type === NodeType.VALIDATOR_NODE,
    );
    const totalStake = validators.reduce(
      (sum, node) => sum + (node.stake || 0),
      0,
    );
    const largestStake = Math.max(...validators.map((node) => node.stake || 0));

    if (largestStake > totalStake * 0.51) {
      console.log("🚨 51% Attack detected: One validator has too much stake!");

      return false;
    }

    return true;
  }

  /** Test 5: Kiểm tra hiệu suất đồng thuận */
  measureConsensusTime(): number {
    console.log("Running Test: Consensus Efficiency");

    return Math.random() * 1000; // Giả lập thời gian đồng thuận
  }
}
