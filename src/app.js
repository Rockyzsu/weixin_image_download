const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");
const fs = require("fs");
const { pipeline: streamPipeline } = require("stream");

// 检查命令行参数是否提供了 URL
if (process.argv.length < 3) {
  console.error("Please provide the URL!");
  console.error("Usage: node src/app.js <url>");
  process.exit(1);
}

const url = process.argv[2];

// 请求头配置
let headers= { 
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7', 
  'accept-language': 'zh,en;q=0.9,en-US;q=0.8,zh-CN;q=0.7,zh-TW;q=0.6', 
  'cache-control': 'no-cache', 
  'pragma': 'no-cache', 
  'priority': 'u=0, i', 
  'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"', 
  'sec-ch-ua-mobile': '?0', 
  'sec-ch-ua-platform': '"Windows"', 
  'sec-fetch-dest': 'document', 
  'sec-fetch-mode': 'navigate', 
  'sec-fetch-site': 'none', 
  'sec-fetch-user': '?1', 
  'upgrade-insecure-requests': '1', 
  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36', 
  'Cookie': 'rewardsn=; wxtokenkey=777'
}

// 下载文件函数
const downloadFile = async (fileUrl, filePath) => {
  try {
    const writer = fs.createWriteStream(filePath);
    const response = await axios({
      method: "GET",
      url: fileUrl,
      responseType: "stream",
    });

    // 使用 streamPipeline 处理流
    await new Promise((resolve, reject) => {
      streamPipeline(response.data, writer, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    console.log(`Download finished: ${filePath}`);
  } catch (err) {
    console.error(`Download error for ${fileUrl}:`, err.message);
  }
};

// 爬取页面内容并下载图片 搜狗 文章
const crawl = async () => {
  try {
    console.log("Fetching page content...");
    const response = await axios.get(url, { headers });
    const html = response.data;

    const $ = cheerio.load(html);
    const title = $("h1#activity-name").text().trim();
    console.log(`Page title: ${title}`);

    const images = $("#page-content").find("img");
    console.log(`Found ${images.length} images.`);

    images.each(async (i, el) => {
      const imgUrl = $(el).attr("data-src");
      if (imgUrl) {
        console.log(`Downloading image ${i + 1}: ${imgUrl}`);
        const timestamp = moment().format("YYYYMMDD_HHmmss");
        const filePath = `image/${timestamp}-${i + 1}.png`;

        // 确保目录存在
        fs.mkdirSync("image", { recursive: true });

        await downloadFile(imgUrl, filePath);
      }
    });

    console.log("Crawling completed.");
    return title;
  } catch (err) {
    console.error("Error during crawling:", err.message);
  }
};

// 微信PC客户端
const crawlPC = async () => {
  try {
    console.log("Fetching page content...");
    const response = await axios.get(url, { headers });
    const html = response.data;
    console.log(html)
    const $ = cheerio.load(html);
    const title = $("h1#activity-name").text().trim();
    console.log(`Page title: ${title}`);

    const images = $("#page-content").find("img");
    console.log(`Found ${images.length} images.`);

    images.each(async (i, el) => {
      const imgUrl = $(el).attr("data-src");
      if (imgUrl) {
        console.log(`Downloading image ${i + 1}: ${imgUrl}`);
        const timestamp = moment().format("YYYYMMDD_HHmmss");
        const filePath = `image/${timestamp}-${i + 1}.png`;

        // 确保目录存在
        fs.mkdirSync("image", { recursive: true });

        await downloadFile(imgUrl, filePath);
      }
    });

    console.log("Crawling completed.");
    return title;
  } catch (err) {
    console.error("Error during crawling:", err.message);
  }
};

// 主程序入口
(async () => {
  await crawlPC();
  console.log("Done.");
})();