import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import Scrollbar from 'ui/components/scrollbar';
import ReactMarkdown from 'react-markdown';

import { acceptTerms, acceptPrivacy } from 'actions/settings';

import { enTermsAndConditionsIOS, enPrivacyPolicyIOS } from 'terms-conditions';
import Language from 'ui/components/input/language';
import Button from 'ui/components/button'
import Logos from 'ui/components/logos';
import css from './welcome.scss';
import classNames from 'classnames';
/**
 * Helix Welcome Screen component
 */
class Welcome extends React.PureComponent {
    static propTypes = {
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
        acceptedPrivacy: PropTypes.bool.isRequired,
        acceptedTerms: PropTypes.bool.isRequired,
        acceptTerms: PropTypes.func.isRequired,
        acceptPrivacy: PropTypes.func.isRequired,

    }
    state = {
        step: 'language',
        scrollEnd: false,
    };

    onNextClick = () => {
        console.log("onclick", this.props);
        const { history, acceptedTerms, acceptedPrivacy, acceptTerms, acceptPrivacy } = this.props;
        const { step } = this.state;

        // if (acceptedTerms && acceptedPrivacy) {
        //     return history.push('/onboarding/seed-intro');
        // }

        switch (step) {
            case 'language':
                this.setState({
                    step: 'terms',
                    scrollEnd: false,
                });
                break;
            case 'terms':
                acceptTerms();
                this.setState({
                    step: 'privacy',
                    scrollEnd: false,
                });
                break;
            default:
                acceptPrivacy();
                history.push('/onboarding/seed-intro');
        }
    }

    render() {
        const { language, t } = this.props;
        const { step, scrollEnd } = this.state;
        let markdown = '';
        markdown = step === 'terms' ? enTermsAndConditionsIOS : enPrivacyPolicyIOS;

        let styles = {
            color: '#E9B339',
            fontSize: '20px'

        };

        return (
            <div>
                <Logos size={20} />
                <section className={css.home}>
                    {step === 'language' ? (
                        <React.Fragment>
                            <h1 style={{ fontSize: '63px' }}>{t('welcome:thankYou')}</h1>
                            <h6>{t('welcome:thankYouDescription')}<span style={styles}><b>.</b></span></h6>
                            <br></br>
                            <Language></Language>
                            <br></br>
                        </React.Fragment>
                    ) : (
                            <React.Fragment>
                                <div className={css.privacy}>
                                    <h1>
                                        {step === 'terms' ? 'Terms and Conditions' : 'Privacy Policy'}
                                    </h1>
                                    <article>
                                        <Scrollbar contentId={step} onScrollEnd={() => this.setState({ scrollEnd: true })}>
                                            <ReactMarkdown source={markdown} />
                                        </Scrollbar>
                                    </article>
                                </div>
                            </React.Fragment>
                        )}
                    <Button disabled={step !== 'language' && !scrollEnd}
                        onClick={this.onNextClick}
                        className="backgroundNone">
                        {step === 'language'
                            ? t('continue')
                            : !scrollEnd ? t('terms:readAllToContinue') : t('terms:accept')}
                        <span style={styles}> ></span></Button>
                </section>
                {/* <footer className={classNames(css.none)}></footer> */}
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    acceptedPrivacy: state.settings.acceptedPrivacy,
    acceptedTerms: state.settings.acceptedTerms
});

const mapDispatchToProps = {
    acceptTerms,
    acceptPrivacy,
};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(Welcome));