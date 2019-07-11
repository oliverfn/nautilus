import React from 'react';
import { connect } from 'react-redux';
import Logos from 'ui/components/logos';
import css from './index.scss';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { setAccountInfoDuringSetup } from 'actions/accounts';
import { withI18n, Trans } from 'react-i18next';
import Button from 'ui/components/button';
import Dropzone from 'ui/components/dropzone';

import { indexToChar } from 'libs/hlx/converter';
class SeedImport extends React.PureComponent {
  
    static propTypes = {
        history: PropTypes.object,
        t: PropTypes.func.isRequired,
    };

    state = {
        ledger: false,
        importBuffer:[]
    };

    stepForward(route) {
        this.props.setAccountInfoDuringSetup({
            meta: { type: 'keychain' },
        });

        this.props.history.push(`/onboarding/${route}`);
    }

    onPaste = (e) => {
        e.preventDefault();
    };

    onDrop = async (buffer) => {
        if (!buffer) {
            return this.props.generateAlert(
                'error',
                'Error opening keystore file',
                'There was an error opening keystore file',
            );
        }
        console.log(buffer);
        
        this.setState({
            importBuffer: buffer,
        });
    };

    onChange= async(e)=>{
        try{
            const seed= await Electron.importSeed(buffer,e.target.value);
           
            let seedSequence="";
            seed[0].seed.map((byte,index)=>{
            const letter = indexToChar(byte);
            seedSequence+= letter                                       
            });
            console.log(seedSequence);
            
        }
        catch(err){

        }
    }

    render() {
        const { history, t } = this.props;
        return (
            <div>
            <Logos/>
            <section className="spage_1">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                    <h1>Enter Seed</h1>
                  
                    </div>
                    <div className={classNames(css.sseed_box, css.cre_pgs)}>

                        <h3 style={{fontSize:'24px'}}>{t('seedReentry:enterYourSeed')}</h3>
                        <input type="text" className={classNames(css.sseed_textline)}></input><br /><br />
                        <div className={classNames(css.filebox)}>
                        <Dropzone onDrop={this.onDrop} />
                        </div>
                        <br/>
                        <input type="password" className={classNames(css.sseed_textline)} placeholder="Enter key" style={{position:'relative',top:'60px'}} onChange={this.onChange}></input><br /><br />

                    </div>
                    <div className={css.onboard_nav}>
                        
                        <Button className="navleft" variant="backgroundNone" onClick={() => this.stepForward('seed-wallet')}>{t('global:goBack')} <span>></span></Button>
                        <Button className="navright" variant="backgroundNone" onClick={() => this.stepForward('seed-verify')}>{t('global:confirm')} <span>></span></Button>
                    </div>

                </div>
            </div>
        </section>
</div>
        )
    }
}

const mapDispatchToProps = {
    setAccountInfoDuringSetup,
};

export default connect(null, mapDispatchToProps)(withI18n()(SeedImport));