import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import classNames from 'classnames';
import Button from 'ui/components/button';
import { setAccountInfoDuringSetup } from 'actions/accounts';
import css from './index.scss';
import Logos from 'ui/components/logos';

/**
 * Onboarding, Seed Wallet component
 */
class SeedWallet extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.object,
        /**@ignore */
        t: PropTypes.func.isRequired,
    };
    state = {
        ledger: false,
    };
    stepForward(route) {
        this.props.setAccountInfoDuringSetup({
            meta: { type: 'keychain' },
        });

        this.props.history.push(`/onboarding/${route}`);
    }

    render() {
        const { history, t } = this.props;
        return (
            <section className="spage_1">
                <Logos size={20} history={history} />
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12"></div>
                        <div className={classNames(css.sseed_box, css.cre_pgs)}>
                            <h5>{t('seedVault:enterKeyExplanation')}</h5>
                            <input type="password" className={classNames(css.sseed_textline)}></input>
                            <br />
                        </div>
                        <div className={css.onboard_nav}>
                            <Button
                                className="navleft"
                                variant="backgroundNone"
                                onClick={() => this.stepForward('seed-intro')}
                            >
                                <span>&lt;</span> {t('global:goBack')}
                            </Button>
                            <Button
                                className="navright"
                                variant="backgroundNone"
                                onClick={() => this.stepForward('seed-import')}
                            >
                                {t('global:confirm')} <span>></span>
                            </Button>
                        </div>
                    </div>
                </div>
                <footer className={classNames(css.footer)}></footer>
            </section>
        );
    }
}

const mapDispatchToProps = {
    setAccountInfoDuringSetup,
};

export default connect(
    null,
    mapDispatchToProps,
)(withI18n()(SeedWallet));
