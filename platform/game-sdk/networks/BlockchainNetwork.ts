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
import { NotificationManager, NotificationType } from "../engine/NotificationManager";

type BlockProcessResponse = {
  timestamp: number;
  success: boolean;
  processedBy?: Node;
};

interface INeedSync {
  needSync: boolean;
  lastBlock?: Block;
  emitNeedSync(): void;
}

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
  emitNeedSync?(): void;
}

export class BlockchainNetwork implements IBlockchainNetwork, INeedSync {
  nodes: Node[] = [];
  edges: Edge[] = [];
  blocks: Block[] = [];
  consensus: Consensus;

  needSync: boolean = false;
  lastBlock?: Block;

  notifications: NotificationManager = new NotificationManager();


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

  emitNeedSync(): void {
    this.needSync = true;
    this.lastBlock = this.blocks[this.blocks.length - 1];
  }

  propagateBlock(block: Block) {
    const processingNode = this.nodes.find(
      (node) => node.id === block.processedBy?.id,
    );

    if (!processingNode) {
      this.notifications.send(
        NotificationType.ERROR,
        `❌ Block ${block.id} failed: No processing node.`
      );
      return;
    }

    if (![NodeType.FULL_NODE, NodeType.LIGHT_NODE].includes(processingNode.type)) {
      this.notifications.send(
        NotificationType.WARNING,
        `⚠️ Node ${processingNode.id} (${NodeType[processingNode.type]}) can not propagate blocks.`
      );
      return;
    }

    const connectedNodes = this.edges
      .filter(
        (edge) =>
          edge.from === processingNode.id || edge.to === processingNode.id,
      )
      .map((edge) => (edge.from === processingNode.id ? edge.to : edge.from))
      .map((nodeId) => this.nodes.find((node) => node.id === nodeId))
      .filter((node) => node !== undefined);

    connectedNodes.forEach(node => {
      if (!node.isSynced(this)) {
        this.notifications.send(
          NotificationType.WARNING,
          `🔄 Node ${node.id} is out of sync. Syncing now...`
        );
        node.sync(this);
      }
    });

    this.notifications.send(
      NotificationType.INFO,
      `🔗 Block ${block.id} propagated to ${connectedNodes.length} nodes.`,
    );
  }

  async processBlock(block: Block): Promise<BlockProcessResponse> {
    let validNodes = Array.from(this.nodes.values()).filter((node) => {
      return this.consensus.validateBlock(block, node);
    });

    validNodes = validNodes.filter(node => !node.isBusy);

    if (validNodes.length === 0) {
      this.notifications.send(
        NotificationType.WARNING,
        `🚨 Block ${block.id} failed: No valid validator.`
      );

      return { timestamp: Date.now(), success: false };
    }

    validNodes = validNodes.filter((node) =>
      this.edges.some((edge) => edge.from === node.id || edge.to === node.id),
    );

    if (validNodes.length === 0) {
      this.notifications.send(
        NotificationType.ERROR,
        `❌ Block ${block.id} failed: No connected validator.`
      );


      this.notifications.send(
        NotificationType.ERROR,
        `❌ Block ${block.id} failed: No connected validator.`
      );

      return { timestamp: Date.now(), success: false };
    }

    for (const node of validNodes) {
      node.setBusy(true);

      let processingTime = 100; // Base time (100ms)

      if (block.difficulty !== undefined) {
        processingTime += block.difficulty * 2; // PoW
      }

      if (block.stakeThreshold !== undefined) {
        processingTime += block.stakeThreshold / 10; // PoS
      }

      processingTime += node.latency;

      await new Promise((resolve) => setTimeout(resolve, processingTime));

      const successProbability = this.calculateSuccessProbability(node, block);

      if (Math.random() > successProbability) {
        this.notifications.send(
          NotificationType.ERROR,
          `❌ Block ${block.id} failed: Node ${node.id} rejected.`
        );
        continue;
      }

      this.notifications.send(
        NotificationType.INFO,
        `✅ Block ${block.id} accepted by ${node.id} (${NodeType[node.type]}).`
      );

      block.processedBy = node;
      block.status = BlockStatus.SOLVED;

      this.propagateBlock(block);

      node.setBusy(false);

      return { timestamp: Date.now(), success: true, processedBy: node };
    }

    // If no node accepted the block, return failure
    this.notifications.send(
      NotificationType.ERROR,
      `❌ Block ${block.id} failed: No node accepted.`
    );


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

    // Latency preference for faster nodes (affects the ratio)
    baseProbability *= Math.max(0.5, 1 - node.latency / 5000);

    // Gas price preference for higher gas prices (affects the ratio)
    baseProbability *= 1 + block.gasPrice / 10000;

    return Math.max(0, Math.min(baseProbability, 1)); // Clamp between 0 and 1
  }
}
