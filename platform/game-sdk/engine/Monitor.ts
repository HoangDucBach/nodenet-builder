import { BlockchainNetwork } from "../networks/BlockchainNetwork";
import { BlockchainTestEngine } from "./BlockchainTestEngine";
import { NotificationType, NotificationManager } from "./NotificationManager";

export class Monitor {
  private network: BlockchainNetwork;
  private testEngine: BlockchainTestEngine;
  private notifications: NotificationManager;

  constructor(network: BlockchainNetwork) {
    this.network = network;
    this.testEngine = new BlockchainTestEngine(network);
    this.notifications = new NotificationManager();
  }

  /** ✅ In báo cáo */
  public async printReport() {
    try {
      const report = await this.testEngine.getReport();

      this.notifications.send(NotificationType.INFO, `✅ Valid Blocks: ${report.validBlockPercentage.toFixed(2)}%`);
      this.notifications.send(NotificationType.WARNING, `❌ Rejected Blocks: ${report.rejectedBlocks}`);
      this.notifications.send(NotificationType.INFO, `🔍 Pending: ${report.pendingBlocks}`);
      this.notifications.send(NotificationType.INFO, `⛽ Gas Price (Min: ${report.gasStatistics.min}, Max: ${report.gasStatistics.max}, Avg: ${report.gasStatistics.avg.toFixed(2)})`);
      this.notifications.send(NotificationType.INFO, `🔍 Sybil Attack: ${report.sybilAttack ? "⚠️ Detected" : "✅ Secure"}`);
      this.notifications.send(NotificationType.INFO, `🚨 51% Attack: ${report.attack51 ? "⚠️ Detected" : "✅ Secure"}`);
      this.notifications.send(NotificationType.INFO, `⚡ TPS: ${report.tps.toFixed(2)}`);
      this.notifications.send(NotificationType.INFO, `⏳ Avg Latency: ${report.averageLatency.toFixed(2)} ms`);

      this.notifications.printAll();
    } catch (error) {
      console.error(`⚠️ Error while printing report: ${error}`);
    }
  }
}