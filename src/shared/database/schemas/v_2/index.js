import merge from 'lodash/merge';
import map from 'lodash/map';
import v1Schema from '../v_1';

const migration = (_, newRealm) => {
    const walletData = newRealm.objectForPrimaryKey('Wallet', 1);

    // Bump wallet version.
    walletData.version = 2;
};

export default map(v1Schema, (schema) => {
    if (schema.name === 'WalletSettings') {
        return merge({}, schema, {
            properties: {
                /**
                 * Determines if deep linking is enabled
                 */
                newtermsupdatenotice: {
                    type: 'string',
                    default: '',
                },
                newtermsdate: {
                    type: 'string',
                    default: '',
                },
            },
        });
    }

    return schema;
});

export { migration };
