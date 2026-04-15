// Dòng này phải nằm ở trên cùng để nạp biến môi trường trước khi làm việc khác
require('dotenv').config();
const cron = require("node-cron");
const cheerio = require("cheerio")

//config scrape du lieu tu trang fan made citizenfreefly cho nhanh
// Lấy URL từ file .env. Thay vì ghi thẳng URL ra đây.
const TARGET_URL = "https://www.citizenfreefly.com/star-citizen-free-fly-events/";
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

//dung string noti để làm mốc chống spam ping
let lastSeenAlertedText = '';

async function checkForFreeFly() {
    console.log(`[${new Date().toLocaleString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' })}] Đang cào dữ liệu từ trang CitizenFreeFly...`);

    try {
        // 15 second timeout to avoid hanging forever
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(TARGET_URL, {
            signal: controller.signal,
            headers: {
                // Rất quan trọng khi scrape web: Giả lập trình duyệt thực để hệ thống chống bot của web không chặn bạn
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        clearTimeout(timeout);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        // Website trả về HTML, dùng res.text() rồi nạp vào Cheerio
        const html = await res.text();

        //nap du lieu html vao cheerio
        const $ = cheerio.load(html);

        let foundEventText = '';

        //quet cac the h1 h2 ... thường chứa noti liên quan đến free fly
        $('h1, h2, h3, li, p').each((i, el) => {
            //lay text, xóa khoảng trống và dấu xuống dòng thừa
            const text = $(el).text().trim().replace(/\s+/g, ' ');

            // dựa theo formet hiện tại cảu trng, t lấy các cụm từ như "FREE FLY" / "Free Fly" / "Free-Fly" 
            if (text.includes("Star Citizen is Free to Play") || text.includes("Alert: Play Star Citizen FREE")) {
                foundEventText = text;
                return false; //tim thay r end loop
            }
        });

        if (foundEventText) {
            console.log(`phát hiện thông báo:  ${foundEventText}`);

            //nếu thống báo mới != thông báo cũ -> event mới
            if (foundEventText !== lastSeenAlertedText) {
                console.log("Event mới được phát hiện!, send noti to discord");
                await sendDiscordAlert(foundEventText, TARGET_URL);
                lastSeenAlertedText = foundEventText; // luu lai de check lan sau
            } else console.log("Event cũ, không gửi noti")
        } else {
            console.log(' - Không tìm thấy đoạn text chứa thông tin Free Fly nào trên trang lúc này.');
            await sendDiscordAlert("Không tìm thấy thông tin Free Fly", TARGET_URL);
        }

    } catch (error) {
        console.error('Error scraping the website: ', error);
    }
}

async function sendDiscordAlert(alertText, url) {
    //dis require a specific payload structure
    const payload = {
        content: `🚀 **Star Citizen Free Fly Detected!**\nTrang CitizenFreeFly vừa 
        cập nhật thông báo mới:\n> **${alertText}**\nChi tiết kiểm tra tại: ${url}`
    };

    try {
        const res = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            console.log("Successfully pushed alert to Discord!");
        } else console.log("Failed to push alert to Discord! status: ", res.status);
    } catch (error) {
        console.error('Network error while contacting Discord API:', error);
    }
}

//running time boiii
//start the bot
console.log("Star Citizen Web Scraper Tracker initialized.");

// run immediately on start up for testing 
checkForFreeFly();

//schedule to run once every 3 days at midnight
cron.schedule("0 0 */3 * *", () => {
    checkForFreeFly();
})