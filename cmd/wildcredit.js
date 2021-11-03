"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var prisma_1 = __importDefault(require("../lib/prisma"));
var ethereum_block_by_date_1 = __importDefault(require("ethereum-block-by-date"));
var moment_1 = __importDefault(require("moment"));
var web3_1 = __importDefault(require("web3"));
var axios_1 = __importDefault(require("axios"));
var feeAbi = "[{\n  \"anonymous\": false,\n  \"inputs\": [\n    {\n      \"indexed\": false,\n      \"internalType\": \"uint256\",\n      \"name\": \"amount\",\n      \"type\": \"uint256\"\n    }\n  ],\n  \"name\": \"FeeDistribution\",\n  \"type\": \"event\"\n}]";
var feeAddress = "0x487502F921BA3DADAcF63dBF7a57a978C241B72C";
var InfuraKEY = process.env.INFURA_KEY;
var web3 = new web3_1["default"](new web3_1["default"].providers.HttpProvider("https://mainnet.infura.io/v3/" + InfuraKEY));
var dater = new ethereum_block_by_date_1["default"](web3);
var feeConverter = new web3.eth.Contract(JSON.parse(feeAbi), feeAddress);
var endpoint = "https://api.coingecko.com/api/v3/coins/wild-credit/history?date=";
var coin = {
    name: "wildcredit",
    symbol: "WILD"
};
var today = new Date();
today.setUTCHours(0, 0, 0, 0);
/**
 * @dev returns wild fees in usd for any previous day and fees earned today up until now
 * @param day ISO Date string
 */
function getFeesForDay(day) {
    return __awaiter(this, void 0, void 0, function () {
        var genesisDate, Now, Day, dayEnd, blockEnd, revenue, dayStart, blockStart, events, Date, response, historicPrice, totalFees, i, fees;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    genesisDate = moment_1["default"].utc("2021-07-27T06:40:09Z");
                    Now = moment_1["default"].utc();
                    Day = moment_1["default"].utc(day);
                    dayStart = (0, moment_1["default"])(Day).startOf("day");
                    if (Day < genesisDate || Day > Now) {
                        console.log("Date Out of Range");
                        revenue = Number(0.0);
                        return [2 /*return*/, { revenue: revenue }];
                    }
                    if (!(Day.date() === Now.date() &&
                        Day.month() === Now.month() &&
                        Day.year() === Now.year())) return [3 /*break*/, 2];
                    return [4 /*yield*/, web3.eth.getBlockNumber()];
                case 1:
                    blockEnd = _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    dayEnd = (0, moment_1["default"])(Day).endOf("day");
                    return [4 /*yield*/, dater.getDate(dayEnd)];
                case 3:
                    blockEnd = _a.sent();
                    blockEnd = blockEnd.block;
                    _a.label = 4;
                case 4: return [4 /*yield*/, dater.getDate(dayStart)];
                case 5:
                    blockStart = _a.sent();
                    blockStart = blockStart.block;
                    return [4 /*yield*/, feeConverter.getPastEvents("FeeDistribution", {
                            fromBlock: blockStart,
                            toBlock: blockEnd
                        })];
                case 6:
                    events = _a.sent();
                    Date = dayStart.format("DD-MM-YYYY");
                    return [4 /*yield*/, axios_1["default"].get("" + endpoint + Date)];
                case 7:
                    response = _a.sent();
                    console.log(Date);
                    historicPrice = response.data.market_data.current_price.usd;
                    totalFees = 0;
                    for (i = 0; i < events.length; i++) {
                        fees = parseFloat(web3.utils.fromWei(events[i].returnValues.amount));
                        totalFees += fees;
                    }
                    revenue = totalFees * historicPrice;
                    return [2 /*return*/, { revenue: revenue }];
            }
        });
    });
}
// Update Wildcredit daily revenue data
// a cron job should hit this endpoint every half hour or so (can use github actions for cron)
var wildcreditImport = function () { return __awaiter(void 0, void 0, void 0, function () {
    var project, lastId, parsedId, fromDate, genesisDate, toDate, difference, date, index, wildFees, fee;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getProject(coin.name)];
            case 1:
                project = _a.sent();
                lastId = project.lastImportedId;
                parsedId = parseInt(lastId, 10);
                if (isNaN(parsedId)) {
                    throw new Error("unable to parse int.");
                }
                fromDate = new Date(parsedId * 1000);
                console.log("fromdate", fromDate);
                genesisDate = new Date("2021-07-27T06:40:09Z");
                if ((0, moment_1["default"])(fromDate).isBefore(genesisDate) === true) {
                    fromDate = genesisDate;
                }
                fromDate.setUTCHours(0, 0, 0, 0);
                console.log("fromdate", fromDate);
                console.log("fromDate: " + fromDate);
                fromDate.setUTCHours(0, 0, 0, 0);
                console.log("fromDate: " + fromDate);
                console.log("Project: " + project.name + ", from date: " + fromDate);
                toDate = new Date();
                toDate.setUTCHours(0, 0, 0, 0);
                difference = dateDiffInDays(fromDate, toDate);
                date = fromDate;
                index = difference;
                _a.label = 2;
            case 2:
                if (!(index >= 0)) return [3 /*break*/, 6];
                return [4 /*yield*/, getFeesForDay(date)];
            case 3:
                wildFees = _a.sent();
                fee = {
                    date: fromDate.getTime() / 1000,
                    fees: wildFees.revenue
                };
                console.log("Store day " +
                    date +
                    " - " +
                    date.getTime() / 1000 +
                    "to DB - " +
                    fee.fees);
                console.log(fee);
                return [4 /*yield*/, storeDBData(fee, project.id)];
            case 4:
                _a.sent();
                fromDate.setDate(fromDate.getDate() + 1);
                _a.label = 5;
            case 5:
                index--;
                return [3 /*break*/, 2];
            case 6:
                console.log("exit scrape function.");
                return [2 /*return*/];
        }
    });
}); };
var getProject = function (name) { return __awaiter(void 0, void 0, void 0, function () {
    var project;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1["default"].project.findFirst({
                    where: {
                        name: name
                    }
                })];
            case 1:
                project = _a.sent();
                if (!(project == null)) return [3 /*break*/, 4];
                console.log("Project " + name + " doesn't exist. Create it");
                return [4 /*yield*/, prisma_1["default"].project.create({
                        data: {
                            name: name,
                            lastImportedId: "0"
                        }
                    })];
            case 2:
                _a.sent();
                return [4 /*yield*/, prisma_1["default"].project.findUnique({
                        where: {
                            name: name
                        }
                    })];
            case 3:
                project = _a.sent();
                _a.label = 4;
            case 4: return [2 /*return*/, project];
        }
    });
}); };
var storeDBData = function (dayData, projectId) { return __awaiter(void 0, void 0, void 0, function () {
    var day;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1["default"].day.findFirst({
                    where: {
                        date: dayData.date,
                        projectId: projectId
                    }
                })];
            case 1:
                day = _a.sent();
                if (!(day != null)) return [3 /*break*/, 3];
                return [4 /*yield*/, prisma_1["default"].day.update({
                        where: {
                            id: day.id
                        },
                        data: {
                            revenue: dayData.fees
                        }
                    })];
            case 2:
                _a.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, prisma_1["default"].day.create({
                    data: {
                        date: dayData.date,
                        revenue: dayData.fees,
                        projectId: projectId
                    }
                })];
            case 4:
                _a.sent();
                _a.label = 5;
            case 5: 
            // update lastBlockID
            return [4 /*yield*/, prisma_1["default"].project.updateMany({
                    where: {
                        name: coin.name
                    },
                    data: {
                        lastImportedId: dayData.date.toString()
                    }
                })];
            case 6:
                // update lastBlockID
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var dateDiffInDays = function (a, b) {
    var _MS_PER_DAY = 1000 * 60 * 60 * 24;
    var utc1 = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
    var utc2 = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};
wildcreditImport()
    .then(function () {
    process.exit(0);
})["catch"](function (err) {
    console.log(err);
    process.exit(1);
});
