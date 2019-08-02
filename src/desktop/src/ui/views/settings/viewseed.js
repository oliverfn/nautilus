import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';

import {
    selectAccountInfo,
    getSelectedAccountName,
    getSelectedAccountMeta
} from 'selectors/accounts';
import { MAX_SEED_LENGTH } from 'libs/hlx/utils';
import { indexToChar, capitalize } from 'libs/hlx/converter';
import SeedStore from 'libs/seed';
import { connect } from 'react-redux';

import Modal from 'ui/components/modal/Modal';
import ModalPassword from 'ui/components/modal/Password';
import Button from 'ui/components/button';
import Icon from 'ui/components/icon';
import SeedExport from 'ui/global/seedExport';

import css from './settings.scss';
import classNames from 'classnames';


/**
 * View seed component
 */

class Viewseed extends React.PureComponent {
    static propTypes = {
        accountName:PropTypes.string.isRequired,
        accountMeta:PropTypes.object.isRequired,
        password:PropTypes.object.isRequired,
        account: PropTypes.object.isRequired,
        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,


    }
    state = {
        action: null,
        seed: false,
    };
    componentDidMount() {
        this.seed = [];
    }

    componentWillUnmount() {
        for (let i = 0; i < this.seed.length * 3; i++) {
            this.seed[i % this.seed.length] = 0;
        }

        Electron.garbageCollect();
    }

    /**
     * Retrieve seed and set to state
     */
    setSeed = async () => {
        const { accountName, accountMeta, password} = this.props;
        console.log("ACCOUNTID===", this.props.account);
        

        const seedStore = await new SeedStore[accountMeta.type](password, accountName, accountMeta);
        console.log('sseedd',seedStore);
        console.log(await seedStore.getSeed());
        this.seed = await seedStore.getSeed();
        this.setState({
            seed: true,
        });
    };

    render() {

        const { location, history, t } = this.props;
        const { meta, accountName } = this.props.account;
        const { seed, action } = this.state;
        const currentKey = location.pathname.split('/')[2] || '/';
        if (meta && !SeedStore[meta.type].isSeedAvailable) {
            return (
                <div>

                    <section className="spage_1">
                        <div className="container">
                            <div className="col-lg-8">
                                <div className={classNames(css.foo_bxx12)}>
                                    <div cllassname={classNames(css.set_bxac)}>
                                        <Button type="submit" style={{ marginLeft: '39vw' }} variant="backgroundNone" onClick={() => this.props.history.push('/wallet')} ><span >
                                            <Icon icon="cross" size={14} />
                                        </span></Button>
                                        <h5 style={{ marginLeft: '3vw' }}>{t('accountManagement:viewSeed')}</h5>
                                        {/* <input type="text" className={classNames(css.ssetting_textline)}></input><br /><br /> */}



                                        {typeof meta.index === 'number' && (
                                            <Fragment>
                                                <hr />
                                                <p>
                                                    {t('viewSeed:accountIndex')}: <strong>{meta.index}</strong>
                                                </p>
                                            </Fragment>
                                        )}
                                        {typeof meta.page === 'number' && meta.page > 0 && (
                                            <Fragment>
                                                <hr />
                                                <p>
                                                    <hr />
                                                    {t('viewSeed:accountPage')}: <strong>{meta.page}</strong>
                                                </p>
                                            </Fragment>
                                        )}




                                        {/* <div style={{ marginLeft: "8%" }}>
                                        <Button className="modal_navLeft" style={{ margin: '10vw 0vw 1vw' }}>{t('viewSeed:viewSeed')}</Button>
                                        <Button className="modal_navRight" style={{ margin: '10vw 1vw 0vw' }} onClick={() => this.stepForward('done')}>{t('export')}</Button>
                                    </div> */}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

            );
        }

        if (action && !seed) {
            return (
                <ModalPassword
                    isOpen
                    inline
                    onSuccess={this.setSeed}
                    onClose={() => this.setState({ action: null })}
                    seedName={accountName}
                    content={{
                        title: action === 'view' ? t('viewSeed:enterPassword') : t('login:enterPassword'),
                        confirm:
                            action === 'view'
                                ? t('accountManagement:viewSeed')
                                : t('seedVault:exportSeedVault')
                    }}
                />
            );

        }
console.log("CHECKSUMSEED===",this.seed);

        const checksum = seed ? Electron.getChecksum(this.seed) : '';
        return (
            <React.Fragment>
                <form>
                    <div>
                        <p className={css.seed}>
                            <span>
                                {seed && action === 'view'
                                    ? this.seed.map((byte, index) => {
                                        if (index % 3 !== 0) {
                                            return null;
                                        }
                                        const letter = indexToChar(byte);
                                        return (
                                            <React.Fragment key={`${index}${letter}`}>
                                                {letter}
                                                {indexToChar(this.seed[index + 1])}
                                                {indexToChar(this.seed[index + 2])}{' '}
                                            </React.Fragment>
                                        );
                                    })
                                    : new Array(MAX_SEED_LENGTH / 2).join('.. ')}
                            </span>
                            {seed && action === 'view' && (
                                <small>
                                    {t('checksum')}: <strong>{checksum}</strong>
                                </small>
                            )}
                        </p>
                    </div>
                    <fieldset>
                        <Button
                            className="small"
                            onClick={() => this.setState({ action: action !== 'view' ? 'view' : null })}
                        >
                            {action === 'view' ? t('settings:hide') : t('settings:show')}
                        </Button>
                        {/* <Button
                            className="small"
                            onClick={() => (!seed ? this.setState({ action: 'print' }) : window.print())}
                        >
                            {t('paperWallet')}
                        </Button> */}
                        <Button className="small" onClick={() => this.setState({ action: 'export' })}>
                            {t('seedVault:exportSeedVault')}
                        </Button>
                    </fieldset>
                   
                </form>
                <Modal
                    variant="fullscreen"
                    isOpen={seed && action === 'export'}
                    onClose={() => this.setState({ action: null })}
                >
                    <SeedExport
                        seed={this.seed || []}
                        title={accountName}
                        onClose={() => this.setState({ action: null })}
                    />
                </Modal>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    accountName:getSelectedAccountName(state),
    accountMeta:getSelectedAccountMeta(state),
    account: selectAccountInfo(state),
    password:state.wallet.password
});

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(Viewseed));