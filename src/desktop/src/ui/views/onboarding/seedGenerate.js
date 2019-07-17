import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import css from './index.scss';
import classNames from 'classnames';
import Button from 'ui/components/button';
import Logos from 'ui/components/logos';
import Lottie from 'react-lottie';
import Icon from 'ui/components/icon';
import * as animationData from 'animations/done.json';

import { createRandomSeed, randomBytes } from '../../../utils/crypto';
import { indexToChar } from 'libs/hlx/converter';
import { MAX_SEED_LENGTH } from 'libs/hlx/utils';

class SeedGenerate extends React.PureComponent {
    static propTypes = {
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        t: PropTypes.func.isRequired,
        loop: PropTypes.bool,
    };



    state = {
        seed: Electron.getOnboardingSeed() || createRandomSeed(),
        seed1: [],
        seed2: [],
        seed3: [],
        seed4: [],
        scramble: Electron.getOnboardingSeed() ? new Array(MAX_SEED_LENGTH).fill(0) : randomBytes(MAX_SEED_LENGTH, 27),
        existingSeed: Electron.getOnboardingSeed(),
        clicks: [],
        viewSeed: 'none',

        viewReload: 'block',
        viewReloadBlockTwo: 'block',
        viewReloadBlockThree: 'block',
        viewReloadBlockFour: 'block',
        viewSeedTwo: 'none',
        viewSeedThree: 'none',
        viewSeedFour: 'none',
        counter: 1,
        displaySeedTwo: 'none',
        displaySeedThree: 'none',
        displaySeedFour: 'none',
        disableOne: false,
        disableTwo: false,
        disableThree: false,
        disableFour: false,
    }
    componentDidMount() {
        this.frame = 0;
        this.unscramble();
    }

    componentWillUnmount() {
        this.frame = -1;
    }

    onUpdatedSeed = (seed) => {
        this.setState(() => ({
            seed,
        }));
    };

    /**
     * Update individual seed byte to random
     * @param {event} event - Click event
     * @param {number} position - Letter seed position index
     * @returns {undefined}
     */
    updateLetter = (e) => {

        const { seed, clicks, scramble, viewReloadBlockTwo, viewReloadBlockThree, viewReloadBlockFour, viewSeedTwo, viewSeedThree, viewSeedFour, displaySeedTwo, displaySeedThree, displaySeedFour, disableOne, disableTwo, disableThree, disableFour } = this.state;

        const position = e.target.value;
        const newClicks = clicks.indexOf(position) < 0 ? clicks.concat([position]) : clicks;
        const newSeed = seed.slice(0);
        newSeed[position] = createRandomSeed(1)[0];

        scramble[position] = 64;
        const seed1 = newSeed.slice(0, 16);
        const seed2 = newSeed.slice(16, 32);
        const seed3 = newSeed.slice(32, 48);
        const seed4 = newSeed.slice(48, 64);

        let reloadBlockTwo = viewReloadBlockTwo;
        let seedTwo = viewSeedTwo;

        let reloadBlockThree = viewReloadBlockThree;
        let seedThree = viewSeedThree;

        let reloadBlockFour = viewReloadBlockFour;
        let seedFour = viewSeedFour;

        let seedTwoBox = displaySeedTwo;
        let seedThreeBox = displaySeedThree;
        let seedFourBox = displaySeedFour;

        let boxOneDisable = disableOne;
        let boxTwoDisable = disableTwo;
        let boxThreeDisable = disableThree;
        let boxFourDisable = disableFour;

        const clicksLeft = 16 - clicks.length;
        switch (String(clicksLeft)) {
            case '13':
                reloadBlockTwo = 'none';
                seedTwo = 'block';
                seedTwoBox = 'block';
                boxOneDisable = true;
                break;
            case '9':
                reloadBlockThree = 'none';
                seedThree = 'block';
                seedThreeBox = 'block';
                boxTwoDisable = true;
                break;
            case '5':
                reloadBlockFour = 'none';
                seedFour = 'block';
                seedFourBox = 'block';
                boxThreeDisable = true;
                break;
            case '1':
                boxFourDisable = true;
                break;
            default:
                break;
        }
        this.setState(() => ({
            seed: newSeed,
            seed1: seed1,
            seed2: seed2,
            seed3: seed3,
            seed4: seed4,
            clicks: newClicks,
            scramble: scramble,
            viewReloadBlockTwo: reloadBlockTwo,
            viewReloadBlockThree: reloadBlockThree,
            viewReloadBlockFour: reloadBlockFour,
            viewSeedTwo: seedTwo,
            viewSeedThree: seedThree,
            viewSeedFour: seedFour,
            displaySeedTwo: seedTwoBox,
            displaySeedThree: seedThreeBox,
            displaySeedFour: seedFourBox,
            disableOne: boxOneDisable,
            disableTwo: boxTwoDisable,
            disableThree: boxThreeDisable,
            disableFour: boxFourDisable
        }));
        this.unscramble();
    };


    /**
     * Generate random seed[0] ℹ ｢wdm｣: Compiling...uence
     * @returns {undefined}[0] ℹ ｢wdm｣: Compiling...
     */
    generateNewSeed = () => {
        const newSeed = createRandomSeed();
        console.log("newSeed=====", newSeed);
        
        const newSeed1 = newSeed.slice(0, 16);
        const newSeed2 = newSeed.slice(16, 32);
        const newSeed3 = newSeed.slice(32, 48);
        const newSeed4 = newSeed.slice(48, 64);
        Electron.setOnboardingSeed(null);
        this.setState(() => ({
            seed: newSeed,
            seed1: newSeed1,
            seed2: newSeed2,
            seed3: newSeed3,
            seed4: newSeed4,
            existingSeed: false,
            clicks: [],
            viewReload: 'none',
            viewSeed: 'block'
        }));

        this.frame = 0;

        this.setState({
            scramble: randomBytes(MAX_SEED_LENGTH, 27),
        });

        this.unscramble();
    };

    /**
     * Seed generation animation sequence step
     * @returns {undefined}
     */
    unscramble() {
        const { scramble } = this.state;

        if (this.frame < 0) {
            return;
        }

        const scrambleNew = [];
        let sum = -1;

        if (this.frame > 2) {
            sum = 0;

            for (let i = 0; i < scramble.length; i++) {
                sum += scramble[i];
                scrambleNew.push(Math.max(0, scramble[i] - 15));
            }

            this.setState({
                scramble: scrambleNew,
            });

            this.frame = 0;
        }

        this.frame++;

        if (sum !== 0) {
            requestAnimationFrame(this.unscramble.bind(this));
        }
    }
    // stepBack() {
    //     this.props.history.goBack();
    // }

    viewseed(index) {
        console.log(index)
    }
    saveAccountName = () => {
        const { history } = this.props;
        const { seed } = this.state;
        console.log('seed', seed);
        Electron.setOnboardingSeed(seed, true);
        history.push('/onboarding/account-name');
    }
    render() {
        const { t } = this.props;
        const { ledger } = this.state;
        const { seed1, seed2, seed3, seed4, scramble, existingSeed, clicks, disableOne, disableTwo, disableThree, disableFour } = this.state;

        const clicksLeft = 16 - clicks.length;

        const { loop, animate, onEnd } = this.props;

        const defaultOptions = {
            loop: loop,
            autoplay: true,
            animationData: animationData.default,
            rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice'
            }
        };

        return (
            <div>
                <Logos
                />

                <section className="spage_1">
                    <div className="container">
                        <div className="row">
                            <div className="col-lg-12">
                                <h1>{t('newSeedSetup:generateSeed')}<span className={classNames(css.text_color)}>.</span></h1>
                                <h3>
                                    {!existingSeed && clicksLeft > 0 ? (
                                        <Trans i18nKey="newSeedSetup:individualLetterCount" count={clicksLeft}>
                                            Press <strong className={css.highlight}>{{ count: clicksLeft }}</strong> more letter to
                                            randomise it.
                            </Trans>
                                    ) : (
                                            <span>&nbsp;</span>
                                        )}
                                </h3>
                            </div>

                            <div className={classNames(css.sseed_box_wrap, css.cre_pgs, css.hlx_box)}>

                                <div className={css.seed_wrapper}>
                                    <div className={css.seed_wrapbox}>
                                        <div className={css.seed_lotbox} style={{ width: "100%", height: "100%" }} onClick={this.generateNewSeed} style={{ display: this.state.viewReload }}>
                                            <Lottie className={classNames(css.seed_lottie)}
                                                options={defaultOptions}
                                                eventListeners={[
                                                    {
                                                        eventName: 'complete',
                                                        callback: () => {
                                                            if (typeof onEnd === 'function') {
                                                                onEnd();
                                                            }
                                                        },
                                                    },
                                                ]}
                                            />
                                        </div>
                                        <div className={css.seed} style={{ display: this.state.viewSeed }}>

                                            {seed1.map((byte, index) => {
                                                const offset = scramble[index];

                                                const letter = offset > 0 ? indexToChar(offset) : indexToChar(byte);
                                                return (
                                                    <button
                                                        onClick={this.updateLetter}
                                                        key={`${index}${letter}`}
                                                        value={index}
                                                        disabled={disableOne}
                                                        style={{ opacity: 1 - offset / 255 }}
                                                    >
                                                        {letter}
                                                    </button>
                                                );
                                            })}

                                        </div>
                                    </div>
                                    <div className={css.seed_wrapbox} style={{ display: this.state.displaySeedTwo }}>
                                        <div className={css.seed_lotbox} style={{ width: "100%", height: "100%" }} style={{ display: this.state.viewReloadBlockTwo }}>
                                            <Lottie className={classNames(css.seed_lottie)}
                                                options={defaultOptions}
                                                eventListeners={[
                                                    {
                                                        eventName: 'complete',
                                                        callback: () => {
                                                            if (typeof onEnd === 'function') {
                                                                onEnd();
                                                            }
                                                        },
                                                    },
                                                ]}
                                            />
                                        </div>
                                        <div className={css.seed} style={{ display: this.state.viewSeedTwo }}>

                                            {seed2.map((byte, index) => {
                                                const offset = scramble[index + 16];
                                                const letter = offset > 0 ? indexToChar(offset) : indexToChar(byte);
                                                return (
                                                    <button
                                                        onClick={this.updateLetter}
                                                        key={`${16 + index}${letter}`}
                                                        value={16 + index}
                                                        disabled={disableTwo}
                                                        style={{ opacity: 1 - offset / 255 }}
                                                    >
                                                        {letter}
                                                    </button>
                                                );
                                            })}

                                        </div>
                                    </div>
                                    <div className={css.seed_wrapbox} style={{ display: this.state.displaySeedThree }}>
                                        <div className={css.seed_lotbox} style={{ width: "100%", height: "100%" }} style={{ display: this.state.viewReloadBlockThree }}>
                                            <Lottie className={classNames(css.seed_lottie)}
                                                options={defaultOptions}
                                                eventListeners={[
                                                    {
                                                        eventName: 'complete',
                                                        callback: () => {
                                                            if (typeof onEnd === 'function') {
                                                                onEnd();
                                                            }
                                                        },
                                                    },
                                                ]}
                                            />
                                        </div>
                                        <div className={css.seed} style={{ display: this.state.viewSeedThree }}>

                                            {seed3.map((byte, index) => {
                                                const offset = scramble[index + 32];
                                                const letter = offset > 0 ? indexToChar(offset) : indexToChar(byte);
                                                return (
                                                    <button
                                                        onClick={this.updateLetter}
                                                        key={`${32 + index}${letter}`}
                                                        value={32 + index}
                                                        disabled={disableThree}
                                                        style={{ opacity: 1 - offset / 255 }}
                                                    >
                                                        {letter}
                                                    </button>
                                                );
                                            })}

                                        </div>
                                    </div>
                                    <div className={css.seed_wrapbox} style={{ display: this.state.displaySeedFour }}>
                                        <div className={css.seed_lotbox} style={{ width: "100%", height: "100%" }} style={{ display: this.state.viewReloadBlockFour }}>
                                            <Lottie className={classNames(css.seed_lottie)}
                                                options={defaultOptions}
                                                eventListeners={[
                                                    {
                                                        eventName: 'complete',
                                                        callback: () => {
                                                            if (typeof onEnd === 'function') {
                                                                onEnd();
                                                            }
                                                        },
                                                    },
                                                ]}
                                            />
                                        </div>
                                        <div className={css.seed} style={{ display: this.state.viewSeedFour }}>
                                            {seed4.map((byte, index) => {
                                                const offset = scramble[index + 42];
                                                const letter = offset > 0 ? indexToChar(offset) : indexToChar(byte);
                                                return (
                                                    <button
                                                        onClick={this.updateLetter}
                                                        key={`${48 + index}${letter}`}
                                                        value={48 + index}
                                                        disabled={disableFour}
                                                        style={{ opacity: 1 - offset / 255 }}
                                                    >
                                                        {letter}
                                                    </button>
                                                );
                                            })}

                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div className={css.onboard_btn}>
                                <Button className="navleft" variant="backgroundNone" onClick={() => this.props.history.push('/onboarding/seed-intro')} >{t('global:goBack')} <span>></span></Button>
                                {/* <Button disabled={clicksLeft > 0} className="navright" variant="backgroundNone" onClick={this.saveAccountName}>{t('global:continue')} <span>></span> </Button> */}
                                <Button className="navright" variant="backgroundNone" onClick={this.saveAccountName}>{t('global:continue')} <span>></span> </Button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        )
    }
}

const mapDispatchToProps = {
};

export default connect(null, mapDispatchToProps)(withI18n()(SeedGenerate));