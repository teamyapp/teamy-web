import * as path from 'path';

const tsFileRegex = /\.(tsx?)$/;

export default function compileTimeInject() {
    return {
        name: 'compile-time-inject',
        transform(src: string, id: string) {
            if (tsFileRegex.test(id)) {
                let output = injectFileName(id, src);
                output = injectLineNumber(output)
                return {
                    code: output,
                    map: null,
                };
            }
        },
    };
}

function injectFileName(absFilePath: string, fileContent: string): string {
    const filePath = path.relative(process.cwd(), absFilePath);
    return fileContent.replace(/COMPILE_TIME_INJECT_FILE_PATH/g, filePath);
}

function injectLineNumber(fileContent: string): string {
    const lines = fileContent.split('\n');
    const newLines: string[] = [];
    for (let index = 0; index < lines.length; index++) {
        const lineNumber = index + 1;
        const line = lines[index]
            .replace(/COMPILE_TIME_INJECT_LINE_NUMBER/g, `${lineNumber}`);
        newLines.push(line);
    }

    return newLines.join('\n');
}