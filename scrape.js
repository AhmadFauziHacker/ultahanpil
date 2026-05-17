const fs = require('fs');
const https = require('https');
const path = require('path');

const baseUrl = 'https://wishlygift.netlify.app/';

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                file.close(resolve);
            });
        }).on('error', function(err) {
            fs.unlink(dest, () => {});
            reject(err.message);
        });
    });
};

async function scrape() {
    const htmlRes = await fetch(baseUrl);
    const html = await htmlRes.text();
    fs.writeFileSync('index.html', html);
    console.log('Saved index.html');
    
    // Create folders
    if (!fs.existsSync('img')) fs.mkdirSync('img');
    if (!fs.existsSync('audio')) fs.mkdirSync('audio');
    
    const images = [
        'img/hera1.jpeg', 'img/hera2.jpeg', 'img/hera3.jpeg', 'img/hera4.PNG', 
        'img/hera5.jpeg', 'img/hera6.jpeg', 'img/hera7.jpeg', 'img/hera8.jpeg'
    ];
    
    // Regex to find any other matches
    const imgRegex = /src=["'](img\/[^"']+)["']/g;
    let match;
    while ((match = imgRegex.exec(html)) !== null) {
        if (!images.includes(match[1])) images.push(match[1]);
    }
    
    const audioRegex = /src=["'](audio\/[^"']+)["']/g;
    const audios = [];
    while ((match = audioRegex.exec(html)) !== null) {
        if (!audios.includes(match[1])) audios.push(match[1]);
    }
    
    console.log('Found images:', images);
    console.log('Found audios:', audios);
    
    for (const img of images) {
        console.log('Downloading', img);
        await download(baseUrl + img, img);
    }
    for (const audio of audios) {
        console.log('Downloading', audio);
        // Replace spaces with %20 for fetching
        const encodedUrl = baseUrl + audio.split('/').map(segment => encodeURIComponent(segment)).join('/');
        await download(encodedUrl, audio);
    }
    console.log('Done!');
}
scrape().catch(console.error);
