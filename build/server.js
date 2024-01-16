"use strict";

var _express = _interopRequireDefault(require("express"));
var _client = require("@prisma/client");
var _cors = _interopRequireDefault(require("cors"));
var _convertMinutesStringToHourString = require("./utils/convert-minutes-string-to-hour-string");
var _convertHourStringToMinute = require("./utils/convert-hour-string-to-minute");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const app = (0, _express.default)();
app.use(_express.default.json());
app.use((0, _cors.default)({}));
const prisma = new _client.PrismaClient({
  log: ['query']
});
app.get('/games', async (request, response) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true
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
      hourStart: (0, _convertMinutesStringToHourString.convertHourStringToMinutes)(body.hourStart),
      hourEnd: (0, _convertMinutesStringToHourString.convertHourStringToMinutes)(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel
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
      hourEnd: true
    },
    where: {
      gameId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  return response.json(ads.map(ad => {
    return {
      ...ad,
      weekDays: ad.weekDays.split(','),
      hourStart: (0, _convertHourStringToMinute.convertMinutesToHourString)(ad.hourStart),
      hourEnd: (0, _convertHourStringToMinute.convertMinutesToHourString)(ad.hourEnd)
    };
  }));
});
app.get('/ads/:id/discord', async (request, response) => {
  const adId = request.params.id;
  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true
    },
    where: {
      id: adId
    }
  });
  return response.json({
    discord: ad.discord
  });
});
app.listen(5000, () => {
  console.log(`server listenning port ${5000}`);
});