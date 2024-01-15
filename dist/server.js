"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const cors_1 = __importDefault(require("cors"));
const convert_minutes_string_to_hour_string_1 = require("./utils/convert-minutes-string-to-hour-string");
const convert_hour_string_to_minute_1 = require("./utils/convert-hour-string-to-minute");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({}));
const prisma = new client_1.PrismaClient({
    log: ['query']
});
app.get('/games', async (request, response) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                }
            }
        }
    });
    return response.json(games);
});
app.post('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    const body = request.body;
    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart: (0, convert_minutes_string_to_hour_string_1.convertHourStringToMinutes)(body.hourStart),
            hourEnd: (0, convert_minutes_string_to_hour_string_1.convertHourStringToMinutes)(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel,
        }
    });
    return response.status(201).json(ad);
});
app.get('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;
    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourStart: true,
            hourEnd: true,
        },
        where: {
            gameId,
        },
        orderBy: {
            createdAt: 'desc',
        }
    });
    return response.json(ads.map((ad) => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: (0, convert_hour_string_to_minute_1.convertMinutesToHourString)(ad.hourStart),
            hourEnd: (0, convert_hour_string_to_minute_1.convertMinutesToHourString)(ad.hourEnd),
        };
    }));
});
app.get('/ads/:id/discord', async (request, response) => {
    const adId = request.params.id;
    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where: {
            id: adId,
        }
    });
    return response.json({
        discord: ad.discord,
    });
});
app.listen(3333);
