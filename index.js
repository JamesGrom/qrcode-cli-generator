import QRCode from "qrcode";
import inquirer from "inquirer";
import Jimp from "jimp";
import * as fs from "fs";

const main = async () => {
	console.log(`running GenQRCodes cli `);

	const { NumQRCodes } = await inquirer.prompt({
		type: "number",
		name: "NumQRCodes",
		message: "how many qr code files would you like to generate",
		default: 10,
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
		default: `batch_`,
	});

	const qrStrings = [];
	for (let i = 0; i < NumQRCodes; i++) {
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

		const logo = await Jimp.read(`${logoFilePath}`);
		logo.scale(0.5);
		const qrImage = await Jimp.read(pathToQRCode);

		const x = (qrImage.getWidth() - logo.getWidth()) / 2;
		const y = (qrImage.getHeight() - logo.getHeight()) / 2;

		return qrImage.composite(logo, x, y).writeAsync(pathToQRCode);
	});

	await Promise.all(promisesToSaveQrStrings);
};

main();
