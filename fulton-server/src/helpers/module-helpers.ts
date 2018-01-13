import * as fs from "fs"
import * as path from "path"

const supportExtensions = [".js", ".ts"];
export function loadModules<T=any>(dir: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, function (err, items) {
            if (err) {
                return reject(err);
            }

            let modules = [];

            for (let filename of items) {
                if (supportExtensions.indexOf(path.extname(filename)) > -1) {
                    modules.push(require(path.join(dir, filename)));
                }
            }

            return resolve(modules);
        });
    });
}