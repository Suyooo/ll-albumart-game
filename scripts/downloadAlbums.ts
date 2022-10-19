import fs from "fs";
import axios from "axios";
import {ALBUMPOOL} from "../src/js/albumpool.js";

const downloadQueue: { titleJa?: string, titleEn?: string, url: string }[] = [
    {
        "titleJa": "Shadow Effect",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd50.png"
    },
    {
        "titleJa": "Vroom Vroom",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd49.png"
    },
    {
        "titleJa": "永遠の一瞬",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd48.png"
    },
    {
        "titleJa": "ドラマCD 純情アマービレ",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd47.png"
    },
    {
        "titleJa": "Bound for TOKIMEKI",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd46.png"
    },
    {
        "titleJa": "Future Parade",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd45.png?v2"
    },
    {
        "titleJa": "Eutopia/EMOTION/stars we chase【ミア・テイラー盤】",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd44.png"
    },
    {
        "titleJa": "Eutopia/EMOTION/stars we chase【三船栞子盤】",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd43.png"
    },
    {
        "titleJa": "Eutopia/EMOTION/stars we chase」【鐘 嵐珠盤】",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd42.png"
    },
    {
        "titleJa": "Infinity！Our wings!!",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd41.png"
    },
    {
        "titleJa": "Eternal Light",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd40.png"
    },
    {
        "titleJa": "ENJOY IT！",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd39.png"
    },
    {
        "titleJa": "夢が僕らの太陽さ",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd38.png"
    },
    {
        "titleJa": "Colorful Dreams! Colorful Smiles!",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd37.png"
    },
    {
        "titleJa": "ミラクル STAY TUNE！",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd36.png?v2"
    },
    {
        "titleJa": "「LIVE with a smile!」",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd35.png?v2"
    },
    {
        "titleJa": "L！L！L！ (Love the Life We Live)",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd34.png?v2"
    },
    {
        "titleJa": "MONSTER GIRLS",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd33.png?v2"
    },
    {
        "titleJa": "Swinging！",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd32.png"
    },
    {
        "titleJa": "Maze Town",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd31.png"
    },
    {
        "titleJa": "THE SECRET NiGHT",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd30.png"
    },
    {
        "titleJa": "ドラマCD 青春カプリッチョ",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd29.png"
    },
    {
        "titleJa": "Sound of TOKIMEKI",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd28.png"
    },
    {
        "titleJa": "Awakening Promise / 夢がここからはじまるよ",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd27b.png"
    },
    {
        "titleJa": "Butterfly / Solitude Rain / VIVID WORLD【朝香果林盤】",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd26.png"
    },
    {
        "titleJa": "Butterfly / Solitude Rain / VIVID WORLD【桜坂しずく盤】",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd25.png"
    },
    {
        "titleJa": "Butterfly / Solitude Rain / VIVID WORLD【近江彼方盤】",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd24.png"
    },
    {
        "titleJa": "サイコーハート / La Bella Patria / ツナガルコネクト【天王寺璃奈盤】",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd23.png"
    },
    {
        "titleJa": "サイコーハート / La Bella Patria / ツナガルコネクト【エマ・ヴェルデ盤】",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd22.png"
    },
    {
        "titleJa": "サイコーハート / La Bella Patria / ツナガルコネクト【宮下 愛盤】",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd21.png"
    },
    {
        "titleJa": "Dream with You / Poppin' Up! / DIVE！【優木せつ菜盤】",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd20.png"
    },
    {
        "titleJa": "Dream with You / Poppin' Up! / DIVE！【中須かすみ盤】",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd19.png"
    },
    {
        "titleJa": "Dream with You / Poppin' Up! / DIVE！【上原歩夢盤】",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd18.png"
    },
    {
        "titleJa": "NEO SKY, NEO MAP!",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd17.png"
    },
    {
        "titleJa": "虹色Passions！",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd16.png?v=201010"
    },
    {
        "titleJa": "Just Believe!!!",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd15.png"
    },
    {
        "titleJa": "無敵級*ビリーバー",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd12.png"
    },
    {
        "titleJa": "ドラマCD 日常コンチェルト",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd08.png"
    },
    {
        "titleJa": "Sing & Smile!!",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd07.png"
    },
    {
        "titleJa": "Dream Land！Dream World！",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd06.png"
    },
    {
        "titleJa": "SUPER NOVA",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd05.png"
    },
    {
        "titleJa": "Love U my friends",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd04.png"
    },
    {
        "titleJa": "ドラマCD 放課後ファンタジア",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd02.png"
    },
    {
        "titleJa": "TOKIMEKI Runners",
        "url": "https://www.lovelive-anime.jp/nijigasaki/img/cd/cd01.png"
    }
];

(async () => {
    for (const album of ALBUMPOOL) {
        if (album.url) continue;

        const dl = downloadQueue.find(dl => dl.titleEn == album.titleEn || dl.titleJa == album.titleJa);
        if (dl) {
            const filename = album.artistEn.replace(" High School Idol Club","")
                    .replace(/ \(CV: [^)]*\)/,"") .replace("-_","_")
                    .toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-") + "_"
                + album.titleEn.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-")
                    .replace(/-$/g,"") + ".jpg";

            if (dl.url.startsWith("https")) {
                await axios({
                    url: dl.url,
                    responseType: "stream",
                }).then(response => {
                    new Promise(() => {
                        response.data.pipe(fs.createWriteStream("public/albumart/" + filename));
                    });
                });
            } else {
                fs.copyFileSync("public/albumart/" + dl.url, "public/albumart/" + filename);
                fs.unlinkSync("public/albumart/" + dl.url);
            }
            album.url = "albumart/" + filename;
        }
    }

    fs.writeFileSync("src/js/albumpool.json", JSON.stringify(ALBUMPOOL, null, 4));
})();