import QRCode from "qrcode";
import inquirer from "inquirer";
import Jimp from "jimp";
import * as fs from "fs";

const main = async () => {
	console.log(`running GenQRCodes cli `);
	const font = await Jimp.loadFont(Jimp.FONT_SANS_8_BLACK);

	const { NumQRCodes } = await inquirer.prompt({
		type: "number",
		name: "NumQRCodes",
		message: "how many qr code files would you like to generate",
		default: 10,
	});
	const { StartingId } = await inquirer.prompt({
		type: "number",
		name: "StartingId",
		message: "what id # would you like this batch to start with?",
		default: 0,
	});
	console.log(`creating ${NumQRCodes} qrcodes`);

	const { RootUrl } = await inquirer.prompt({
		type: "input",
		name: "RootUrl",
		message: "what should the root url be?",
		default: `thetawise.ai?`,
	});
	const logoFiles = fs.readdirSync("./logos");
	const { logoFilePath } = await inquirer.prompt({
		type: "list",
		choices: [...logoFiles],
		name: "logoFilePath",
		message: "which logoFile would you like insert into the qrcode?",
		default: `./logos/logoNonTransparent.png`,
	});

	const { BatchName } = await inquirer.prompt({
		type: "input",
		name: "BatchName",
		message: "what should this batch of qr codes be called?",
		default: `batchname`,
	});

	const qrStrings = [];
	for (let i = StartingId; i < NumQRCodes + StartingId; i++) {
		qrStrings.push(`${RootUrl}&fid=${i}`);
	}

	const promisesToSaveQrStrings = qrStrings.map(async (val, i) => {
		const pathToQRCode = `./GeneratedCodes/${BatchName}${i}.png`;

		await QRCode.toFile(pathToQRCode, val, {
			type: "png",
			margin: 0,
			scale: 16,
			errorCorrectionLevel: "H",
		});

		const logo = await Jimp.read(`./logos/${logoFilePath}`);
		logo.scale(0.5);
		const qrImage = await Jimp.read(pathToQRCode);

		const x = (qrImage.getWidth() - logo.getWidth()) / 2;
		const y = (qrImage.getHeight() - logo.getHeight()) / 2;

		// Create a new image with extra space at the bottom for text
		const newHeight = qrImage.getHeight() + 50; // 50 pixels for text
		const newImage = new Jimp(qrImage.getWidth(), newHeight, 0xffffffff); // White background

		// Composite original qrImage and logo to newImage
		newImage.composite(qrImage, 0, 0);
		newImage.composite(logo, x, y);

		// qrImage.composite(logo, x, y);

		// Add textual ID at the bottom of the QR code
		const text = `ID: ${i}`;
		const textX = 10; // Choose appropriate x-position based on your needs
		const textY = newHeight - 40; // Adjust y-position to place text at the bottom

		newImage.print(font, textX, textY, text);

		return newImage.writeAsync(pathToQRCode);
		// return qrImage.writeAsync(pathToQRCode);
	});

	await Promise.all(promisesToSaveQrStrings);
};

main();
