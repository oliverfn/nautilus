import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { connect } from 'react-redux';

import { MAX_ACC_LENGTH } from 'libs/crypto';
import SeedStore from 'libs/seed';

import { selectAccountInfo, getSelectedAccountName } from 'selectors/accounts';

import css from './settings.scss';
import classNames from 'classnames';
import Button from 'ui/components/button';
import Text from 'ui/components/input/text';
import { generateAlert } from 'actions/alerts';
import { changeAccountName } from 'actions/accounts';
import { getAccountNamesFromState } from 'selectors/accounts';
/**
 * Change account name component
 */

class AccountName extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        account: PropTypes.object.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** @ignore */
        changeAccountName: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        location: PropTypes.object,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        accountName: PropTypes.string.isRequired,
    };

    state = {
        newAccountName: this.props.accountName,
    };

    /**
     * Check for unique account name and change account name in wallet state and in Seedstore object
     * @returns {undefined}
     **/
    async setAccountName() {
        const { account, accountNames, password, changeAccountName, generateAlert, t, accountName } = this.props;
        const newAccountName = this.state.newAccountName.replace(/^\s+|\s+$/g, '');

        if (newAccountName.length < 1) {
            generateAlert('error', t('addAdditionalSeed:noNickname'), t('addAdditionalSeed:noNicknameExplanation'));
            return;
        }

        if (newAccountName.length > MAX_ACC_LENGTH) {
            generateAlert(
                'error',
                t('addAdditionalSeed:accountNameTooLong'),
                t('addAdditionalSeed:accountNameTooLongExplanation', {
                    maxLength: MAX_ACC_LENGTH,
                }),
            );
            return;
        }

        if (accountNames.map((name) => name.toLowerCase()).indexOf(newAccountName.toLowerCase()) > -1) {
            generateAlert('error', t('addAdditionalSeed:nameInUse'), t('addAdditionalSeed:nameInUseExplanation'));
            return;
        }

        generateAlert('success', t('settings:nicknameChanged'), t('settings:nicknameChangedExplanation'));

        changeAccountName({
            oldAccountName: accountName,
            newAccountName,
        });

        const seedStore = await new SeedStore[account.meta.type](password, accountName, account.meta);
        await seedStore.renameAccount(newAccountName);
    }
    render() {
        const { t, accountName } = this.props;
        const { newAccountName } = this.state;
        return (
            <div className={classNames(css.foo_bxx12)}>
                <div className={classNames(css.set_bxac)}>
                    <form
                        className={css.margin_form}
                        onSubmit={(e) => {
                            e.preventDefault();
                            this.setAccountName();
                        }}
                    >
                        <Text
                            value={newAccountName}
                            label={t('accountManagement:editAccountName')}
                            onChange={(value) => this.setState({ newAccountName: value })}
                        />
                        <Button
                            type="submit"
                            style={{ marginLeft: '28vw', marginTop: '4vw' }}
                            disabled={newAccountName.replace(/^\s+|\s+$/g, '') === accountName}
                        >
                            {t('global:save')}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    accountNames: getAccountNamesFromState(state),
    password: state.wallet.password,
    account: selectAccountInfo(state),
    accountName: getSelectedAccountName(state),
});

const mapDispatchToProps = {
    changeAccountName,
    generateAlert,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withI18n()(AccountName));
