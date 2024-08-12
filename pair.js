const PastebinAPI = require('pastebin-js');
const pastebin = new PastebinAPI('EMWTMkQAVfJa9kM-MRUrxd5Oku1U7pgL');
const { makeid } = require('./id');
const express = require('express');
const axios = require('axios');
const sharp = require('sharp'); // Used for image processing
const pino = require("pino");
const {
    default: Venocyber_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore
} = require("maher-zubair-baileys");

let router = express.Router();

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function VENOCYBER_MD_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            let Pair_Code_By_Venocyber_Tech = Venocyber_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: ["Chrome (Linux)", "", ""]
            });

            if (!Pair_Code_By_Venocyber_Tech.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Pair_Code_By_Venocyber_Tech.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Pair_Code_By_Venocyber_Tech.ev.on('creds.update', saveCreds);
            Pair_Code_By_Venocyber_Tech.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    try {
                        // Change profile picture using image URL
                        const imageUrl = 'https://example.com/path/to/image.jpg'; // Replace with the actual image URL
                        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                        if (response.status === 200) {
                            let profilePicture = Buffer.from(response.data, 'binary');

                            // Process image without resizing
                            profilePicture = await sharp(profilePicture)
                                .jpeg({ quality: 100 }) // Ensure image is in JPEG format with highest quality
                                .toBuffer();

                            // Update the profile picture
                            await Pair_Code_By_Venocyber_Tech.updateProfilePicture(Pair_Code_By_Venocyber_Tech.user.id, { image: profilePicture });
                            console.log("Profile picture updated successfully");

                            await delay(100);
                            await Pair_Code_By_Venocyber_Tech.ws.close();
                        } else {
                            console.error(`Failed to fetch image: ${response.statusText}`);
                        }
                    } catch (error) {
                        if (error.response && error.response.status === 404) {
                            console.error("Image not found (404). Please check the URL.");
                        } else {
                            console.error("Error updating profile picture:", error);
                        }
                    } finally {
                        return await removeFile('./temp/' + id);
                    }
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    VENOCYBER_MD_PAIR_CODE();
                }
            });
        } catch (err) {
            console.log("Service restarted");
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }
    return await VENOCYBER_MD_PAIR_CODE();
});

module.exports = router;
