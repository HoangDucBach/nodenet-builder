import { Node, NodeType } from "../models/Node";

describe("🛠 Node Type Behaviors", () => {
  it("Full node should not have stake or hashPower", () => {
    const fullNode = new Node({ id: "F1", type: NodeType.FULL_NODE });

    expect(fullNode.stake).toBe(0);
    expect(fullNode.hashPower).toBe(0);
  });

  it("Validator node should only validate if stake > 0", () => {
    const validator = new Node({
      id: "V1",
      type: NodeType.VALIDATOR_NODE,
      stake: 500,
    });

    expect(validator.canValidate()).toBe(true);

    const invalidValidator = new Node({
      id: "V2",
      type: NodeType.VALIDATOR_NODE,
      stake: 0,
    });

    expect(invalidValidator.canValidate()).toBe(false);
  });

  it("Mining node should mine blocks if hashPower > 0", () => {
    const miner = new Node({
      id: "M1",
      type: NodeType.MINING_NODE,
      hashPower: 300,
    });

    expect(miner.canMine()).toBe(true);

    const invalidMiner = new Node({
      id: "M2",
      type: NodeType.MINING_NODE,
      hashPower: 0,
    });

    expect(invalidMiner.canMine()).toBe(false);
  });

  it("Light node should not validate transactions", () => {
    const lightNode = new Node({ id: "L1", type: NodeType.LIGHT_NODE });

    expect(lightNode.canValidate()).toBe(false);
  });
});
