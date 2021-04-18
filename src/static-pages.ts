import { series, createWithContext, Handler, Api } from 'tque';

type StaticPagesServices = {
    registerFinalizer(fn: Function): Api<StaticPagesServices, any>;
    args(fn: Function, ...args: unknown[]): Function;
};

type StaticPages = {
    (data: any): Promise<any[]>;
    finalize: { (): void };
};

export type StaticPagesApi = Api<StaticPagesServices, any>;

export function staticPages(controllers: Handler<StaticPagesApi, any>[] = []) {
    const registeredFinalizers = new Set<Function>();
    const services: StaticPagesServices = {
        registerFinalizer(fn) {
            if (!registeredFinalizers.has(fn)) {
                registeredFinalizers.add(fn);
            }
            return this;
        },
        args(fn: Handler<StaticPagesApi, any>, ...args: unknown[]) {
            return function (d: unknown) {
                args.unshift(d);
                return fn.apply(this, args);
            };
        },
    };

    const fn = createWithContext(services, series(controllers)) as StaticPages;

    fn.finalize = async function finalize() {
        for (const finalizer of registeredFinalizers) {
            await finalizer();
        }
        registeredFinalizers.clear();
    };

    return fn;
}
