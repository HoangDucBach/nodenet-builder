import { BlockchainNetwork } from "../networks/BlockchainNetwork";
import { Node, NodeType } from "../models/Node";
import { Block } from "../models/Block";
import { BlockchainTestEngine } from "../engine/BlockchainTestEngine";
import { ConsensusType } from "../consensus/Consensus";
import { Monitor } from "../engine/Monitor";
import { Edge } from "../models/Edge";
import { TestcaseGenerator } from "../generator/TestcaseGenerator";

describe("📊 Monitor Test Suite", () => {
  let networks: BlockchainNetwork[];
  let blockTests: Block[];

  beforeEach(async () => {
    networks = [];
    blockTests = TestcaseGenerator.generateBlocks(15);

    /** 🔹 Network 1: Phân bố đồng đều */
    let network1 = new BlockchainNetwork(ConsensusType.SatoshiPlus);

    network1.addNode(
      new Node({
        id: "N1",
        type: NodeType.VALIDATOR_NODE,
        stake: 3000,
        latency: 5,
      }),
    );
    network1.addNode(
      new Node({
        id: "N2",
        type: NodeType.MINING_NODE,
        hashPower: 500,
        latency: 7,
      }),
    );
    network1.addNode(
      new Node({ id: "N3", type: NodeType.FULL_NODE, latency: 10 }),
    );
    network1.addEdge(new Edge({ from: "N1", to: "N2", id: "E1" }));
    network1.addEdge({ from: "N2", to: "N3", id: "E2" });

    blockTests.forEach((block) => network1.addBlock(block));
    networks.push(network1);

    /** 🔹 Network 2: Sybil Attack */
    let network2 = new BlockchainNetwork(ConsensusType.PoS);

    for (let i = 0; i < 8; i++) {
      network2.addNode(
        new Node({ id: `L${i}`, type: NodeType.LIGHT_NODE, latency: 20 }),
      );
    }
    network2.addNode(
      new Node({
        id: "V1",
        type: NodeType.VALIDATOR_NODE,
        stake: 4000,
        latency: 5,
      }),
    );
    network2.addEdge({ from: "V1", to: "L0", id: "E1" });

    blockTests.forEach((block) => network2.addBlock(block));

    networks.push(network2);

    /** 🔹 Network 3: PoW mạnh */
    let network3 = new BlockchainNetwork(ConsensusType.PoW);

    network3.addNode(
      new Node({
        id: "M1",
        type: NodeType.MINING_NODE,
        hashPower: 1200,
        latency: 6,
      }),
    );
    network3.addNode(
      new Node({
        id: "M2",
        type: NodeType.MINING_NODE,
        hashPower: 800,
        latency: 8,
      }),
    );
    network3.addEdge({ from: "M1", to: "M2", id: "E1" });

    blockTests.forEach((block) => network3.addBlock(block));

    networks.push(network3);

    /** 🔹 Network 4: Nhiều Validator với stake thấp */
    let network4 = new BlockchainNetwork(ConsensusType.PoS);

    for (let i = 0; i < 6; i++) {
      network4.addNode(
        new Node({
          id: `V${i}`,
          type: NodeType.VALIDATOR_NODE,
          stake: 500,
          latency: 10,
        }),
      );
    }
    network4.addEdge({ from: "V0", to: "V1", id: "E1" });
    network4.addEdge({ from: "V2", to: "V3", id: "E2" });

    blockTests.forEach((block) => network4.addBlock(block));

    networks.push(network4);

    /** 🔹 Network 5: Quá tải node */
    let network5 = new BlockchainNetwork(ConsensusType.SatoshiPlus);

    for (let i = 0; i < 10; i++) {
      network5.addNode(
        new Node({
          id: `N${i}`,
          type: NodeType.FULL_NODE,
          latency: Math.random() * 15,
        }),
      );
    }
    network5.addEdge({ from: "N0", to: "N1", id: "E1" });
    network5.addEdge({ from: "N1", to: "N2", id: "E2" });
    network5.addEdge({ from: "N2", to: "N3", id: "E3" });

    blockTests.forEach((block) => network5.addBlock(block));

    networks.push(network5);

    /** Network 6: Balanced Hybrid Network */
    let network6 = new BlockchainNetwork(ConsensusType.SatoshiPlus);

    network6.addNode(new Node({ id: "M1", type: NodeType.MINING_NODE, hashPower: 1400, latency: 3 }));
    network6.addNode(new Node({ id: "M2", type: NodeType.MINING_NODE, hashPower: 1300, latency: 4 }));
    network6.addNode(new Node({ id: "M3", type: NodeType.MINING_NODE, hashPower: 1200, latency: 5 }));
    network6.addNode(new Node({ id: "V1", type: NodeType.VALIDATOR_NODE, stake: 5000, latency: 2 }));
    network6.addNode(new Node({ id: "V2", type: NodeType.VALIDATOR_NODE, stake: 4500, latency: 3 }));
    network6.addNode(new Node({ id: "V3", type: NodeType.VALIDATOR_NODE, stake: 4000, latency: 3 }));
    network6.addNode(new Node({ id: "V4", type: NodeType.VALIDATOR_NODE, stake: 3800, latency: 4 }));
    network6.addNode(new Node({ id: "N1", type: NodeType.FULL_NODE, latency: 1 }));
    network6.addNode(new Node({ id: "N2", type: NodeType.FULL_NODE, latency: 2 }));
    network6.addNode(new Node({ id: "L1", type: NodeType.LIGHT_NODE, latency: 15 }));
    network6.addNode(new Node({ id: "L2", type: NodeType.LIGHT_NODE, latency: 20 }));

    // 🔗 Tăng số lượng kết nối giữa các node
    network6.addEdge({ from: "M1", to: "V1", id: "E1" });
    network6.addEdge({ from: "M2", to: "V2", id: "E2" });
    network6.addEdge({ from: "M3", to: "V3", id: "E3" });
    network6.addEdge({ from: "M3", to: "V4", id: "E4" });
    network6.addEdge({ from: "V1", to: "V2", id: "E5" });
    network6.addEdge({ from: "V2", to: "V3", id: "E6" });
    network6.addEdge({ from: "V3", to: "V4", id: "E7" });
    network6.addEdge({ from: "N1", to: "M1", id: "E8" });
    network6.addEdge({ from: "N1", to: "M2", id: "E9" });
    network6.addEdge({ from: "N2", to: "M3", id: "E10" });
    network6.addEdge({ from: "N1", to: "V1", id: "E11" });
    network6.addEdge({ from: "N2", to: "V2", id: "E12" });
    network6.addEdge({ from: "N2", to: "V3", id: "E13" });
    network6.addEdge({ from: "L1", to: "N1", id: "E14" });
    network6.addEdge({ from: "L2", to: "N2", id: "E15" });

    blockTests.forEach((block) => network6.addBlock(block));

    networks.push(network6);
  });

  /** ✅ Chạy Monitor trên 5 mạng */
  it("📊 Monitor should analyze 5 blockchain networks", async () => {
    for (const network of networks) {
      const monitor = new Monitor(network);
      
      await monitor.printReport();
    }
  }, 30000);
});
