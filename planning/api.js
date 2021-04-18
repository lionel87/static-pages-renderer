const { series, createWithContext } = require('tque');

function staticPages(controllers = []) {
    const registeredFinalizers = new Set();
    const services = {
        registerFinalizer(fn) {
            if (!registeredFinalizers.has(fn)) {
                registeredFinalizers.add(fn);
            }
        },
        args(fn, ...args) {
            return function (d) {
                args.unshift(d);
                return fn.apply(this, args);
            };
        },
    };

    const fn = createWithContext(services, series(controllers));

    fn.finalize = async function finalize() {
        for (const finalizer of registeredFinalizers) {
            await finalizer();
        }
        registeredFinalizers.clear();
    };

    return fn;
}

const worker = staticPages([() => { throw new Error(`error`); }]);

const input = [{ d: 1 }, { d: 2 }];

worker(input)
    .then(d => d.forEach(d => console.log(d)), e => console.error(e.stack))
    .then(() => worker.finalize(), console.error);



{
    $source: 'pages/any.md'
}
