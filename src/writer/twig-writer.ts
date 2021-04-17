import { Document } from "../reader/frontmatter-reader";

export type Options = {
    template?: string | { (document: Document): unknown; };
    language: string | { (document: Document): unknown; };
    encoding?: string | { (document: Document): unknown; };
    context?: { (document: Document): unknown; };
    output: { (document: Document): unknown; };
    globals?: { [key: string]: unknown; };
};

export class TwigWriter {
    private template: { (document: Document): unknown; };

    /**
     * Renders twig style templates.
     */
    constructor({ template }: Options) {
        if (typeof template === 'function') {
            this.template = template;
        } else if (typeof template === 'string') {
            this.template = () => template;
        } else {
            this.template = (d) => (d.data || {}).body;
        }
    }

    public render(document: Document): void {

    }
}
