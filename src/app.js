const axios = require("axios");
const cheerio = require("cheerio");
// const url = "https://mp.weixin.qq.com/s/wS62HbTPBzsyFf1DUKmMsA";

if (process.argv.length < 3) {
  console.log("Please provide the url !!!");
  console.log("Usage: node src/app.js <url>");
  process.exit(1);
}
const url = process.argv[2];

headers = {
  authority: "mp.weixin.qq.com",
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-language": "zh,en;q=0.9,en-US;q=0.8,zh-CN;q=0.7,zh-TW;q=0.6",
  // cookie:
  //   "pgv_pvid=1683789445432604; ua_id=9s2GivdM4bBLoPLZAAAAAOV9TS3kSThhmx8_LjQW-TA=; RK=IXvECb98a3; ptcz=3912e6d3b6629ffb3446c44cae7b450b4350a4d50b5de95407fd1be124e7e457; fqm_pvqid=a0cc90d1-adf1-4082-ac40-e0215d747240; wxuin=94369298280935; mm_lang=zh_CN; _clck=3205195127|1|fiz|0; xid=6c1b69471c5bcb47d2af12651b8b563f; pac_uid=0_5c1808c5fb3c3; iip=0; _qimei_uuid42=1830e00101f1005d27a72c6eda6282da7a3857fbe2; _qimei_q36=; _qimei_h38=4180a1aa27a72c6eda6282da0900000de1830e; _qimei_fingerprint=2418c5c06268736a5478b4e359dc5e0c; suid=ek164645967533248258; current-city-name=sz; rewardsn=; wxtokenkey=777",
  pragma: "no-cache",
  "upgrade-insecure-requests": "1",
  "user-agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
};

const crawl = async () => {
  const response = await axios.get(url, {
    headers,
  });

  const html = response.data;
  //   console.log(html);
  const $ = cheerio.load(html);
  const title = $("h1#activity-name").html();
  console.log(title);
  const image_url = $("#page-content").find("img");

  console.log(image_url.length);
  image_url.map(async (i, el) => {
    let img_url = $(el).attr("data-src");
    if (img_url) {
      console.log("Downloading....");
      console.log(img_url);
      const today = moment().format("YYYYMMDD_HHmmss");

      await downloadFile(img_url, `image/${today}-${i}.png`);
    }
  });
  return title;
};

const moment = require("moment");

// console.log(today);

const fs = require("fs");
const { pipeline: streamPipeline } = require("stream");

const downloadFile = async (fileUrl, filePath) => {
  try {
    const writer = fs.createWriteStream(filePath);
    const response = await axios({
      method: "GET",
      url: fileUrl,
      responseType: "stream",
    });

    // 使用 stream.Pipeline 来处理流
    await new Promise((resolve, reject) => {
      streamPipeline(response.data, writer, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    console.log("Download finished.");
  } catch (err) {
    console.error("Download error:", err);
  }
};

crawl().then((data) => {
  {
    console.log("Done");
  }
});
