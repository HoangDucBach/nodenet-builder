import { Block } from "../models/Block";
import { nanoid } from "nanoid";

export class TestcaseGenerator {
    /**
     * 🔹 Tạo tập hợp blocks dựa vào level.
     * @param level Mức độ khó của test (1 - dễ, 10 - khó).
     * @returns Mảng chứa các blocks được tạo ra.
     */
    public static generateBlocks(level: number): Block[] {
        const blocks: Block[] = [];
        const baseCount = Math.ceil(5 + Math.pow(level, 1.2));
        const maxGasPrice = Math.ceil(100 + Math.log(level + 1) * 50);
        const maxDifficulty = Math.ceil(100 + Math.log(level + 1) * 100);
        const maxStake = Math.ceil(5000 + Math.log(level + 1) * 1000);
        const errorBlockCount = Math.floor(Math.sqrt(level - 4));

        for (let i = 0; i < baseCount; i++) {
            const gasPrice = Math.floor(Math.random() * maxGasPrice);
            const difficulty = Math.floor(Math.random() * maxDifficulty);
            const stakeThreshold = Math.floor(Math.random() * maxStake);

            const block = new Block(nanoid(), gasPrice, difficulty, stakeThreshold);
            blocks.push(block);
        }

        // Ở level cao, thêm block lỗi để kiểm thử hệ thống
        if (level > 5) {
            for (let i = 0; i < errorBlockCount; i++) {
                const errorBlock = new Block(nanoid(), -1, -1, -1); // Block lỗi
                blocks.push(errorBlock);
            }
        }

        return blocks;
    }
}