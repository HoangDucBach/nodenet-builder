import { BlockchainNetwork } from "../networks/BlockchainNetwork";
import { Block } from "../models/Block";
import { Node, NodeType } from "../models/Node";

type Report = {
  validBlockPercentage: number;
  rejectedBlocks: number;
  gasStatistics: { min: number; max: number; avg: number };
  sybilAttack: boolean;
  attack51: boolean;
  tps: number;
  averageLatency: number;
};

type MonitorState = {
  processingState: string[]; // Danh sách block đang xử lý
  errorLogs: string[]; // Danh sách lỗi ghi nhận
  activeNodes: { node: Node; block: Block }[]; // Danh sách node đang xử lý block
};

interface IMonitor {
  getReport(): Promise<Report>;
  printReport(): void;
  getState(): Promise<MonitorState>;
}

export class Monitor implements IMonitor {
  private network: BlockchainNetwork;
  private blockStats?: { total: number; valid: number; rejected: number };
  private gasStats?: { min: number; max: number; avg: number };
  private nodeStats?: {
    lightNodes: number;
    totalStake: number;
    maxStake: number;
  };

  private processingState: string[] = [];
  private errorLogs: string[] = [];
  private activeNodes: { node: Node; block: Block }[] = [];

  constructor(network: BlockchainNetwork) {
    this.network = network;
  }

  /** 🔄 Helper: Xử lý an toàn */
  private async safeCompute<T>(
    callback: () => Promise<T>,
    defaultValue: T,
  ): Promise<T> {
    try {
      return await callback();
    } catch (error) {
      const errorMsg = `⚠️ Error: ${error}`;

      this.errorLogs.push(errorMsg);
      console.error(errorMsg);

      return defaultValue;
    }
  }

  /** 🔄 Xử lý tất cả block & lưu trạng thái */
  private async computeBlockStats() {
    if (!this.blockStats) {
      await this.safeCompute(
        async () => {
          let valid = 0,
            rejected = 0;

          for (const block of this.network.blocks) {
            const result = await this.network.processBlock(block);

            if (result.success) valid++;
            else rejected++;
          }

          this.blockStats = {
            total: this.network.blocks.length,
            valid,
            rejected,
          };

          return this.blockStats;
        },
        { total: 0, valid: 0, rejected: 0 },
      );
    }
  }
  private async computeGasStats() {
    if (!this.gasStats) {
      await this.safeCompute(
        async () => {
          const gasPrices = this.network.blocks.map((b) => b.gasPrice);

          return (this.gasStats = {
            min: Math.min(...gasPrices),
            max: Math.max(...gasPrices),
            avg:
              gasPrices.reduce((sum, g) => sum + g, 0) /
              (gasPrices.length || 1),
          });
        },
        { min: 0, max: 0, avg: 0 },
      );
    }
  }

  private async computeNodeStats() {
    if (!this.nodeStats) {
      await this.safeCompute(
        async () => {
          const lightNodes = Array.from(this.network.nodes.values()).filter(
            (n) => n.type === NodeType.LIGHT_NODE,
          ).length;
          const validators = Array.from(this.network.nodes.values()).filter(
            (n) => n.type === NodeType.VALIDATOR_NODE,
          );
          const totalStake = validators.reduce(
            (sum, n) => sum + (n.stake || 0),
            0,
          );
          const maxStake = Math.max(...validators.map((n) => n.stake || 0));

          return (this.nodeStats = { lightNodes, totalStake, maxStake });
        },
        { lightNodes: 0, totalStake: 0, maxStake: 0 },
      );
    }
  }

  /** ✅ 1. Tính % block hợp lệ */
  private async getValidBlockPercentage(): Promise<number> {
    await this.computeBlockStats();

    return await this.safeCompute(
      async () =>
        this.blockStats!.total > 0
          ? (this.blockStats!.valid / this.blockStats!.total) * 100
          : 0,
      0,
    );
  }

  /** ✅ 2. Tính số block bị từ chối */
  private async getRejectedBlocks(): Promise<number> {
    await this.computeBlockStats();

    return await this.safeCompute(async () => this.blockStats!.rejected, 0);
  }

  /** ✅ 3. Lấy Min / Max / Avg Gas Price */
  private async getGasStatistics() {
    this.computeGasStats();

    return await this.safeCompute(async () => this.gasStats!, {
      min: 0,
      max: 0,
      avg: 0,
    });
  }

  /** ✅ 4. Kiểm tra Sybil Attack */
  private async detectSybilAttack(): Promise<boolean> {
    this.computeNodeStats();

    return await this.safeCompute(
      async () => this.nodeStats!.lightNodes / this.network.nodes.length > 0.6,
      false,
    );
  }

  /** ✅ 5. Kiểm tra 51% Attack */
  private async detect51Attack(): Promise<boolean> {
    this.computeNodeStats();

    return await this.safeCompute(
      async () => this.nodeStats!.maxStake > this.nodeStats!.totalStake * 0.51,
      false,
    );
  }

  /** ✅ 6. Tính TPS */
  private async getTPS(): Promise<number> {
    return await this.safeCompute(
      async () => this.network.blocks.length / (this.network.nodes.length || 1),
      0,
    );
  }

  /** ✅ 7. Độ trễ trung bình */
  private async getAverageLatency(): Promise<number> {
    return await this.safeCompute(async () => {
      const latencies = Array.from(this.network.nodes.values()).map(
        (n) => n.latency || 0,
      );

      return latencies.length > 0
        ? latencies.reduce((sum, l) => sum + l, 0) / latencies.length
        : 0;
    }, 0);
  }

  /** ✅ 8. Trả về báo cáo */
  public async getReport(): Promise<Report> {
    await this.computeBlockStats();
    await this.computeGasStats();
    await this.computeNodeStats();

    return Promise.all([
      this.getValidBlockPercentage(),
      this.getRejectedBlocks(),
      this.getGasStatistics(),
      this.detectSybilAttack(),
      this.detect51Attack(),
      this.getTPS(),
      this.getAverageLatency(),
    ]).then(
      ([
        validBlockPercentage,
        rejectedBlocks,
        gasStatistics,
        sybilAttack,
        attack51,
        tps,
        averageLatency,
      ]) => {
        return {
          validBlockPercentage,
          rejectedBlocks,
          gasStatistics,
          sybilAttack,
          attack51,
          tps,
          averageLatency,
        };
      },
    );
  }

  /** ✅ 9. Lấy trạng thái hệ thống */
  public async getState(): Promise<MonitorState> {
    return Promise.all([
      this.processingState,
      this.errorLogs,
      this.activeNodes,
    ]).then(([processingState, errorLogs, activeNodes]) => {
      return { processingState, errorLogs, activeNodes };
    });
  }

  /** ✅ 10. In báo cáo */
  public async printReport() {
    try {
      const report = await this.getReport();

      console.log("📊 === Blockchain Network Report ===");
      console.log(
        `✅ Valid Blocks: ${report.validBlockPercentage.toFixed(2)}%`,
      );
      console.log(`❌ Rejected Blocks: ${report.rejectedBlocks}`);
      console.log(
        `⛽ Gas Price (Min: ${report.gasStatistics.min}, Max: ${report.gasStatistics.max}, Avg: ${report.gasStatistics.avg.toFixed(2)})`,
      );
      console.log(
        `🔍 Sybil Attack: ${report.sybilAttack ? "⚠️ Detected" : "✅ Secure"}`,
      );
      console.log(
        `🚨 51% Attack: ${report.attack51 ? "⚠️ Detected" : "✅ Secure"}`,
      );
      console.log(`⚡ TPS: ${report.tps.toFixed(2)}`);
      console.log(`⏳ Avg Latency: ${report.averageLatency.toFixed(2)} ms`);
      console.log("=================================");
      console.log("🟢 Active Nodes Processing Blocks:");
      this.activeNodes.forEach(({ node, block }) => {
        console.log(
          `🔵 Node ${node.id} (${NodeType[node.type]}) is processing Block ${block.id}`,
        );
      });
    } catch (error) {
      this.errorLogs.push(`⚠️ Error while printing report: ${error}`);
    }
  }
}
