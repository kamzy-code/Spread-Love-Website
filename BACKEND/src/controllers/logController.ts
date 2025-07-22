import fs from "fs";
import path from "path";
import { AuthRequest } from "../middlewares/authMiddleware";
import { NextFunction, Response } from "express";
import { logsLogger } from "../utils/logger";
import archiver from "archiver";
import { HttpError } from "../utils/httpError";
import logService from "../services/logService";

const LOG_DIR = path.join(__dirname, "../../logs");

class LogController {
  async getAllLogs(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;

    logsLogger.info("Fetch logs initiated", {
      user: user.userId,
      role: user.role,
      action: "FETCH_LOGS",
    });
    try {
      // const files = fs
      //   .readdirSync(LOG_DIR)
      //   .filter((file) => file.endsWith(".log")) // ignore .gz
      //   .map((file) => ({
      //     name: file,
      //     size: fs.statSync(path.join(LOG_DIR, file)).size,
      //     createdAt: fs.statSync(path.join(LOG_DIR, file)).birthtime,
      //   }));

      const files = await logService.getLogFiles();
      res.status(200).json({ message: "Fetch logs succesful", files });
      logsLogger.info("Fetch logs successful", {
        user: user.userId,
        role: user.role,
        action: "FETCH_LOGS_SUCCESS",
      });
      return;
    } catch (error: any) {
      logsLogger.error(`Fetch logs error: ${error.message}`, {
        user: user.userId,
        role: user.role,
        action: "FETCH_LOGS_FAILED",
        error,
      });
      next(error);
      return;
    }
  }

  async getLogContent(req: AuthRequest, res: Response, next: NextFunction) {
    const { file } = req.params;
    const user = req.user!;

    logsLogger.info("View log initiated", {
      user: user.userId,
      role: user.role,
      file,
      action: "VIEW_LOG",
    });

    if (!file || typeof file !== "string") {
      logsLogger.warn("View logs failed: File name is required.", {
        user: user.userId,
        role: user.role,
        action: "VIEW_LOG_FAILED",
      });
      next(new HttpError(400, "File name is required."));
      return;
    }

    try {
      const content = await logService.getLogContent(file);
      res.send(content);
      logsLogger.info("View log successful", {
        user: user.userId,
        role: user.role,
        file,
        action: "VIEW_LOG_SUCCESS",
      });
      return;
    } catch (error: any) {
      logsLogger.error(`View log failed: ${error.message}`, {
        user: user.userId,
        role: user.role,
        file,
        action: "VIEW_LOG_FAILED",
        error,
      });

      next(error);
      return;
    }
  }

  async zipLogs(req: AuthRequest, res: Response, next: NextFunction) {
    const user = req.user!;
    const { files } = req.body;

    logsLogger.info("Zip logs initiated", {
      user: user.userId,
      role: user.role,
      action: "ZIP_LOGS",
    });

    if (!Array.isArray(files) || files.length === 0) {
      logsLogger.warn("Zip logs failed: No files provided", {
        user: user.userId,
        role: user.role,
        action: "ZIP_LOGS_FAILED",
      });
      next(new HttpError(400, "No files provided to zip"));
      return;
    }

    try {
      const archiveName = `logs-${Date.now()}.zip`;
      const archivePath = path.join(LOG_DIR, archiveName);

      const output = fs.createWriteStream(archivePath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", () => {
        res.json({ archive: archiveName, size: archive.pointer() });
        logsLogger.info("Zip logs successful", {
          user: user.userId,
          role: user.role,
          action: "ZIP_LOGS_SUCCESS",
        });
      });

      archive.on("error", (err) => {
        logsLogger.error(`Zip logs archiver error: ${err.message}`, {
          user: user.userId,
          role: user.role,
          action: "ZIP_LOGS_FAILED",
          error: err,
        });
        next(new HttpError(500, err.message));
      });

      archive.pipe(output);
      files.forEach((file: string) => {
        const safeFile = path.basename(file);
        const filePath = path.join(LOG_DIR, safeFile);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: safeFile });
        } else {
          logsLogger.warn("Zip logs: file not found", {
            user: user.userId,
            file: safeFile,
            action: "ZIP_LOGS_FILE_NOT_FOUND",
          });
        }
      });
      archive.finalize();
    } catch (error: any) {
      logsLogger.error(`Zip logs error: ${error.message}`, {
        user: user.userId,
        role: user.role,
        action: "ZIP_LOGS_FAILED",
        error,
      });
      next(error);
      return;
    }
  }
}

const logController = new LogController();
export default logController;
