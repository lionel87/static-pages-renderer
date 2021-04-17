import * as fs from 'fs';
import { Readable } from 'stream';
import frontmatter from 'front-matter';
import glob from 'glob';

export type Document<T> = {
    id: string;
    data: T;
    [key: string]: unknown;
}

export type InputFilter = { (candidatePath: string): boolean; }

export class FrontmatterReader<T extends { [key: string]: unknown; }> {

    /**
     * Reads front-matter style markdown files from the filesystem.
     */
    constructor(
        private pattern: string = '**.md',
        private bodyKey: string = 'body',
    ) {
    }

    /**
     * Reads all files from the filesystem into an array.
     */
    public array(filter?: InputFilter): Document<T>[] {
        return this.getMatchingPaths(filter)
            .map(file => {
                const front = frontmatter<T>(fs.readFileSync(file, { encoding: 'utf-8' }));
                return {
                    id: file,
                    data: {
                        ...front.attributes,
                        [this.bodyKey]: front.body,
                    }
                };
            });
    }

    /**
     * Creates an iterator which can iterate trough the files on the filesystem.
     */
    public iterator(filter?: InputFilter): Iterable<Document<T>> {
        const { bodyKey } = this;
        const files = this.getMatchingPaths(filter);
        return {
            *[Symbol.iterator](): Iterator<Document<T>> {
                for (const file of files) {
                    const data = fs.readFileSync(file, { encoding: 'utf-8' });
                    const front = frontmatter<T>(data);
                    yield {
                        id: file,
                        data: {
                            ...front.attributes,
                            [bodyKey]: front.body,
                        }
                    };
                }
            }
        };
    }

    /**
     * Creates an async iterator which can iterate trough the files on the filesystem.
     */
    public asyncIterator(filter?: InputFilter): AsyncIterable<Document<T>> {
        const { bodyKey } = this;
        const files = this.getMatchingPaths(filter);
        return {
            async *[Symbol.asyncIterator](): AsyncIterator<Document<T>> {
                for (const file of files) {
                    yield await new Promise((resolve, reject) => {
                        fs.readFile(file, { encoding: 'utf-8' }, (err, data) => {
                            if (err) {
                                reject(err);
                            } else {
                                const front = frontmatter<T>(data);
                                resolve({
                                    id: file,
                                    data: {
                                        ...front.attributes,
                                        [bodyKey]: front.body,
                                    }
                                });
                            }
                        });
                    });
                }
            }
        };
    }

    /**
     * Stream files from the filesystem in an object stream.
     */
    public stream(filter?: InputFilter): Readable {
        const { bodyKey } = this;
        const files = this.getMatchingPaths(filter);
        let fileIndex = 0;
        return new Readable({
            objectMode: true,
            read(this: Readable, size: number): void {
                if (files.length <= fileIndex) {
                    const file = files[fileIndex++];

                    fs.readFile(file, { encoding: 'utf-8' }, (err, data) => {
                        if (err) {
                            throw err;
                        }

                        const front = frontmatter<T>(data);
                        this.push({
                            id: file,
                            data: {
                                ...front.attributes,
                                [bodyKey]: front.body,
                            }
                        });
                    });
                } else {
                    this.push(null);
                }
            }
        });
    }

    private getMatchingPaths(filter?: InputFilter) {
        const files = glob.sync(this.pattern, { absolute: true });
        if (filter) {
            return files.filter(filter);
        }
        return files;
    }
}
