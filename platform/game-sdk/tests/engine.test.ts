import { BlockchainNetwork } from "../networks/BlockchainNetwork";
import { Node, NodeType } from "../models/Node";
import { Block } from "../models/Block";
import { BlockchainTestEngine } from "../engine/BlockchainTestEngine";
import { ConsensusType } from "../consensus/Consensus";
import { Monitor } from "../engine/Monitor";
import { Edge } from "../models/Edge";

describe("🚀 Blockchain Test Engine - Advanced Cases (With Satoshi Plus)", () => {
  let powNetwork: BlockchainNetwork;
  let posNetwork: BlockchainNetwork;
  let satoshiPlusNetwork: BlockchainNetwork;
  let sybilAttackNetwork: BlockchainNetwork;
  let overloadedNetwork: BlockchainNetwork;
  let forkedNetwork: BlockchainNetwork;

  beforeEach(() => {
    /** 🔹 Network 1: PoW với mining node */
    powNetwork = new BlockchainNetwork(ConsensusType.PoW);
    powNetwork.addNode(
      new Node({
        id: "M1",
        type: NodeType.MINING_NODE,
        hashPower: 1000,
        latency: 10,
      }),
    );
    powNetwork.addBlock(new Block("B1", 100, 500)); // Độ khó = 500

    /** 🔹 Network 2: PoS với validator stake cao */
    posNetwork = new BlockchainNetwork(ConsensusType.PoS);
    posNetwork.addNode(
      new Node({
        id: "V1",
        type: NodeType.VALIDATOR_NODE,
        stake: 5000,
        latency: 5,
      }),
    );
    posNetwork.addBlock(new Block("B2", 200, undefined, 3000)); // Yêu cầu stake = 3000

    /** 🔹 Network 3: Satoshi Plus với cả PoW & PoS */
    satoshiPlusNetwork = new BlockchainNetwork(ConsensusType.SatoshiPlus);
    satoshiPlusNetwork.addNode(
      new Node({
        id: "V2",
        type: NodeType.VALIDATOR_NODE,
        stake: 4000,
        latency: 3,
      }),
    );
    satoshiPlusNetwork.addNode(
      new Node({
        id: "M2",
        type: NodeType.MINING_NODE,
        hashPower: 800,
        latency: 8,
      }),
    );
    satoshiPlusNetwork.addBlock(new Block("B3", 250, 600, 3500)); // PoW: 600, PoS: 3500

    /** 🔹 Network 4: Sybil Attack - quá nhiều Light Node */
    sybilAttackNetwork = new BlockchainNetwork(ConsensusType.PoS);
    for (let i = 0; i < 15; i++) {
      sybilAttackNetwork.addNode(
        new Node({ id: `L${i}`, type: NodeType.LIGHT_NODE, latency: 20 }),
      );
    }
    sybilAttackNetwork.addNode(
      new Node({
        id: "V3",
        type: NodeType.VALIDATOR_NODE,
        stake: 5000,
        latency: 10,
      }),
    );

    /** 🔹 Network 5: Quá tải mạng - Thêm 1000 block */
    overloadedNetwork = new BlockchainNetwork(ConsensusType.SatoshiPlus);
    overloadedNetwork.addNode(
      new Node({
        id: "V4",
        type: NodeType.VALIDATOR_NODE,
        stake: 6000,
        latency: 8,
      }),
    );
    for (let i = 0; i < 1000; i++) {
      overloadedNetwork.addBlock(
        new Block(
          `B${i}`,
          Math.floor(Math.random() * 5000),
          Math.random() * 10,
          Math.random() * 5000,
        ),
      );
    }

    /** 🔹 Network 6: Forked network - Hai nhánh blockchain song song */
    forkedNetwork = new BlockchainNetwork(ConsensusType.PoS);
    forkedNetwork.addNode(
      new Node({
        id: "V5",
        type: NodeType.VALIDATOR_NODE,
        stake: 4000,
        latency: 10,
      }),
    );
    forkedNetwork.addBlock(new Block("B1", 100, undefined, 1000));
    forkedNetwork.addBlock(new Block("B1-alt", 100, undefined, 1000)); // Fork xảy ra
    forkedNetwork.addBlock(new Block("B2", 200, undefined, 2000));
  });

  /** ✅ Test 1: Kiểm tra PoW */
  it("⛏️ PoW Network - Mining Node should validate block", () => {
    powNetwork.processBlock(powNetwork.blocks[0]);
    const testEngine = new BlockchainTestEngine(powNetwork);

    expect(testEngine.validateBlock()).toBe(true);
  });

  /** ✅ Test 2: Kiểm tra PoS */
  it("💰 PoS Network - Validator should validate block with sufficient stake", async () => {
    await posNetwork.processBlock(posNetwork.blocks[0]);
    const testEngine = new BlockchainTestEngine(posNetwork);

    expect(testEngine.validateBlock()).toBe(true);
  });

  /** ✅ Test 3: Kiểm tra Satoshi Plus */
  it("⚡ Satoshi Plus - Block should validate if either PoW or PoS conditions are met", async () => {
    await satoshiPlusNetwork.processBlock(satoshiPlusNetwork.blocks[0]);
    const testEngine = new BlockchainTestEngine(satoshiPlusNetwork);

    expect(testEngine.validateBlock()).toBe(true);
  });

  /** ✅ Test 4: Sybil Attack */
  it("🚨 Should detect Sybil Attack in a network with too many Light Nodes", async () => {
    const testEngine = new BlockchainTestEngine(sybilAttackNetwork);

    expect(testEngine.simulateSybilAttack()).toBe(false);
  });

  /** ✅ Test 5: Xử lý tải cao của mạng blockchain */
  it("⚡ Should handle extremely high transaction load efficiently", () => {
    const testEngine = new BlockchainTestEngine(overloadedNetwork);

    expect(testEngine.simulateLoad()).toBeGreaterThan(900);
  });
});

describe("📊 Monitor Test Suite", () => {
  let networks: BlockchainNetwork[];

  beforeEach(async () => {
    networks = [];

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

    for (let i = 0; i < 10; i++) {
      network1.addBlock(
        new Block(
          `B${i}`,
          Math.floor(Math.random() * 5000),
          Math.random() * 10,
          Math.random() * 5000,
        ),
      );
    }
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
    network2.addBlock(new Block("B2", 120, undefined, 2000));
    network2.addEdge({ from: "V1", to: "L0", id: "E1" });
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
    network3.addBlock(new Block("B3", 200, 700));
    network3.addEdge({ from: "M1", to: "M2", id: "E1" });
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
    network4.addBlock(new Block("B4", 250, undefined, 2000));
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
    network5.addBlock(new Block("B5", 300, 500, 2500));
    network5.addEdge({ from: "N0", to: "N1", id: "E1" });
    network5.addEdge({ from: "N1", to: "N2", id: "E2" });
    network5.addEdge({ from: "N2", to: "N3", id: "E3" });
    networks.push(network5);
  });

  /** ✅ Chạy Monitor trên 5 mạng */
  it("📊 Monitor should analyze 5 blockchain networks", async () => {
    for (const network of networks) {
      const monitor = new Monitor(network);

      await monitor.printReport();
    }
  });
});
