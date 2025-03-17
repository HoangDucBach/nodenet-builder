import { ConsensusType } from "../consensus/Consensus";
import { Monitor } from "../engine/Monitor";
import { Block } from "../models/Block";
import { Edge } from "../models/Edge";
import { NodeType, Node } from "../models/Node";
import { BlockchainNetwork } from "../networks/BlockchainNetwork";

async function main() {
  console.log("🚀 Starting Blockchain Simulation...\n");

  // Khởi tạo mạng lưới blockchain
  let network = new BlockchainNetwork(ConsensusType.SatoshiPlus);

  // Thêm node
  network.addNode(
    new Node({
      id: "N1",
      type: NodeType.VALIDATOR_NODE,
      stake: 3000,
      latency: 5,
    }),
  );
  network.addNode(
    new Node({
      id: "N2",
      type: NodeType.MINING_NODE,
      hashPower: 500,
      latency: 7,
    }),
  );
  network.addNode(
    new Node({ id: "N3", type: NodeType.FULL_NODE, latency: 10 }),
  );

  // Thêm kết nối giữa các node
  network.addEdge(new Edge({ from: "N1", to: "N2", id: "E1" }));
  network.addEdge({ from: "N2", to: "N3", id: "E2" });

  // Thêm block vào blockchain
  for (let i = 0; i < 5; i++) {
    network.addBlock(
      new Block(
        `B${i}`,
        Math.floor(Math.random() * 5000),
        Math.random() * 10,
        Math.random() * 5000,
      ),
    );
  }

  // Khởi tạo monitor
  const monitor = new Monitor(network);

  // Xử lý tất cả block trước khi chạy monitor
  for (const block of network.blocks) {
    await network.processBlock(block);
  }

  // In báo cáo
  await monitor.printReport();
}

// Chạy hàm main()
main().catch((error) => console.error("❌ Error in simulation:", error));
