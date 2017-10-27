import createFacetReducer from '../factories/createFacetReducer';
import { fromJS } from 'immutable';
import createMount from './createMount';

const reducer = createFacetReducer(fromJS([]));

/**
 * Enables users to simply call a function to attach alert reducer
 * functionality to an existing reducer under the correct key.
 *
 * @returns an enhanced reducer
 */
reducer.mount = createMount(reducer);

export default reducer;