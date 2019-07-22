import { ActionTypes } from '../actions/settings';
import { DEFAULT_NODE, DEFAULT_NODES, QUORUM_SIZE } from '../config';
const initialState = {
    /**
     * Selected locale for wallet
     */
    locale: 'en',
    /**
     * Selected language name
     */
    language: 'English (International)',

    node: DEFAULT_NODE,
    /**
     * List of IRI nodes
     */
    nodes: DEFAULT_NODES,
    /**
     * List of custom nodes added by user
     */
    customNodes: [],
    /**
     * Active wallet mode
     * Could either be Expert or Standard
     */
    mode: 'Standard',
    quorum: {
        /**
         * User-defined quorum size
         */
        size: QUORUM_SIZE,
        /**
         * Determines if quorum is enabled
         */
        enabled: true,
    },

    /**
     * Selected currency for conversions in wallet
     */
    currency: 'USD',
    /**
     * Active theme name
     */
    themeName: 'Default',
    /**
     * Keeps track if user has accepted terms and conditions during the initial setup
     */
    acceptedTerms: false,
    /**
     * Keeps track if a user has accepted privacy agreement during the initial setup
     */
    acceptedPrivacy: false,
    /**
     * Determines if native OS notifications are enabled
     */
    notifications: {
        general: true,
        confirmations: true,
        messages: true,
    },
    /**
     * Determines the status of AsyncStorage to realm migration
     */
    completedMigration: false,
};
const settingsReducer = (state = initialState, action) => {
    switch (action.type) {
        case ActionTypes.SET_LOCALE:
            return {
                ...state,
                locale: action.payload,
            };
        case ActionTypes.UPDATE_THEME:
            return {
                ...state,
                themeName: action.payload,
            };
        case ActionTypes.SET_LANGUAGE:
            return {
                ...state,
                language: action.payload,
            };
    }
    return state;
};
export default settingsReducer;