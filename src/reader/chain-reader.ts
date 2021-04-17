export class ChainReader<T> {
    private readers: (Iterable<T> | AsyncIterable<T>)[];

    constructor(...inputReaders: (Iterable<T> | AsyncIterable<T>)[]) {
        this.readers = inputReaders;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T> {
        for await(const reader of this.readers) {
            for await(const item of reader) {
                yield item;
            }
        }
    }
}
