import React from 'react';
import css from './settings.scss';
import classNames from  'classnames';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import { Switch, Route ,withRouter} from 'react-router-dom';
import { connect } from 'react-redux';
import Top from '../../components/topbar';
import Icon from 'ui/components/icon';
import Sidebar from '../../components/sidebar';
import Button from 'ui/components/button';
import Select from 'ui/components/input/select';



/**
 * Node settings component
 */

 class SettingsNode extends React.PureComponent{
     static propTypes= {

        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
     }
     render(){

        const { location, history, t } = this.props;
        const currentKey = location.pathname.split('/')[2] || '/';
         return(
            <div>
                    <Top
                        bal={'none'}
                        main={'block'}
                        user={'none'}
                        history={this.props.history}
                    />
                    <section className="spage_1">
                        <div className="container">
                        <div className="col-lg-4">
                            <div className={classNames(css.menu_box)}>

                                {/* <hr className={classNames(css.ser_bts)}/> */}
                                <a ></a>
                            </div>

                            </div>
                            <div className="col-lg-8">
                                {/* <div className={classNames(css.set_bx)}> */}
                                    <div className={classNames(css.foo_bxx12)}>
                                        <div cllassname={classNames(css.set_bxac)}>
                                        <Button type="submit"style={{marginLeft:'39vw'}}  variant="backgroundNone" onClick={() => this.props.history.push('/wallet')} ><span >
                              <Icon icon="cross" size={14} />
                            </span></Button> 
                                            <h5 style={{marginLeft:'14vw',marginTop:'0vw'}}>{t('advancedSettings:selectNode')}</h5>
                                           
                                            <h5 style={{marginLeft:'14vw',marginTop:'11vw'}}>{t('advancedSettings:addCustomNode')}</h5>
                                             <input type="text" className={classNames(css.ssetting_textline)}></input><br /><br />
                                            
                                            <Button style={{marginLeft:'14vw',marginTop:'4vw'}} onClick={() => this.stepForward('done')}>{t('global:save')}</Button>
                                            <div  className={classNames(css.spe_bx)}>
                                               {/* <a href="#" className={classNames(css.spe_boxs)}><img src="images/lock.png" alt=""/><br/>Lorem Ipsum  -></a>
                                               <hr className={classNames(css.ser_bts)}/>
                                         		<a href="#" className={classNames(css.ar_btns)}><img src="images/down_ar.png" alt=""/></a> */}
                                            </div>
                                        </div>
                                    </div>
                                {/* </div> */}
                            </div>
                        </div>
                    </section>
            </div>
         );
     }
 }
 const mapDispatchToProps = {

};
export default connect(null, mapDispatchToProps)(withI18n()(SettingsNode));