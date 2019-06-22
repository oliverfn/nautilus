import React from 'react';
import css from './settings.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { Switch, Route, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import Top from '../../components/topbar';
import Sidebar from '../../components/sidebar';
import SettingsLanguage from 'ui/views/settings/language';
import SettingsNode from 'ui/views/settings/node';
import Currency from 'ui/views/settings/currency';
import SettingsTheme from 'ui/views/settings/themesetting';
import AccountName from 'ui/views/settings/editName';
import Viewseed from 'ui/views/settings/viewseed';
import Viewaddress from 'ui/views/settings/viewaddress';
import Changepassword from 'ui/views/settings/changepassword';
import SettingsMode from 'ui/views/settings/mode';

/**
 * Setting component
 */

class Settings extends React.PureComponent {
    static propTypes = {

        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
    }
    render() {

        const { history } = this.props;
        return (
            <div>
                <Top
                    bal={'none'}
                    main={'block'}
                    user={'none'}
                    history={history}
                />
                <section className="spage_1">
                    <div className="container">
                        <div className="col-lg-4">
                            <div className={classNames(css.menu_box)}>
                                <Sidebar
                                    disp={'none'}
                                    history={history}
                                />
                                <a ></a>
                            </div>
                        </div>
                    </div>
                </section>
                <Switch>
                    {/* <Route path="/settings" component={AccountName} /> */}
                    <Route path="/settings/language" component={SettingsLanguage} />
                    <Route path="/settings/node" component={SettingsNode} />
                    <Route path="/settings/currency" component={Currency} />
                    <Route path="/settings/theme" component={SettingsTheme} />
                    <Route path="/settings/viewseed" component={Viewseed} />
                    <Route path="/settings/address" component={Viewaddress} />
                    <Route path="/settings/password" component={Changepassword} />
                    <Route path="/settings/mode" component={SettingsMode} />
                </Switch>
            </div>
        );
    }

}

const mapStateToProps = (state) => ({

});

const mapDispatchToProps = {

};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withI18n()(Settings)));