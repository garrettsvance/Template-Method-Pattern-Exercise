import * as fs from "node:fs";
import * as path from "node:path";

export abstract class Template {
    protected recurse: boolean;
    protected dirName: string;
    protected fileRegExp: RegExp;

    protected constructor(
        dirName: string,
        filePattern: string,
        recurse: boolean = false
    ) {
        this.dirName = dirName;
        this.fileRegExp = new RegExp(filePattern);
        this.recurse = recurse;
    }

    public async templateMethod(filePath: string) {
        if (this.isDirectory(filePath)) {
            if (this.isReadable(filePath)) {
                const files = fs.readdirSync(filePath);

                for (let file of files) {
                    const fullPath = path.join(filePath, file);
                    if (this.isFile(fullPath)) {
                        if (this.isReadable(fullPath)) {
                            await this.countAndSearch(fullPath); //countlinesinfile
                        } else {
                            console.log(`File ${fullPath} is unreadable`);
                        }
                    }
                }

                if (this.recurse) {
                    for (let file of files) {
                        const fullPath = path.join(filePath, file);
                        if (this.isDirectory(fullPath)) {
                            await this.templateMethod(fullPath); //countlinesindirectory
                        }
                    }
                }
            }
        }
    }

    protected abstract countAndSearch(filePath: string): Promise<void>

    public isDirectory(path: string): boolean {
        try {
            return fs.statSync(path).isDirectory();
        } catch (error) {
            return false;
        }
    }

    public isFile(path: string): boolean {
        try {
            return fs.statSync(path).isFile();
        } catch (error) {
            return false;
        }
    }

    public isReadable(path: string): boolean {
        try {
            fs.accessSync(path, fs.constants.R_OK);
            return true;
        } catch (error) {
            return false;
        }
    }
}