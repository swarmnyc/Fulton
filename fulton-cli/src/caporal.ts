import * as chalk from 'chalk';
const caporal = require('caporal');
const BaseError = require('caporal/lib/error/base-error');

// hack caporal to make it adorable
let Help = require('caporal/lib/help');
Help.prototype._getPredefinedOptions = function () {
    return [['-h, --help', 'Display help.'],
    ['-v, --version', 'Display version.'],
    ['--no-color', 'Disable colors.']];
}

let Command = require('caporal/lib/command');

Command.prototype._checkArgsRange = function (argsArr: any[]) {
    const range = this._acceptedArgsRange();
    const argsCount = argsArr.length;

    if (argsCount > range.max) {
        throw new BaseError(`Too many arguments for command ${chalk.default.yellowBright(this.name())}`, {}, this._program);
    }

    if (argsCount < range.min) {
        this._args.forEach((arg: any) => {
            if (arg.isRequired()) {
                throw new BaseError(`The command ${chalk.default.yellowBright(this.name())} requires a ${chalk.default.yellowBright(arg.name())} argument.`, {}, this._program);
            }
        });
    }
}

Command.prototype.getSynopsis = function () {
    let s = this.name() + ' ' + (this.args().map((a: any) => a.synopsis()).join(' '));
    if (this.getAlias()) {
        return `${this.getAlias()}, ${s}`
    } else {
        return s
    }
}

caporal._run = new Proxy(caporal._run, {
    apply: function (run: Function, thisArg: Caporal, args: any[]) {
        let options = args[1]
        options.V = options.v;
        delete options.v;

        run.apply(thisArg, args);
    }
})