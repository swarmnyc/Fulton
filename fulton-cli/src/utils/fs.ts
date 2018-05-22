import * as fs from 'fs'
import * as path from 'path'

function make(pth: string): string {
	try {
		fs.mkdirSync(pth);
	} catch (err) {
		if (err.code === 'ENOENT') {
			if (err.message.includes('null bytes') || path.dirname(pth) === pth) {
				throw err;
			}

			make(path.dirname(pth));
			return make(pth);
		}

		try {
			if (!fs.statSync(pth).isDirectory()) {
				throw new Error('The path is not a directory');
			}
		} catch (_) {
			throw err;
		}
	}

	return pth;
};

export function mkdirsSync(input: string) {
	return make(path.resolve(input));
}

export function ensureDirSync(input: string) {
	if (!fs.existsSync(input)) {
		return make(path.resolve(input));
	}
}