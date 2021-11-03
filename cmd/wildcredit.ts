import prisma from "../lib/prisma";
import EthDater from "ethereum-block-by-date";
import moment from "moment";
import Web3 from "web3";
import axios from "axios";

const feeAbi = `[{
  "anonymous": false,
  "inputs": [
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    }
  ],
  "name": "FeeDistribution",
  "type": "event"
}]`;

const feeAddress = "0x487502F921BA3DADAcF63dBF7a57a978C241B72C";
const InfuraKEY = process.env.INFURA_KEY;

const web3 = new Web3(
  new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${InfuraKEY}`)
);
const dater = new EthDater(web3);

const feeConverter = new web3.eth.Contract(JSON.parse(feeAbi), feeAddress);

const endpoint = `https://api.coingecko.com/api/v3/coins/wild-credit/history?date=`;

const coin = {
  name: "wildcredit",
  symbol: "WILD",
};

const today = new Date();
today.setUTCHours(0, 0, 0, 0);

/**
 * @dev returns wild fees in usd for any previous day and fees earned today up until now
 * @param day ISO Date string
 */
async function getFeesForDay(day: any) {
  const genesisDate = moment.utc("2021-07-27T06:40:09Z");

  const Now = moment.utc();
  const Day = moment.utc(day);
  let dayEnd;
  let blockEnd;
  let revenue;
  const dayStart = moment(Day).startOf("day");
  if (Day < genesisDate || Day > Now) {
    console.log("Date Out of Range");
    revenue = Number(0.0);
    return { revenue };
  }
  if (
    Day.date() === Now.date() &&
    Day.month() === Now.month() &&
    Day.year() === Now.year()
  ) {
    blockEnd = await web3.eth.getBlockNumber();
  } else {
    dayEnd = moment(Day).endOf("day");
    blockEnd = await dater.getDate(dayEnd);
    blockEnd = blockEnd.block;
  }

  let blockStart = await dater.getDate(dayStart);
  blockStart = blockStart.block;
  const events = await feeConverter.getPastEvents("FeeDistribution", {
    fromBlock: blockStart,
    toBlock: blockEnd,
  });
  const Date = dayStart.format("DD-MM-YYYY");

  const response = await axios.get(`${endpoint}${Date}`);
  console.log(Date);
  const historicPrice = response.data.market_data.current_price.usd;

  let totalFees = 0;
  for (let i = 0; i < events.length; i++) {
    const fees = parseFloat(web3.utils.fromWei(events[i].returnValues.amount));
    totalFees += fees;
  }
  revenue = totalFees * historicPrice;

  return { revenue };
}

// Update Wildcredit daily revenue data
// a cron job should hit this endpoint every half hour or so (can use github actions for cron)
const wildcreditImport = async () => {
  // Use the updatedAt field in the Day model and compare it with the
  // timestamp associated with the fee, if it's less than the timestamp
  // then update the day's revenue

  // Get last imported id: we will start importing from there
  const project = await getProject(coin.name);
  const lastId = project.lastImportedId;
  const parsedId = parseInt(lastId, 10);
  if (isNaN(parsedId)) {
    throw new Error("unable to parse int.");
  }
  let fromDate = new Date(parsedId * 1000);
  console.log("fromdate", fromDate);

  const genesisDate = new Date("2021-07-27T06:40:09Z");
  if (moment(fromDate).isBefore(genesisDate) === true) {
    fromDate = genesisDate;
  }
  fromDate.setUTCHours(0, 0, 0, 0);
  console.log("fromdate", fromDate);

  console.log("fromDate: " + fromDate);

  fromDate.setUTCHours(0, 0, 0, 0);
  console.log("fromDate: " + fromDate);

  console.log("Project: " + project.name + ", from date: " + fromDate);

  const toDate = new Date();
  toDate.setUTCHours(0, 0, 0, 0);

  const difference = dateDiffInDays(fromDate, toDate);

  const date = fromDate;
  for (let index = difference; index >= 0; index--) {
    const wildFees = await getFeesForDay(date);

    const fee = {
      date: fromDate.getTime() / 1000,
      fees: wildFees.revenue,
    };

    console.log(
      "Store day " +
        date +
        " - " +
        date.getTime() / 1000 +
        "to DB - " +
        fee.fees
    );
    console.log(fee);
    await storeDBData(fee, project.id);
    fromDate.setDate(fromDate.getDate() + 1);
  }
  console.log("exit scrape function.");

  return;
};

const getProject = async (name: string) => {
  let project = await prisma.project.findFirst({
    where: {
      name: name,
    },
  });

  if (project == null) {
    console.log("Project " + name + " doesn't exist. Create it");
    await prisma.project.create({
      data: {
        name: name,
        lastImportedId: "0",
      },
    });

    project = await prisma.project.findUnique({
      where: {
        name: name,
      },
    });
  }

  return project;
};

const storeDBData = async (
  dayData: { date: any; fees: any; blockHeight?: string },
  projectId: number
) => {
  const day = await prisma.day.findFirst({
    where: {
      date: dayData.date,
      projectId: projectId,
    },
  });

  if (day != null) {
    await prisma.day.update({
      where: {
        id: day.id,
      },
      data: {
        revenue: dayData.fees,
      },
    });
  } else {
    await prisma.day.create({
      data: {
        date: dayData.date,
        revenue: dayData.fees,
        projectId: projectId,
      },
    });
  }

  // update lastBlockID
  await prisma.project.updateMany({
    where: {
      name: coin.name,
    },
    data: {
      lastImportedId: dayData.date.toString(),
    },
  });

  return;
};

const dateDiffInDays = (a: Date, b: Date) => {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const utc2 = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};

wildcreditImport()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
