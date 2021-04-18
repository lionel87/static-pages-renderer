/*!
 * static-pages-renderer <https://github.com/lionel87/static-pages-renderer>
 *
 * Copyright (c) 2021, László BULIK.
 * Released under the MPL-2.0 License.
 */

import { series, createWithContext } from 'tque';

export async function staticPages({ input, controllers, controllerUtils,  }) {
    createWithContext(controllerUtils || {}, series(controllers || []));
}
