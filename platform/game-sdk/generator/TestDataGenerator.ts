import { TestType } from "../engine/TestEngine";

export interface TestScenario {
  name: string;
  description: string;
  testType: TestType;
  inputData: any;
  expectedOutcome: any;
}

export class TestScenarioGenerator {
  static generate(level: number): TestScenario[] {
    const scenarios: TestScenario[] = [];

    // 1️⃣ Kịch bản kiểm tra Block Validity
    scenarios.push({
      name: `Block Validity Test - Level ${level}`,
      description:
        "Kiểm tra xem block sai có bị từ chối và block đúng có được ghi nhận không.",
      testType: TestType.BLOCK_VALIDITY,
      inputData: {
        validBlocks: level * 5, // Level cao → nhiều block hợp lệ hơn
        invalidBlocks: Math.max(1, level - 1), // Level cao → Ít block sai hơn
      },
      expectedOutcome: {
        validBlockAcceptanceRate: 100, // 100% block hợp lệ phải được ghi nhận
        invalidBlockRejectionRate: 100, // 100% block sai phải bị từ chối
      },
    });

    // 2️⃣ Kịch bản kiểm tra tải mạng
    scenarios.push({
      name: `Network Load Test - Level ${level}`,
      description: "Gửi liên tục nhiều block để kiểm tra giới hạn chịu tải.",
      testType: TestType.NETWORK_LOAD,
      inputData: {
        transactionRate: 50 * level, // Tốc độ giao dịch tăng theo level
        maxAllowedLatency: Math.max(100, 1000 - level * 50), // Giảm độ trễ tối đa theo level
      },
      expectedOutcome: {
        maxTPS: 1000 - level * 30, // Cần đạt mức TPS tối thiểu để không bị nghẽn
        avgLatency: level * 10, // Độ trễ trung bình không được quá lớn
      },
    });

    // 3️⃣ Kịch bản kiểm tra Gas Price
    scenarios.push({
      name: `Gas Price Optimization - Level ${level}`,
      description: "Tìm mức phí gas tối ưu khi xử lý giao dịch.",
      testType: TestType.GAS_PRICE,
      inputData: {
        transactionComplexity: level * 10, // Độ phức tạp của giao dịch
        maxGasAllowed: 10000 - level * 500, // Giảm gas tối đa theo level
      },
      expectedOutcome: {
        avgGasUsed: Math.max(1000, 5000 - level * 200), // Cần tối ưu gas xuống mức chấp nhận được
      },
    });

    // 4️⃣ Kịch bản kiểm tra bảo mật (Security)
    scenarios.push({
      name: `Security Test - Level ${level}`,
      description: "Mô phỏng các loại tấn công blockchain.",
      testType: TestType.SECURITY,
      inputData: {
        sybilAttackNodes: level > 5 ? level * 2 : 0, // Level cao hơn → Sybil Attack mạnh hơn
        fiftyOneAttackValidatorStake: level > 3 ? 5000 + level * 200 : 0, // Level cao hơn → Có validator mạnh hơn
      },
      expectedOutcome: {
        sybilAttackSuccessRate: 0, // Sybil Attack không được thành công
        fiftyOneAttackSuccessRate: 0, // 51% Attack không được thành công
      },
    });

    // 5️⃣ Kịch bản kiểm tra hiệu suất đồng thuận (Consensus Efficiency)
    scenarios.push({
      name: `Consensus Performance Test - Level ${level}`,
      description: "Kiểm tra tốc độ xác nhận block theo cơ chế đồng thuận.",
      testType: TestType.CONSENSUS_EFFICIENCY,
      inputData: {
        consensusMechanism: level % 2 === 0 ? "PoW" : "PoS", // Luân phiên giữa PoW & PoS
        expectedBlockTime: level * 100 + 200, // Level cao hơn → Cần block time thấp hơn
      },
      expectedOutcome: {
        actualBlockTime: Math.max(100, 300 - level * 10), // Hệ thống phải đạt block time gần mức mong đợi
      },
    });

    return scenarios;
  }
}
