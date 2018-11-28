import chalk from "chalk"

if (process.argv.length == 2) {
    console.error(chalk.redBright("ERROR: miss test file name"))
    process.exit(0)
}

require('dotenv').config({ path: "./spec/secret.env" });

let filename = process.argv[process.argv.length - 1]

console.log(chalk.greenBright(`Start Test ${filename}`));

require(`./benchmark/${filename}`).exec().then(() => {
    console.log(chalk.greenBright(`End Test`));
    process.exit(0)
}).catch((e:any) => {
    console.error(chalk.redBright(`ERROR:`), e);
    process.exit(0)
})