import { readFileSync, writeFileSync } from 'fs';

import { program } from 'commander';
import dotenv from 'dotenv';

import { FillKeysArgs } from './types';

dotenv.config();

program.name('cli').description('Json Tools').version('0.0.0');
program
    .command('fill:diff')
    .requiredOption('--sourcePath <string>', 'absolute path of the source file')
    .requiredOption('--subjectPath <string>', 'absolute path of the file to compare to and fill in the missing keys')
    .option(
        '--destPath <string>',
        'absolute path of the destination file to write the result, if it is not provided will overwrite the subjectPath path',
    )
    .description('It will sort dest keys to match the source order and fill in the missing keys')
    .action(async args => {
        fillKeys(args as unknown as FillKeysArgs);
    });

program.parse();

function fillKeys({ sourcePath, subjectPath, destPath }: FillKeysArgs) {
    const newDest: Record<string, unknown> = {};

    const parsedSource = JSON.parse(readFileSync(sourcePath, 'utf8'));
    const sourceKeys = Object.keys(parsedSource);
    const parsedDest = sortDestSameAsSource(parsedSource, JSON.parse(readFileSync(subjectPath, 'utf8')));

    for (const sourceKey of sourceKeys) {
        if (Object.prototype.hasOwnProperty.call(parsedDest, sourceKey)) {
            newDest[sourceKey] = parsedDest[sourceKey];
        } else {
            newDest[sourceKey] = parsedSource[sourceKey];
        }
    }

    writeFileSync(destPath ?? subjectPath, JSON.stringify(newDest, null, 2));
}

function sortDestSameAsSource(
    parsedSource: Record<string, unknown>,
    parsedDest: Record<string, unknown>,
): Record<string, unknown> {
    const sortedDest: Record<string, unknown> = {};
    for (const sourceKey in parsedSource) {
        if (Object.prototype.hasOwnProperty.call(parsedDest, sourceKey)) {
            sortedDest[sourceKey] = parsedDest[sourceKey];
        }
    }

    return sortedDest;
}
