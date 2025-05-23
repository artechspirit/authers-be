"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const typeorm_1 = require("typeorm");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("./entities/User");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
dotenv_1.default.config();
const PORT = process.env.PORT || 4000;
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true, // hanya untuk dev, jangan di prod
    logging: false,
    entities: [User_1.User],
    migrations: [],
    subscribers: [],
});
exports.AppDataSource.initialize()
    .then(() => {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: "http://localhost:3000", // ganti sesuai frontend URL
        credentials: true,
    }));
    // app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use("/api/auth", authRoutes_1.default);
    app.use("/api/user", userRoutes_1.default);
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})
    .catch((error) => console.log(error));
