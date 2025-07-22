import fs from "fs/promises";
import path from "path";
import archiver from "archiver";
import { createWriteStream } from "fs";

const LOG_DIR = path.join(__dirname, "../../logs");
const ZIP_DIR = path.join(__dirname, "../../zipped");

class LogService {
  async getLogFiles() {
    const files = await fs.readdir(LOG_DIR);
    const stats = await Promise.all(
      files
        .filter((file) => file.endsWith(".log"))
        .map(async (name) => {
          const filePath = path.join(LOG_DIR, name);
          const { size, mtime } = await fs.stat(filePath);
          return { name, size, createdAt: mtime };
        })
    );
    return stats.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getLogContent(fileName: string) {
    const filePath = path.join(LOG_DIR, fileName);
    return await fs.readFile(filePath, "utf-8");
  }
}

const logService = new LogService();
export default logService;
