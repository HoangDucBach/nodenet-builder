import { BlockchainNetwork } from "../networks/BlockchainNetwork";
import { BlockStatus } from "../models/Block";
import { NodeType } from "../models/Node";

type Report = {
  validBlockPercentage: number;
  rejectedBlocks: number;
  pendingBlocks: number;
  gasStatistics: { min: number; max: number; avg: number };
  sybilAttack: boolean;
  attack51: boolean;
  tps: number;
  averageLatency: number;
};

export class BlockchainTestEngine {
  private network: BlockchainNetwork;

  constructor(network: BlockchainNetwork) {
    this.network = network;
  }

  private async getValidBlockPercentage(): Promise<number> {
    const total = this.network.blocks.length;

    await Promise.all(this.network.blocks.map(block => this.network.processBlock(block)));

    const valid = this.network.blocks.filter(b => b.status === BlockStatus.SOLVED).length;
    return total > 0 ? (valid / total) * 100 : 0;
  }

  private async getRejectedBlocks(): Promise<number> {
    return this.network.blocks.filter(b => b.status === BlockStatus.REJECTED).length;
  }

  private async getPendingBlocks(): Promise<number> {
    return this.network.blocks.filter(b => b.status === BlockStatus.PENDING).length;
  }

  private async getGasStatistics() {
    const gasPrices = this.network.blocks.map(b => b.gasPrice);
    return {
      min: Math.min(...gasPrices),
      max: Math.max(...gasPrices),
      avg: gasPrices.reduce((sum, g) => sum + g, 0) / (gasPrices.length || 1),
    };
  }

  /** ✅ Phát hiện Sybil Attack */
  private async detectSybilAttack(): Promise<boolean> {
    const lightNodes = Array.from(this.network.nodes.values()).filter(n => n.type === NodeType.LIGHT_NODE).length;
    return lightNodes / this.network.nodes.length > 0.6;
  }

  private async detect51Attack(): Promise<boolean> {
    const validators = Array.from(this.network.nodes.values()).filter(n => n.type === NodeType.VALIDATOR_NODE);
    const totalStake = validators.reduce((sum, n) => sum + (n.stake || 0), 0);
    const maxStake = Math.max(...validators.map(n => n.stake || 0));
    return maxStake > totalStake * 0.51;
  }

  private async getTPS(): Promise<number> {
    return this.network.blocks.length / (this.network.nodes.length || 1);
  }

  private async getAverageLatency(): Promise<number> {
    const latencies = Array.from(this.network.nodes.values()).map(n => n.latency || 0);
    return latencies.length > 0 ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length : 0;
  }

  public async getReport(): Promise<Report> {
    return {
      validBlockPercentage: await this.getValidBlockPercentage(),
      rejectedBlocks: await this.getRejectedBlocks(),
      pendingBlocks: await this.getPendingBlocks(),
      gasStatistics: await this.getGasStatistics(),
      sybilAttack: await this.detectSybilAttack(),
      attack51: await this.detect51Attack(),
      tps: await this.getTPS(),
      averageLatency: await this.getAverageLatency()
    };
  }
}