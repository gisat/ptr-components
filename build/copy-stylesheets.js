const BUNDLE = process.env.BUNDLE === 'true';

const path = require('path'),
	glob = require("glob"),
	fs = require("fs")

glob("src/**/*.*(scss|css)", {}, function (er, files) {
	files.forEach(function (file) {
		const parsedPath = path.parse(file);
		const relativePath = parsedPath.dir.split("src/")[1];
		const basePath = parsedPath.base;
		
		if (!fs.existsSync(`lib/${relativePath}`)) {
			fs.mkdirSync(`lib/${relativePath}`, { recursive: true });	
		}
		fs.copyFileSync(file, `lib/${relativePath}/${basePath}`);
	});
});