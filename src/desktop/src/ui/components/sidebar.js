import React from 'react';
import css from 'ui/views/settings/settings.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import { setAccountInfoDuringSetup } from 'actions/accounts';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Button from 'ui/components/button';


/**
 * Sidebar for dashboard
 */
class Sidebar extends React.PureComponent {
    static propTypes = {

        location: PropTypes.object,
        t: PropTypes.func.isRequired,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
    }
    render() {
        const { t, active } = this.props;
        return (
            <ul className={classNames(css.acco_pg)}>
                <li className={active == 'editname' ? css.active : ''} ><a onClick={() => this.props.history.push('/settings/editname')}>{t('settings:accountName')} </a></li>
                <li className={active == 'viewseed' ? css.active : ''}><a onClick={() => this.props.history.push('/settings/viewseed')}>{t('accountManagement:viewSeed')}</a></li>
                <li className={active == 'address' ? css.active : ''}><a onClick={() => this.props.history.push('/settings/address')}>{t('accountManagement:viewAddresses')}</a></li>
                <li className={active == 'language' ? css.active : ''}><a onClick={() => this.props.history.push('/settings/language')}>{t('settings:language')}</a></li>
                <li className={active == 'node' ? css.active : ''}><a onClick={() => this.props.history.push('/settings/node')}>{t('global:node')}</a></li>
                <li className={active == 'theme' ? css.active : ''}><a onClick={() => this.props.history.push('/settings/theme')}>{t('settings:theme')}</a></li>
                <li className={active == 'currency' ? css.active : ''}><a onClick={() => this.props.history.push('/settings/currency')}>{t('settings:currency')}</a></li>
                <li className={active == 'password' ? css.active : ''}><a onClick={() => this.props.history.push('/settings/password')}>{t('settings:changePassword')}</a></li>
                <li className={active == 'mode' ? css.active : ''}><a onClick={() => this.props.history.push('/settings/mode')}>{t('settings:mode')}</a></li>
                <li className={active == 'accountsetting' ? css.active : ''}><a onClick={() => this.props.history.push('/settings/accountsetting')}>{t('settings:account')} </a></li>
            </ul>
        )
    }
}
const mapDispatchToProps = {
    setAccountInfoDuringSetup,
};

export default connect(null, mapDispatchToProps)(withI18n()(Sidebar));