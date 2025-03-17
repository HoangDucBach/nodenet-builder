import { Node, NodeType } from "../models/Node";
import { Edge } from "../models/Edge";
import { Block, BlockStatus } from "../models/Block";
import {
  Consensus,
  ConsensusFactory,
  ConsensusType,
  ProofOfStake,
  ProofOfWork,
  SatoshiPlus,
} from "../consensus/Consensus";

type BlockProcessResponse = {
  timestamp: number;
  success: boolean;
  processedBy?: Node;
};

interface IBlockchainNetwork {
  nodes: Node[];
  edges: Edge[];
  blocks: Block[];

  addNode(node: Node): void;
  addEdge(edge: Edge): void;
  addBlock(block: Block): void;
  processBlock(block: Block): Promise<BlockProcessResponse>;
  propagateBlock(block: Block): void;
  isConnected(nodeA: string, nodeB: string): boolean;
}

export class BlockchainNetwork implements IBlockchainNetwork {
  nodes: Node[] = [];
  edges: Edge[] = [];
  blocks: Block[] = [];
  consensus: Consensus;

  constructor(consensusType: ConsensusType) {
    this.consensus = ConsensusFactory.createConsensus(consensusType);
  }

  addNode(node: Node) {
    this.nodes.push(node);
  }

  addEdge(edge: Edge) {
    this.edges.push(edge);
  }

  addBlock(block: Block) {
    this.blocks.push(block);
  }

  isConnected(nodeA: string, nodeB: string): boolean {
    return this.edges.some(
      (edge) =>
        (edge.from === nodeA && edge.to === nodeB) ||
        (edge.to === nodeA && edge.from === nodeB),
    );
  }

  propagateBlock(block: Block) {
    const processingNode = this.nodes.find(
      (node) => node.id === block.processedBy?.id,
    );

    if (!processingNode) return;

    // 🔄 Các node được kết nối sẽ nhận block
    const connectedNodes = this.edges
      .filter(
        (edge) =>
          edge.from === processingNode.id || edge.to === processingNode.id,
      )
      .map((edge) => (edge.from === processingNode.id ? edge.to : edge.from))
      .map((nodeId) => this.nodes.find((node) => node.id === nodeId))
      .filter((node) => node !== undefined);

    console.log(
      `🔗 Block ${block.id} propagated to ${connectedNodes.length} nodes.`,
    );
  }

  async processBlock(block: Block): Promise<BlockProcessResponse> {
    let validNodes = Array.from(this.nodes.values()).filter((node) =>
      this.consensus.validateBlock(block, node),
    );

    if (validNodes.length === 0) {
      console.log(`🚨 Block ${block.id} failed: No valid validator.`);

      return { timestamp: Date.now(), success: false };
    }

    validNodes = validNodes.filter((node) =>
      this.edges.some((edge) => edge.from === node.id || edge.to === node.id),
    );

    if (validNodes.length === 0) {
      console.log(`❌ Block ${block.id} failed: No connected validator.`);

      return { timestamp: Date.now(), success: false };
    }

    for (const node of validNodes) {
      // ✅ Non-blocking delay mô phỏng latency
      await new Promise((resolve) => setTimeout(resolve, node.latency));

      const successProbability = this.calculateSuccessProbability(node, block);

      if (Math.random() > successProbability) {
        console.log(`❌ Block ${block.id} failed: Node ${node.id} rejected.`);
        continue;
      }

      console.log(
        `✅ Block ${block.id} accepted by ${node.id} (${NodeType[node.type]}).`,
      );
      block.processedBy = node;
      block.status = BlockStatus.SOLVED;
      this.propagateBlock(block);

      return { timestamp: Date.now(), success: true, processedBy: node };
    }

    // Nếu không có node nào chấp nhận block
    console.log(`❌ Block ${block.id} failed: No node accepted.`);

    return { timestamp: Date.now(), success: false };
  }

  calculateSuccessProbability(node: Node, block: Block): number {
    let baseProbability = 0;

    switch (this.consensus.constructor) {
      case ProofOfWork:
        if (
          node.type === NodeType.MINING_NODE &&
          block.difficulty !== undefined
        ) {
          baseProbability = node.hashPower / (block.difficulty * 2);
        }
        break;

      case ProofOfStake:
        if (
          node.type === NodeType.VALIDATOR_NODE &&
          block.stakeThreshold !== undefined
        ) {
          baseProbability = node.stake / (block.stakeThreshold * 2);
        }
        break;

      case SatoshiPlus:
        const powFactor =
          node.type === NodeType.MINING_NODE && block.difficulty !== undefined
            ? node.hashPower / (block.difficulty * 2)
            : 0;
        const posFactor =
          node.type === NodeType.VALIDATOR_NODE &&
          block.stakeThreshold !== undefined
            ? node.stake / (block.stakeThreshold * 2)
            : 0;

        baseProbability = Math.max(powFactor, posFactor);
        break;
    }

    // Độ trễ giảm khả năng xử lý (giảm tuyến tính)
    baseProbability *= Math.max(0.5, 1 - node.latency / 5000);

    // Gas Price ưu tiên node nhanh hơn (ảnh hưởng tỷ lệ)
    baseProbability *= 1 + block.gasPrice / 10000;

    return Math.max(0, Math.min(baseProbability, 1)); // Giới hạn từ 0 đến 1
  }
}
