import each from 'lodash/each';
import filter from 'lodash/filter';
import find from 'lodash/find';
import includes from 'lodash/includes';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import random from 'lodash/random';
import sample from 'lodash/sample';
import size from 'lodash/size';
import { expect } from 'chai';
import sinon from 'sinon';
import nock from 'nock';
import { isValidChecksum } from '@helixnetwork/checksum';
import * as addressesUtils from '../../../libs/hlx/addresses';
import {
    addressData as mockAddressData,
    latestAddressWithoutChecksum,
    latestAddressWithChecksum,
    latestAddressObject,
    latestAddressIndex,
    latestAddressBalance,
} from '../../__samples__/addresses';
import transactions, {
    newZeroValueAttachedTransaction,
    newZeroValueAttachedTransactionBaseBranch,
    newZeroValueAttachedTransactionBaseTrunk,
    confirmedZeroValueTransactions,
    unconfirmedValueTransactions,
    NODE_INFO_CURRENT_ROUND_INDEX,
    NODE_INFO_LATEST_SOLID_ROUND_HASH,
    NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
    NODE_INFO_ROUND_START_INDEX,
    NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
    LATEST_SOLID_SUBTANGLE_MILESTONE,
    LATEST_SOLID_SUBTANGLE_MILESTONE_INDEX,
} from '../../__samples__/transactions';
import {
    newZeroValueTransactionBytes,
    milestoneBytes,
    newZeroValueAttachedTransactionBytes,
} from '../../__samples__/txBytes';
import mockAccounts from '../../__samples__/accounts';
import { quorum } from '../../../libs/hlx/index';
import { IRI_API_VERSION } from '../../../config';
import { EMPTY_TRANSACTION_HEX, EMPTY_HASH_TXBYTES } from '../../../libs/hlx/utils';

describe('libs: helix/addresses', () => {
    describe('#preserveAddressLocalSpendStatus', () => {
        it('it should preserve local spend status of existing addresses', () => {
            const existingAddressData = [
                {
                    index: 0,
                    address: 'a'.repeat(64),
                    balance: 10,
                    checksum: 'f5541cc3',
                    spent: {
                        local: true,
                        remote: false,
                    },
                },
            ];

            const newAddressData = [
                {
                    index: 0,
                    address: 'a'.repeat(64),
                    balance: 10,
                    checksum: 'f5541cc3',
                    spent: {
                        local: false,
                        remote: false,
                    },
                },
                {
                    index: 1,
                    address: 'b'.repeat(64),
                    balance: 0,
                    checksum: 'b73c2236',
                    spent: {
                        local: false,
                        remote: false,
                    },
                },
            ];

            const expectedAddressData = [
                {
                    address: 'a'.repeat(64),
                    index: 0,
                    balance: 10,
                    checksum: 'f5541cc3',
                    spent: {
                        local: true,
                        remote: false,
                    },
                },
                {
                    address: 'b'.repeat(64),
                    index: 1,
                    balance: 0,
                    checksum: 'b73c2236',
                    spent: {
                        local: false,
                        remote: false,
                    },
                },
            ];

            expect(addressesUtils.preserveAddressLocalSpendStatus(existingAddressData, newAddressData)).to.eql(
                expectedAddressData,
            );
        });
    });

    describe('#mergeAddressData', () => {
        describe('when existingAddressData is empty', () => {
            it('it should return newAddressData', () => {
                const existingAddressData = [];

                const newAddressData = [
                    {
                        address: 'a'.repeat(64),
                        index: 0,
                        balance: 10,
                        checksum: 'f5541cc3',
                        spent: {
                            local: false,
                            remote: false,
                        },
                    },
                    {
                        address: 'b'.repeat(64),
                        index: 1,
                        balance: 0,
                        checksum: 'b73c2236',
                        spent: {
                            local: false,
                            remote: false,
                        },
                    },
                ];

                const expectedAddressData = newAddressData;

                expect(addressesUtils.mergeAddressData(existingAddressData, newAddressData)).to.eql(
                    expectedAddressData,
                );
            });
        });

        describe('when existingAddressData is not empty', () => {
            it('it should merge newAddressData into existingAddressData', () => {
                const existingAddressData = [
                    {
                        address: 'a'.repeat(64),
                        index: 0,
                        balance: 10,
                        checksum: 'f5541cc3',
                        spent: {
                            local: false,
                            remote: false,
                        },
                    },
                ];

                const newAddressData = [
                    {
                        address: 'a'.repeat(64),
                        index: 0,
                        balance: 100,
                        checksum: 'f5541cc3',
                        spent: {
                            local: false,
                            remote: false,
                        },
                    },
                    {
                        address: 'b'.repeat(64),
                        index: 1,
                        balance: 0,
                        checksum: 'b73c2236',
                        spent: {
                            local: false,
                            remote: false,
                        },
                    },
                ];

                const expectedAddressData = [
                    {
                        address: 'a'.repeat(64),
                        index: 0,
                        balance: 100,
                        checksum: 'f5541cc3',
                        spent: {
                            local: false,
                            remote: false,
                        },
                    },
                    {
                        address: 'b'.repeat(64),
                        index: 1,
                        balance: 0,
                        checksum: 'b73c2236',
                        spent: {
                            local: false,
                            remote: false,
                        },
                    },
                ];

                expect(addressesUtils.mergeAddressData(existingAddressData, newAddressData)).to.eql(
                    expectedAddressData,
                );
            });

            it('it should keep address objects from existingAddressData even if they are missing from existingAddressData', () => {
                const existingAddressData = [
                    {
                        address: 'a'.repeat(64),
                        index: 0,
                        balance: 10,
                        checksum: 'f5541cc3',
                        spent: {
                            local: true,
                            remote: false,
                        },
                    },
                    {
                        address: 'd'.repeat(64),
                        index: 4,
                        balance: 120,
                        checksum: '8fbae2a1',
                        spent: {
                            local: true,
                            remote: true,
                        },
                    },
                ];

                const newAddressData = [
                    {
                        address: 'a'.repeat(64),
                        index: 0,
                        balance: 120,
                        checksum: 'f5541cc3',
                        spent: {
                            local: true,
                            remote: false,
                        },
                    },
                    {
                        address: 'b'.repeat(64),
                        index: 2,
                        balance: 0,
                        checksum: 'b73c2236',
                        spent: {
                            local: false,
                            remote: false,
                        },
                    },
                    {
                        address: 'f'.repeat(64),
                        index: 3,
                        balance: 1,
                        checksum: '6efa1689',
                        spent: {
                            local: true,
                            remote: true,
                        },
                    },
                ];

                const expectedAddressData = [
                    {
                        address: 'a'.repeat(64),
                        index: 0,
                        balance: 120,
                        checksum: 'f5541cc3',
                        spent: {
                            local: true,
                            remote: false,
                        },
                    },
                    {
                        address: 'b'.repeat(64),
                        index: 2,
                        balance: 0,
                        checksum: 'b73c2236',
                        spent: {
                            local: false,
                            remote: false,
                        },
                    },
                    {
                        address: 'f'.repeat(64),
                        index: 3,
                        balance: 1,
                        checksum: '6efa1689',
                        spent: {
                            local: true,
                            remote: true,
                        },
                    },
                    {
                        address: 'd'.repeat(64),
                        index: 4,
                        balance: 120,
                        checksum: '8fbae2a1',
                        spent: {
                            local: true,
                            remote: true,
                        },
                    },
                ];

                expect(addressesUtils.mergeAddressData(existingAddressData, newAddressData)).to.eql(
                    expectedAddressData,
                );
            });

            it('it should always order addressData by address index', () => {
                const existingAddressData = [
                    {
                        address: 'a'.repeat(64),
                        index: 0,
                        balance: 10,
                        checksum: 'f5541cc3',
                        spent: {
                            local: true,
                            remote: false,
                        },
                    },
                    {
                        address: 'd'.repeat(64),
                        index: 4,
                        balance: 120,
                        checksum: '8fbae2a1',
                        spent: {
                            local: true,
                            remote: true,
                        },
                    },
                ];

                const newAddressData = [
                    {
                        address: 'b'.repeat(64),
                        index: 2,
                        balance: 0,
                        checksum: 'b73c2236',
                        spent: {
                            local: false,
                            remote: false,
                        },
                    },
                    {
                        address: 'a'.repeat(64),
                        index: 0,
                        balance: 120,
                        checksum: 'f5541cc3',
                        spent: {
                            local: true,
                            remote: false,
                        },
                    },
                ];

                const expectedAddressData = [
                    {
                        address: 'a'.repeat(64),
                        index: 0,
                        balance: 120,
                        checksum: 'f5541cc3',
                        spent: {
                            local: true,
                            remote: false,
                        },
                    },
                    {
                        address: 'b'.repeat(64),
                        index: 2,
                        balance: 0,
                        checksum: 'b73c2236',
                        spent: {
                            local: false,
                            remote: false,
                        },
                    },
                    {
                        address: 'd'.repeat(64),
                        index: 4,
                        balance: 120,
                        checksum: '8fbae2a1',
                        spent: {
                            local: true,
                            remote: true,
                        },
                    },
                ];

                expect(addressesUtils.mergeAddressData(existingAddressData, newAddressData)).to.eql(
                    expectedAddressData,
                );
            });
        });
    });

    describe('#isAddressUsedSync', () => {
        describe('when provided argument is not a valid address object', () => {
            it('should throw an error with message "Invalid address data."', () => {
                expect(addressesUtils.isAddressUsedSync.bind(null, {}, [])).to.throw('Invalid address data.');
                expect(addressesUtils.isAddressUsedSync.bind(null, undefined, [])).to.throw('Invalid address data.');
            });
        });
    });

    describe('when provided argument is a valid address object', () => {
        describe('when address has no associated transactions', () => {
            describe('when address has zero balance', () => {
                describe('when address is marked spent locally', () => {
                    it('should return true', () => {
                        const addressObject = {
                            address: 'f'.repeat(64),
                            balance: 0,
                            index: 0,
                            checksum: '6efa1689',
                            spent: { local: true, remote: true },
                        };

                        const isUsed = addressesUtils.isAddressUsedSync(addressObject, []);

                        expect(isUsed).to.equal(true);
                    });
                });

                describe('when address is marked unspent locally', () => {
                    it('should return false', () => {
                        const addressObject = {
                            address: 'f'.repeat(64),
                            balance: 0,
                            index: 0,
                            checksum: '6efa1689',
                            spent: { local: false, remote: true },
                        };

                        const isUsed = addressesUtils.isAddressUsedSync(addressObject, []);

                        expect(isUsed).to.equal(false);
                    });
                });
            });

            describe('when address has positive balance', () => {
                describe('when address is marked unspent locally', () => {
                    it('should return true', () => {
                        const addressObject = {
                            address: 'f'.repeat(64),
                            balance: 10,
                            index: 0,
                            checksum: '6efa1689',
                            spent: { local: false, remote: true },
                        };

                        const isUsed = addressesUtils.isAddressUsedSync(addressObject, []);

                        expect(isUsed).to.equal(true);
                    });
                });
            });
        });

        describe('when address has associated transactions', () => {
            describe('when address has zero balance', () => {
                describe('when address is marked spent locally', () => {
                    it('should return true', () => {
                        const addressObject = {
                            address: '6214373e99f3e335e630441a96341fbb8fbff9b416a793e1069c5bd28a76eb53',
                            balance: 0,
                            index: 1,
                            checksum: '4abfc600',
                            spent: { local: true, remote: true },
                        };

                        const isUsed = addressesUtils.isAddressUsedSync(addressObject, unconfirmedValueTransactions);

                        expect(isUsed).to.equal(true);
                    });
                });

                describe('when address is marked unspent locally', () => {
                    it('should return true', () => {
                        const addressObject = {
                            address: 'c4985fa20c67354b8a094287b11f6ec4fd2f63fd0a74509fe9bf21982db6b5f8',
                            balance: 0,
                            index: 4,
                            checksum: '750b0406',
                            spent: { local: false, remote: false },
                        };

                        const isUsed = addressesUtils.isAddressUsedSync(addressObject, confirmedZeroValueTransactions);

                        expect(isUsed).to.equal(true);
                    });
                });
            });

            describe('when address has positive balance', () => {
                describe('when address is marked unspent locally', () => {
                    it('should return true', () => {
                        const addressObject = {
                            address: 'c4985fa20c67354b8a094287b11f6ec4fd2f63fd0a74509fe9bf21982db6b5f8',
                            balance: 10,
                            index: 4,
                            checksum: '750b0406',
                            spent: { local: false, remote: false },
                        };

                        const isUsed = addressesUtils.isAddressUsedSync(addressObject, confirmedZeroValueTransactions);

                        expect(isUsed).to.equal(true);
                    });
                });
            });
        });
    });
});

describe('#isAddressUsedAsync', () => {
    let addressObject;

    before(() => {
        addressObject = {
            address: 'f'.repeat(64),
            balance: 0,
            index: 0,
            checksum: '6efa1689',
            spent: { local: true, remote: true },
        };
    });

    describe('when provided argument is not a valid address object', () => {
        it('should throw an error with message "Invalid address data."', () => {
            return addressesUtils
                .isAddressUsedAsync()(null)
                .then(() => {
                    throw new Error();
                })
                .catch((error) => expect(error.message).to.equal('Invalid address data.'));
        });
    });

    describe('when provided argument is a valid address object', () => {
        describe('when address is spent from (wereAddressesSpentFron)', () => {
            beforeEach(() => {
                nock('http://localhost:14265', {
                    reqheaders: {
                        'Content-Type': 'application/json',
                        'X-HELIX-API-Version': IRI_API_VERSION,
                    },
                    filteringScope: () => true,
                })
                    .filteringRequestBody(() => '*')
                    .persist()
                    .post('/', '*')
                    .reply(200, (_, body) => {
                        if (body.command === 'wereAddressesSpentFrom') {
                            const addresses = body.addresses;

                            return { states: map(addresses, () => true) };
                        } else if (body.command === 'getNodeInfo') {
                            return {
                                appVersion: '1',
                                currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                                latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                                latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                                roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                                lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                            };
                        } else if (body.command === 'getTransactionStrings') {
                            return {
                                txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                    ? milestoneBytes
                                    : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                            };
                        }

                        return {};
                    });
            });

            afterEach(() => {
                nock.cleanAll();
            });

            it('should return true', () => {
                return addressesUtils
                    .isAddressUsedAsync()(addressObject)
                    .then((isUsed) => expect(isUsed).to.equal(true));
            });
        });

        describe('when address is not spent from (wereAddressesSpentFron)', () => {
            describe('when address has associated transaction hashes', () => {
                beforeEach(() => {
                    nock('http://localhost:14265', {
                        reqheaders: {
                            'Content-Type': 'application/json',
                            'X-HELIX-API-Version': IRI_API_VERSION,
                        },
                        filteringScope: () => true,
                    })
                        .filteringRequestBody(() => '*')
                        .persist()
                        .post('/', '*')
                        .reply(200, (_, body) => {
                            if (body.command === 'wereAddressesSpentFrom') {
                                const addresses = body.addresses;

                                return { states: map(addresses, () => false) };
                            } else if (body.command === 'findTransactions') {
                                return { hashes: ['0'.repeat(64)] };
                            } else if (body.command === 'getNodeInfo') {
                                return {
                                    appVersion: '1',
                                    currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                                    latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                                    latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                                    roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                                    lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                                };
                            } else if (body.command === 'getTransactionStrings') {
                                return {
                                    txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                        ? milestoneBytes
                                        : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                                };
                            }

                            return {};
                        });
                });

                afterEach(() => {
                    nock.cleanAll();
                });

                it('should return true', () => {
                    return addressesUtils
                        .isAddressUsedAsync()(addressObject)
                        .then((isUsed) => expect(isUsed).to.equal(true));
                });
            });

            describe('when address has no associated transaction hashes', () => {
                describe('when address has positive balance', () => {
                    beforeEach(() => {
                        nock('http://localhost:14265', {
                            reqheaders: {
                                'Content-Type': 'application/json',
                                'X-HELIX-API-Version': IRI_API_VERSION,
                            },
                            filteringScope: () => true,
                        })
                            .filteringRequestBody(() => '*')
                            .persist()
                            .post('/', '*')
                            .reply(200, (_, body) => {
                                if (body.command === 'wereAddressesSpentFrom') {
                                    const addresses = body.addresses;

                                    return { states: map(addresses, () => false) };
                                } else if (body.command === 'findTransactions') {
                                    return { hashes: [] };
                                } else if (body.command === 'getBalances') {
                                    return { balances: map(body.addresses, () => '10') };
                                } else if (body.command === 'getNodeInfo') {
                                    return {
                                        appVersion: '1',
                                        currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                                        latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                                        latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                                        roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                                        lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                                    };
                                } else if (body.command === 'getTransactionStrings') {
                                    return {
                                        txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                            ? milestoneBytes
                                            : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                                    };
                                }

                                return {};
                            });
                    });

                    afterEach(() => {
                        nock.cleanAll();
                    });

                    it('should return true', () => {
                        return addressesUtils
                            .isAddressUsedAsync()(addressObject)
                            .then((isUsed) => expect(isUsed).to.equal(true));
                    });
                });

                describe('when address has zero balance', () => {
                    beforeEach(() => {
                        nock('http://localhost:14265', {
                            reqheaders: {
                                'Content-Type': 'application/json',
                                'X-HELIX-API-Version': IRI_API_VERSION,
                            },
                            filteringScope: () => true,
                        })
                            .filteringRequestBody(() => '*')
                            .persist()
                            .post('/', '*')
                            .reply(200, (_, body) => {
                                if (body.command === 'wereAddressesSpentFrom') {
                                    const addresses = body.addresses;

                                    return { states: map(addresses, () => false) };
                                } else if (body.command === 'findTransactions') {
                                    return { hashes: [] };
                                } else if (body.command === 'getBalances') {
                                    return { balances: map(body.addresses, () => '0') };
                                } else if (body.command === 'getNodeInfo') {
                                    return {
                                        appVersion: '1',
                                        currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                                        latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                                        latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                                        roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                                        lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                                    };
                                } else if (body.command === 'getTransactionStrings') {
                                    return {
                                        txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                            ? milestoneBytes
                                            : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                                    };
                                }

                                return {};
                            });
                    });

                    afterEach(() => {
                        nock.cleanAll();
                    });

                    it('should return false', () => {
                        return addressesUtils
                            .isAddressUsedAsync()(addressObject)
                            .then((isUsed) => expect(isUsed).to.equal(false));
                    });
                });
            });
        });
    });
});

describe('#getAddressDataUptoLatestUnusedAddress', () => {
    describe('when (first) generated address for provided index is unused', () => {
        beforeEach(() => {
            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    const { addresses, command } = body;
                    if (command === 'findTransactions') {
                        return { hashes: [] };
                    } else if (command === 'wereAddressesSpentFrom') {
                        return { states: map(addresses, () => false) };
                    } else if (command === 'getBalances') {
                        return { balances: map(addresses, () => '0') };
                    } else if (body.command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                            latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                            lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                        };
                    } else if (body.command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('should call generateAddress method on seedStore object with provided index and security', () => {
            const seedStore = {
                generateAddress: sinon.stub().resolves('a'.repeat(64)),
            };
            // TODO recheck this
            const options = { index: 9, security: 3 };
            return addressesUtils
                .getAddressDataUptoLatestUnusedAddress()(seedStore, [], options)
                .then(() => expect(seedStore.generateAddress.calledWith({ index: 9, security: 3 })).to.equal(true));
        });

        it('should return address data for generated address', () => {
            const seedStore = {
                generateAddress: () => Promise.resolve('a'.repeat(64)),
            };
            const options = { index: 9, security: 3 };
            return addressesUtils
                .getAddressDataUptoLatestUnusedAddress()(seedStore, {}, options)
                .then((addressData) => {
                    const expectedAddressData = [
                        {
                            address: 'a'.repeat(64),
                            index: 9,
                            spent: { local: false, remote: false },
                            balance: 0,
                            checksum: 'f5541cc3',
                        },
                    ];

                    expect(addressData).to.eql(expectedAddressData);
                });
        });
    });

    describe('when (first) generated address for provided index is used', () => {
        beforeEach(() => {
            const resultMap = {
                ['a'.repeat(64)]: {
                    spent: true,
                    hashes: [],
                    balance: '0',
                },
                ['b'.repeat(64)]: {
                    spent: false,
                    hashes: ['0'.repeat(64)],
                    balance: '0',
                },
                ['c'.repeat(64)]: {
                    spent: false,
                    hashes: [],
                    balance: '10',
                },
                ['d'.repeat(64)]: {
                    spent: false,
                    hashes: [],
                    balance: '0',
                },
            };

            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    const { addresses, command } = body;
                    if (command === 'findTransactions') {
                        return {
                            hashes: reduce(
                                addresses,
                                (acc, address) => {
                                    acc = [...acc, ...resultMap[address].hashes];
                                    return acc;
                                },
                                [],
                            ),
                        };
                    } else if (command === 'wereAddressesSpentFrom') {
                        return {
                            states: map(addresses, (address) => resultMap[address].spent),
                        };
                    } else if (command === 'getBalances') {
                        return {
                            balances: map(addresses, (address) => resultMap[address].balance),
                        };
                    } else if (body.command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                            latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                            lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                        };
                    } else if (body.command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('should generate addresses and return address data upto latest unused address', () => {
            const seedStore = {
                generateAddress: ({ index }) => {
                    const addressMap = {
                        0: 'a'.repeat(64),
                        1: 'b'.repeat(64),
                        2: 'c'.repeat(64),
                        3: 'd'.repeat(64),
                    };
                    return Promise.resolve(addressMap[index]);
                },
            };
            const options = { index: 0, security: 2 };

            return addressesUtils
                .getAddressDataUptoLatestUnusedAddress()(seedStore, {}, options)
                .then((addressData) => {
                    const expectedAddressData = [
                        {
                            address: 'a'.repeat(64),
                            index: 0,
                            spent: { local: false, remote: true },
                            balance: 0,
                            checksum: 'f5541cc3',
                        },
                        {
                            address: 'b'.repeat(64),
                            index: 1,
                            spent: { local: false, remote: false },
                            balance: 0,
                            checksum: 'b73c2236',
                        },
                        {
                            address: 'c'.repeat(64),
                            index: 2,
                            spent: { local: false, remote: false },
                            balance: 10,
                            checksum: 'c65712df',
                        },
                        {
                            address: 'd'.repeat(64),
                            index: 3,
                            spent: { local: false, remote: false },
                            balance: 0,
                            checksum: '8fbae2a1',
                        },
                    ];

                    expect(addressData).to.eql(expectedAddressData);
                });
        });
    });
});

describe('#mapLatestAddressData', () => {
    describe('when provided address data is empty', () => {
        it('should return an empty array', () => {
            return addressesUtils
                .mapLatestAddressData()([], [])
                .then((result) => expect(result).to.eql([]));
        });
    });

    describe('when provided address data is not empty', () => {
        const resultMap = reduce(
            mockAddressData,
            (acc, addressObject) => {
                acc[addressObject.address] = {
                    balance: random(100),
                    spent: sample([true, false]),
                };

                return acc;
            },
            {},
        );

        beforeEach(() => {
            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    const { addresses, command } = body;

                    if (command === 'wereAddressesSpentFrom') {
                        return {
                            states: map(addresses, (address) => resultMap[address].spent),
                        };
                    } else if (command === 'getBalances') {
                        return {
                            balances: map(addresses, (address) => resultMap[address].balance),
                        };
                    } else if (body.command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                            latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                            lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                        };
                    } else if (body.command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('should map latest balances on addresses', () => {
            return addressesUtils
                .mapLatestAddressData()(mockAddressData, transactions)
                .then((updatedAddressData) => {
                    const expectedBalances = map(resultMap, (result) => result.balance);

                    each(updatedAddressData, (addressObject, idx) =>
                        expect(addressObject.balance).to.equal(expectedBalances[idx]),
                    );
                });
        });

        it('should map latest (remote) spend statuses on addresses', () => {
            return addressesUtils
                .mapLatestAddressData()(mockAddressData, transactions)
                .then((updatedAddressData) => {
                    const expectedRemoteSpendStatuses = map(resultMap, (result) => result.spent);

                    each(updatedAddressData, (addressObject, idx) =>
                        expect(addressObject.spent.remote).to.equal(expectedRemoteSpendStatuses[idx]),
                    );
                });
        });
        // TODO
        it('should map (local) spend statuses on addresses', () => {
            // Mark local spend status of all addresses as false
            const addressData = map(mockAddressData, (addressObject) => ({
                ...addressObject,
                spent: { ...addressObject.spent, local: false },
            }));

            return addressesUtils
                .mapLatestAddressData()(addressData, transactions)
                .then((updatedAddressData) => {
                    const expectedLocallySpentAddresses = [
                        '164838c044a83bbe80ce4bd24547442ae6d496caa5496c4746ae71470c13b4ed',
                        '5e4d98d49f63da581da73e0ba6d620a8139ed9a06dea03b40e5ddcf0563f8194',
                        'c212548bd3c4b596bf24b16c36aaa69a5ecaf5a8240232380b0a26539b6b8619',
                        'fcb610407fba6820c44cbc800205013cd92707412c990ffc6669f5477346cffb',
                    ];

                    const actualLocallySpentAddresses = map(
                        filter(updatedAddressData, (addressObject) => addressObject.spent.local === true),
                        (addressObject) => addressObject.address,
                    );

                    expect(expectedLocallySpentAddresses).to.eql(actualLocallySpentAddresses);
                });
        });

        it('should preserve (local) spend statuses on addresses', () => {
            // Mark local spend status of all addresses as true
            const addressData = map(mockAddressData, (addressObject) => ({
                ...addressObject,
                spent: { ...addressObject.spent, local: true },
            }));

            // Then pass in empty transactions and assert that the local spend status is preserved
            return addressesUtils
                .mapLatestAddressData()(addressData, [])
                .then((updatedAddressData) => {
                    each(updatedAddressData, (addressObject) => expect(addressObject.spent.local).to.equal(true));
                });
        });
    });
});

describe('#getFullAddressHistory', () => {
    let addresses;
    let seedStore;
    let batchSize;
    const selectChar = (index) => {
        if (index < 9) {
            return 49 + index;
        }
        return 88 + index;
    };
    before(() => {
        // TODO recheck this
        batchSize = 10;
        addresses = Array(20)
            .fill()
            .map((_, i) => {
                if (i < 15) {
                    return String.fromCharCode(selectChar(i)).repeat(64);
                }
                return `${String.fromCharCode(selectChar(i - 15))}${String.fromCharCode(selectChar(i - 14))}`.repeat(
                    32,
                );
            });

        seedStore = {
            generateAddress: (options) => {
                return Promise.resolve(addresses.slice(options.index, options.index + options.total));
            },
        };
    });

    describe('when no address in the first batch of generated addresses has any associated meta', () => {
        beforeEach(() => {
            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    if (body.command === 'wereAddressesSpentFrom') {
                        return { states: map(body.addresses, () => false) };
                    } else if (body.command === 'findTransactions') {
                        return { hashes: [] };
                    } else if (body.command === 'getBalances') {
                        return { balances: map(body.addresses, () => '0') };
                    } else if (body.command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                            latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                            lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                        };
                    } else if (body.command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('should not call generateAddress method on seedStore more than once', () => {
            sinon.spy(seedStore, 'generateAddress');

            return addressesUtils
                .getFullAddressHistory()(seedStore, {})
                .then(() => {
                    expect(seedStore.generateAddress.calledOnce).to.equal(true);
                    seedStore.generateAddress.restore();
                })
                .catch((error) => {
                    // Restore seedStore spy
                    seedStore.generateAddress.restore();

                    throw error;
                });
        });
    });

    describe('when some addresses in the first batch of generated addresses have positive balance', () => {
        beforeEach(() => {
            const addressMetaMap = reduce(
                addresses,
                (acc, address, index) => {
                    acc[address] = {
                        balance: index === batchSize - 1 ? '10' : '0',
                        spent: false,
                    };

                    return acc;
                },
                {},
            );

            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    if (body.command === 'wereAddressesSpentFrom') {
                        return {
                            states: map(body.addresses, (address) => addressMetaMap[address].spent),
                        };
                    } else if (body.command === 'findTransactions') {
                        return { hashes: [] };
                    } else if (body.command === 'getBalances') {
                        return {
                            balances: map(body.addresses, (address) => addressMetaMap[address].balance),
                        };
                    } else if (body.command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                            latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                            lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                        };
                    } else if (body.command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('should call generateAddress method on seedStore twice', () => {
            sinon.spy(seedStore, 'generateAddress');

            return addressesUtils
                .getFullAddressHistory()(seedStore, {})
                .then(() => {
                    expect(seedStore.generateAddress.calledTwice).to.equal(true);
                    seedStore.generateAddress.restore();
                })
                .catch((error) => {
                    // Restore seedStore spy
                    seedStore.generateAddress.restore();

                    throw error;
                });
        });

        it('should return addresses till one unused', () => {
            return addressesUtils
                .getFullAddressHistory()(seedStore, {})
                .then((addressData) => {
                    expect(addressData.addresses).to.eql(addresses.slice(0, batchSize + 1));
                });
        });

        it('should return correct balances', () => {
            return addressesUtils
                .getFullAddressHistory()(seedStore, {})
                .then((addressData) => {
                    const expectedBalances = Array(batchSize + 1)
                        .fill()
                        .map((_, i) => (i === batchSize - 1 ? 10 : 0));
                    expect(addressData.balances).to.eql(expectedBalances);
                });
        });
    });

    describe('when some addresses in the first batch of generated addresses are spent', () => {
        beforeEach(() => {
            const addressMetaMap = reduce(
                addresses,
                (acc, address, index) => {
                    acc[address] = {
                        balance: '0',
                        spent: index === batchSize - 1,
                    };

                    return acc;
                },
                {},
            );

            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    if (body.command === 'wereAddressesSpentFrom') {
                        return {
                            states: map(body.addresses, (address) => addressMetaMap[address].spent),
                        };
                    } else if (body.command === 'findTransactions') {
                        return { hashes: [] };
                    } else if (body.command === 'getBalances') {
                        return {
                            balances: map(body.addresses, (address) => addressMetaMap[address].balance),
                        };
                    } else if (body.command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                            latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                            lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                        };
                    } else if (body.command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('should call generateAddress method on seedStore twice', () => {
            sinon.spy(seedStore, 'generateAddress');

            return addressesUtils
                .getFullAddressHistory()(seedStore, {})
                .then(() => {
                    expect(seedStore.generateAddress.calledTwice).to.equal(true);
                    seedStore.generateAddress.restore();
                })
                .catch((error) => {
                    // Restore seedStore spy
                    seedStore.generateAddress.restore();

                    throw error;
                });
        });

        it('should return addresses till one unused', () => {
            return addressesUtils
                .getFullAddressHistory()(seedStore, {})
                .then((addressData) => {
                    expect(addressData.addresses).to.eql(addresses.slice(0, batchSize + 1));
                });
        });

        it('should return correct remote spend statuses', () => {
            return addressesUtils
                .getFullAddressHistory()(seedStore, {})
                .then((addressData) => {
                    const expectedSpendStatuses = Array(batchSize + 1)
                        .fill()
                        .map((_, i) => i === batchSize - 1);
                    const actualRemoteSpendStatuses = addressData.wereSpent.map((status) => status.remote);

                    expect(actualRemoteSpendStatuses).to.eql(expectedSpendStatuses);
                });
        });
    });

    describe('when some addresses in the first batch of generated addresses have transaction hashes', () => {
        beforeEach(() => {
            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    if (body.command === 'wereAddressesSpentFrom') {
                        return { states: map(body.addresses, () => false) };
                    } else if (body.command === 'findTransactions') {
                        return {
                            hashes: includes(body.addresses, addresses[batchSize - 1]) ? ['0'.repeat(64)] : [],
                        };
                    } else if (body.command === 'getBalances') {
                        return { balances: map(body.addresses, () => false) };
                    } else if (body.command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                            latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                            lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                        };
                    } else if (body.command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('should call generateAddress method on seedStore twice', () => {
            sinon.spy(seedStore, 'generateAddress');

            return addressesUtils
                .getFullAddressHistory()(seedStore, {})
                .then(() => {
                    expect(seedStore.generateAddress.calledTwice).to.equal(true);
                    seedStore.generateAddress.restore();
                })
                .catch((error) => {
                    // Restore seedStore spy
                    seedStore.generateAddress.restore();

                    throw error;
                });
        });

        it('should return addresses till one unused', () => {
            return addressesUtils
                .getFullAddressHistory()(seedStore, {})
                .then((addressData) => {
                    expect(addressData.addresses).to.eql(addresses.slice(0, batchSize + 1));
                });
        });

        it('should return correct transaction hashes', () => {
            return addressesUtils
                .getFullAddressHistory()(seedStore, {})
                .then((addressData) => {
                    expect(addressData.hashes).to.eql(['0'.repeat(64)]);
                });
        });
    });
});

describe('#removeUnusedAddresses', () => {
    let addresses;

    before(() => {
        addresses = [
            'a'.repeat(64),
            'b'.repeat(64),
            'c'.repeat(64),
            'd'.repeat(64),
            'e'.repeat(64),
            'f'.repeat(64),
            '1'.repeat(64),
        ];
    });

    describe('when the last address has associated meta data', () => {
        beforeEach(() => {
            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    if (body.command === 'wereAddressesSpentFrom') {
                        const addresses = body.addresses;

                        return { states: map(addresses, () => false) };
                    } else if (body.command === 'findTransactions') {
                        return { hashes: ['0'.repeat(64)] };
                    } else if (body.command === 'getBalances') {
                        return { balances: map(body.addresses, () => '0') };
                    } else if (body.command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                            latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                            lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                        };
                    } else if (body.command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('should return addresses with latest unused address', () => {
            const latestUnusedAddress = '3'.repeat(64);
            const lastAddressIndex = size(addresses) - 1;

            return addressesUtils
                .removeUnusedAddresses()(lastAddressIndex, latestUnusedAddress, addresses)
                .then((finalAddresses) => {
                    expect(finalAddresses).to.eql([...addresses, latestUnusedAddress]);
                });
        });
    });

    describe('when no address has any associated meta data', () => {
        beforeEach(() => {
            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    if (body.command === 'wereAddressesSpentFrom') {
                        const addresses = body.addresses;

                        return { states: map(addresses, () => false) };
                    } else if (body.command === 'findTransactions') {
                        return { hashes: [] };
                    } else if (body.command === 'getBalances') {
                        return { balances: map(body.addresses, () => '0') };
                    } else if (body.command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                            latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                            lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                        };
                    } else if (body.command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('should return address at zeroth index as the latest unused address', () => {
            const latestUnusedAddress = '3'.repeat(64);
            const lastAddressIndex = size(addresses) - 1;

            return addressesUtils
                .removeUnusedAddresses()(lastAddressIndex, latestUnusedAddress, addresses)
                .then((finalAddresses) => {
                    expect(finalAddresses).to.eql([addresses[0]]);
                });
        });
    });

    describe('when some addresses have associated meta data', () => {
        beforeEach(() => {
            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    const { command, addresses } = body;

                    const resultMap = {
                        ['a'.repeat(64)]: {
                            spent: false,
                            hashes: [],
                            balance: '10',
                        },
                        ['b'.repeat(64)]: {
                            spent: true,
                            hashes: [],
                            balances: '0',
                        },
                        ['c'.repeat(64)]: {
                            spent: false,
                            hashes: ['0'.repeat(64)],
                            balance: '0',
                        },
                        // Should be the latest unused
                        ['d'.repeat(64)]: {
                            spent: false,
                            hashes: [],
                            balance: '0',
                        },
                        ['e'.repeat(64)]: {
                            spent: false,
                            hashes: [],
                            balance: '0',
                        },
                        ['f'.repeat(64)]: {
                            spent: false,
                            hashes: [],
                            balance: '0',
                        },
                        ['1'.repeat(64)]: {
                            spent: false,
                            hashes: [],
                            balance: '0',
                        },
                    };

                    if (command === 'wereAddressesSpentFrom') {
                        return {
                            states: reduce(
                                addresses,
                                (acc, address) => {
                                    acc.push(resultMap[address].spent);

                                    return acc;
                                },
                                [],
                            ),
                        };
                    } else if (body.command === 'findTransactions') {
                        return {
                            hashes: reduce(
                                addresses,
                                (acc, address) => {
                                    if (address in resultMap) {
                                        acc = [...acc, ...resultMap[address].hashes];
                                    }

                                    return acc;
                                },
                                [],
                            ),
                        };
                    } else if (body.command === 'getBalances') {
                        return {
                            balances: reduce(
                                addresses,
                                (acc, address) => {
                                    acc.push(resultMap[address].balance);

                                    return acc;
                                },
                                [],
                            ),
                        };
                    } else if (body.command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                            latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                            lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                        };
                    } else if (body.command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('should return addresses till one unused', () => {
            const latestUnusedAddress = '3'.repeat(64);
            const lastAddressIndex = size(addresses) - 1;

            return addressesUtils
                .removeUnusedAddresses()(lastAddressIndex, latestUnusedAddress, addresses)
                .then((addressesTillOneUnused) => {
                    const expectedAddresses = ['a'.repeat(64), 'b'.repeat(64), 'c'.repeat(64), 'd'.repeat(64)];

                    expect(addressesTillOneUnused).to.eql(expectedAddresses);
                });
        });
    });
});

describe('#accumulateBalance', () => {
    describe('when argument is not an array', () => {
        it('should return 0', () => {
            const args = [null, undefined, '', {}, 0, 0.5];

            args.forEach((arg) => expect(addressesUtils.accumulateBalance(arg)).to.equal(0));
        });
    });

    describe('when argument is an array', () => {
        it('should return 0 if array is empty', () => {
            expect(addressesUtils.accumulateBalance([])).to.equal(0);
        });

        it('should only calculates on numbers inside array', () => {
            expect(addressesUtils.accumulateBalance(['foo', 'baz'])).to.equal(0);
        });

        it('should return total after summing up', () => {
            expect(addressesUtils.accumulateBalance([0, 4, 10])).to.equal(14);
        });
    });
});

describe('#getBalancesSync', () => {
    describe('when none of the items in first argument array is found in second argument dictionary', () => {
        it('should return an empty array', () => {
            const firstAddress = 'a'.repeat(64);
            const secondAddress = 'b'.repeat(64);

            const addresses = [firstAddress, secondAddress];

            const addressData = {
                ['0'.repeat(64)]: { index: 100, balance: 10, spent: false },
            };

            expect(addressesUtils.getBalancesSync(addresses, addressData)).to.eql([]);
        });
    });

    describe('when any item in first argument array is found in second argument dictionary', () => {
        it('should return an array with corrensponding balance "prop" value', () => {
            const firstAddress = 'a'.repeat(64);
            const secondAddress = 'b'.repeat(64);

            const addresses = [firstAddress, secondAddress];

            const addressData = {
                [secondAddress]: { index: 100, balance: 10, spent: false },
            };

            expect(addressesUtils.getBalancesSync(addresses, addressData)).to.eql([10]);
        });
    });
});

describe('#createAddressData', () => {
    let addresses;

    before(() => {
        addresses = ['a'.repeat(64), 'b'.repeat(64), 'c'.repeat(64)];
    });

    describe('when balances size does not equal addresses size', () => {
        describe('when size of spent statuses equal addresses size', () => {
            describe('when key indexes are not provided', () => {
                it('should throw with an error with message "Address metadata length mismatch."', () => {
                    expect(
                        addressesUtils.createAddressData.bind(
                            null,
                            addresses,
                            [],
                            Array(3)
                                .fill()
                                .map(() => ({ local: false, remote: false })),
                        ),
                    ).to.throw('Address metadata length mismatch.');
                });
            });

            describe('when key indexes are provided', () => {
                describe('when key indexes size does not equal addresses size', () => {
                    it('should throw with an error with message "Address metadata length mismatch."', () => {
                        expect(
                            addressesUtils.createAddressData.bind(
                                null,
                                addresses,
                                [],
                                Array(addresses.length)
                                    .fill()
                                    .map(() => ({ local: false, remote: false })),
                            ),
                            [0],
                        ).to.throw('Address metadata length mismatch.');
                    });
                });

                describe('when key indexes size equals addresses size', () => {
                    it('should throw with an error with message "Address metadata length mismatch."', () => {
                        expect(
                            addressesUtils.createAddressData.bind(
                                null,
                                addresses,
                                [],
                                Array(3)
                                    .fill()
                                    .map(() => ({ local: false, remote: false })),
                                Array(3)
                                    .fill()
                                    .map((_, i) => i),
                            ),
                        ).to.throw('Address metadata length mismatch.');
                    });
                });
            });
        });
    });

    describe('when address spend statuses size does not equal addresses size', () => {
        describe('when size of balances equal addresses size', () => {
            describe('when key indexes are not provided', () => {
                it('should throw with an error with message "Address metadata length mismatch."', () => {
                    expect(
                        addressesUtils.createAddressData.bind(
                            null,
                            addresses,
                            Array(3)
                                .fill()
                                .map((_, i) => i),
                            [],
                        ),
                    ).to.throw('Address metadata length mismatch.');
                });
            });

            describe('when key indexes are provided', () => {
                describe('when key indexes size does not equal addresses size', () => {
                    it('should throw with an error with message "Address metadata length mismatch."', () => {
                        expect(
                            addressesUtils.createAddressData.bind(
                                null,
                                addresses,
                                Array(3)
                                    .fill()
                                    .map((_, i) => i),
                                [],
                                [],
                            ),
                        ).to.throw('Address metadata length mismatch.');
                    });
                });

                describe('when key indexes size equals addresses size', () => {
                    it('should throw with an error with message "Address metadata length mismatch."', () => {
                        expect(
                            addressesUtils.createAddressData.bind(
                                null,
                                addresses,
                                Array(3)
                                    .fill()
                                    .map((_, i) => i),
                                [],
                                Array(3)
                                    .fill()
                                    .map((_, i) => i),
                            ),
                        ).to.throw('Address metadata length mismatch.');
                    });
                });
            });
        });
    });

    describe('when address spend statuses size & balances size equal addresses size ', () => {
        describe('when key indexes are not provided', () => {
            it('should return address data with key indexes as address index in addresses list (passed as first argument)', () => {
                const expectedAddressData = [
                    {
                        address: 'a'.repeat(64),
                        index: 0,
                        spent: { local: true, remote: false },
                        balance: 0,
                        checksum: 'f5541cc3',
                    },
                    {
                        address: 'b'.repeat(64),
                        index: 1,
                        spent: { local: false, remote: false },
                        balance: 1,
                        checksum: 'b73c2236',
                    },
                    {
                        address: 'c'.repeat(64),
                        index: 2,
                        spent: { local: true, remote: false },
                        balance: 2,
                        checksum: 'c65712df',
                    },
                ];

                const actualAddressData = addressesUtils.createAddressData(
                    addresses,
                    Array(3)
                        .fill()
                        .map((_, i) => i),
                    Array(3)
                        .fill()
                        .map((_, i) => ({ local: i % 2 === 0, remote: false })),
                );

                expect(actualAddressData).to.eql(expectedAddressData);

                // Test valid checksum
                expectedAddressData.forEach(({ address, checksum }) => {
                    expect(isValidChecksum(`${address}${checksum}`)).to.equal(true);
                });
            });
        });

        describe('when key indexes are provided', () => {
            it('should return address data with key indexes from key indexes list (passed as fourth argument)', () => {
                const expectedAddressData = [
                    {
                        address: 'a'.repeat(64),
                        index: 4,
                        spent: { local: true, remote: false },
                        balance: 0,
                        checksum: 'f5541cc3',
                    },
                    {
                        address: 'b'.repeat(64),
                        index: 6,
                        spent: { local: false, remote: false },
                        balance: 1,
                        checksum: 'b73c2236',
                    },
                    {
                        address: 'c'.repeat(64),
                        index: 9,
                        spent: { local: true, remote: false },
                        balance: 2,
                        checksum: 'c65712df',
                    },
                ];

                const keyIndexes = [4, 6, 9];
                const actualAddressData = addressesUtils.createAddressData(
                    addresses,
                    Array(3)
                        .fill()
                        .map((_, i) => i),
                    Array(3)
                        .fill()
                        .map((_, i) => ({ local: i % 2 === 0, remote: false })),
                    keyIndexes,
                );

                expect(actualAddressData).to.eql(expectedAddressData);

                // Test valid checksum
                expectedAddressData.forEach(({ address, checksum }) => {
                    expect(isValidChecksum(`${address}${checksum}`)).to.equal(true);
                });
            });
        });
    });
});

describe('#filterAddressDataWithPendingIncomingTransactions', () => {
    describe('when addressData passed as first argument is an empty array', () => {
        it('should return addressData passed as first argument', () => {
            expect(addressesUtils.filterAddressDataWithPendingIncomingTransactions([], [{}, {}])).to.eql([]);
        });
    });

    describe('when pendingValueTransactions passed as second argument is an empty array', () => {
        it('should return addressData passed as first argument', () => {
            expect(addressesUtils.filterAddressDataWithPendingIncomingTransactions([{}], [])).to.eql([{}]);
        });
    });

    describe('when addressData passed as first argument is not an empty array and transactions passed as second argument is not an empty array', () => {
        it('should filter addressData with pending incoming value transactions', () => {
            const result = addressesUtils.filterAddressDataWithPendingIncomingTransactions(
                mockAddressData,
                transactions,
            );

            const addressesWithPendingIncomingTransactions = [
                // (Index 1) -> shared/__tests__/__samples__/transaction -> unconfirmedValueTransactions
                '5e4d98d49f63da581da73e0ba6d620a8139ed9a06dea03b40e5ddcf0563f8194',
            ];

            const expectedResult = filter(
                mockAddressData,
                (addressObject) => !includes(addressesWithPendingIncomingTransactions, addressObject.address),
            );

            expect(result).to.eql(expectedResult);
        });
    });
});

describe('#getAddressDataUptoRemainder', () => {
    let seedStore;

    before(() => {
        seedStore = {
            generateAddress: ({ index }) => {
                const addressMap = {
                    10: 'a'.repeat(64),
                    11: 'b'.repeat(64),
                    12: 'c'.repeat(64),
                };

                return Promise.resolve(addressMap[index]);
            },
        };
    });

    describe('when latest address is not blacklisted', () => {
        it('should return latest address as remainder', () => {
            return addressesUtils
                .getAddressDataUptoRemainder()(mockAddressData, [], seedStore, ['f'.repeat(64), 'e'.repeat(64)])
                .then(({ remainderAddress, addressDataUptoRemainder }) => {
                    expect(remainderAddress).to.equal(latestAddressWithoutChecksum);
                    expect(addressDataUptoRemainder).to.eql(mockAddressData);
                });
        });
    });

    describe('when latest address is blacklisted', () => {
        describe('when newly generated address is not blacklisted', () => {
            beforeEach(() => {
                nock('http://localhost:14265', {
                    reqheaders: {
                        'Content-Type': 'application/json',
                        'X-HELIX-API-Version': IRI_API_VERSION,
                    },
                    filteringScope: () => true,
                })
                    .filteringRequestBody(() => '*')
                    .persist()
                    .post('/', '*')
                    .reply(200, (_, body) => {
                        const addresses = body.addresses;

                        const resultMap = {
                            getBalances: { balances: map(addresses, () => '0') },
                            findTransactions: { hashes: [] },
                            wereAddressesSpentFrom: { states: map(addresses, () => false) },
                            getNodeInfo: {
                                appVersion: '1',
                                currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                                latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                                latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                                roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                                lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                            },
                            getTransactionStrings: {
                                txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                    ? milestoneBytes
                                    : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                            },
                        };

                        return resultMap[body.command] || {};
                    });
            });

            afterEach(() => {
                nock.cleanAll();
            });

            it('should generate new addresses and return latest unused address as the remainder address', () => {
                return addressesUtils
                    .getAddressDataUptoRemainder()(mockAddressData, [], seedStore, [
                        // Blacklist latest address
                        latestAddressWithoutChecksum,
                    ])
                    .then(({ remainderAddress, addressDataUptoRemainder }) => {
                        expect(remainderAddress).to.equal('a'.repeat(64));
                        expect(addressDataUptoRemainder).to.eql([
                            ...mockAddressData,
                            {
                                address: 'a'.repeat(64),
                                balance: 0,
                                checksum: 'f5541cc3',
                                index: 10,
                                spent: {
                                    local: false,
                                    remote: false,
                                },
                            },
                        ]);
                    });
            });
        });

        describe('when newly generated address is blacklisted', () => {
            beforeEach(() => {
                nock('http://localhost:14265', {
                    reqheaders: {
                        'Content-Type': 'application/json',
                        'X-HELIX-API-Version': IRI_API_VERSION,
                    },
                })
                    .filteringRequestBody(() => '*')
                    .persist()
                    .post('/', '*')
                    .reply(200, (_, body) => {
                        const addresses = body.addresses;

                        const resultMap = {
                            getBalances: { balances: map(addresses, () => '0') },
                            findTransactions: { hashes: [] },
                            wereAddressesSpentFrom: { states: map(addresses, () => false) },
                        };

                        return resultMap[body.command] || {};
                    });
            });

            afterEach(() => {
                nock.cleanAll();
            });

            it('should recursively generate new addresses till latest unused is not part of the blacklisted addresses list', () => {
                it('should recursively generate new addresses till latest unused is not part of the blacklisted addresses list', () => {
                    return addressesUtils
                        .getAddressDataUptoRemainder()(mockAddressData, [], seedStore, [
                            // Blacklist latest address (index 9)
                            latestAddressWithoutChecksum,
                            // Blacklist address (index 10)
                            'a'.repeat(64),
                            // Blacklist address (index 11),
                            'b'.repeat(64),
                        ])
                        .then(({ remainderAddress, addressDataUptoRemainder }) => {
                            // Address (index 12)
                            expect(remainderAddress).to.equal('c'.repeat(64));

                            expect(addressDataUptoRemainder).to.eql([
                                ...mockAddressData,
                                {
                                    address: 'a'.repeat(64),
                                    balance: 0,
                                    index: 10,
                                    checksum: 'f5541cc3',
                                    spent: {
                                        local: false,
                                        remote: false,
                                    },
                                },
                                {
                                    address: 'b'.repeat(64),
                                    balance: 0,
                                    index: 11,
                                    checksum: 'b73c2236',
                                    spent: {
                                        local: false,
                                        remote: false,
                                    },
                                },
                                {
                                    address: 'c'.repeat(64),
                                    balance: 0,
                                    index: 12,
                                    checksum: 'c65712df',
                                    spent: {
                                        local: false,
                                        remote: false,
                                    },
                                },
                            ]);
                        });
                });
            });
        });
    });
});

describe('#filterSpentAddressData', () => {
    describe('when all addresses in addressData are marked spent locally', () => {
        it('should return an empty array', () => {
            return addressesUtils
                .filterSpentAddressData()(
                    map(mockAddressData, (addressObject) => ({
                        ...addressObject,
                        ...{ spent: { ...addressObject.spent, local: true } },
                    })),
                    [],
                )
                .then((unspentAddressData) => {
                    expect(unspentAddressData).to.eql([]);
                });
        });
    });

    describe('when some addresses in addressData are marked spent locally', () => {
        beforeEach(() => {
            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    if (body.command === 'wereAddressesSpentFrom') {
                        const addresses = body.addresses;

                        const resultMap = reduce(
                            mockAddressData,
                            (acc, addressObject) => {
                                acc = {
                                    ...acc,
                                    [addressObject.address]: addressObject.spent.remote,
                                };

                                return acc;
                            },
                            {},
                        );

                        return { states: map(addresses, (address) => resultMap[address]) };
                    } else if (body.command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                            latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                            lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                        };
                    } else if (body.command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('should filter addressData with spent addresses', () => {
            return addressesUtils
                .filterSpentAddressData()(mockAddressData, transactions)
                .then((actualUnspentAddressData) => {
                    const expectedAddressData = [
                        {
                            address: 'c4985fa20c67354b8a094287b11f6ec4fd2f63fd0a74509fe9bf21982db6b5f8',
                            balance: 0,
                            index: 4,
                            checksum: '750b0406',
                            spent: { local: false, remote: false },
                        },
                        {
                            address: '71cace39b6854a77b7355742565afe9789c1646348266a98c86e6165f08cfa1d',
                            balance: 150,
                            index: 7,
                            checksum: '8b325017',
                            spent: { local: false, remote: false },
                        },
                        {
                            address: 'dbd93a6a2f3741546459e59a2e6d725f0d72dfb7b37c7e8a4374536c766321f7',
                            balance: 10,
                            index: 8,
                            checksum: '9eb4f4ea',
                            spent: { local: false, remote: false },
                        },
                        {
                            address: '37dabe14aade00fffbf6e1333581ee7ec7753e01729305c581d539068e6e0492',
                            balance: 0,
                            index: 9,
                            checksum: '59dd051f',
                            spent: { local: false, remote: false },
                        },
                    ];

                    expect(actualUnspentAddressData).to.eql(expectedAddressData);
                });
        });
    });
});

describe('#attachAndFormatAddress', () => {
    let accountName;
    let seedStore;

    before(() => {
        accountName = 'TEST';
        seedStore = {
            generateAddress: () => Promise.resolve('a'.repeat(64)),
            prepareTransfers: () => () => Promise.resolve([EMPTY_TRANSACTION_HEX]),
            performPow: () =>
                Promise.resolve({
                    txs: newZeroValueAttachedTransactionBytes,
                    transactionObjects: newZeroValueAttachedTransaction,
                }),
        };
    });

    describe('when finds transaction hashes for specified address', () => {
        beforeEach(() => {
            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    if (body.command === 'wereAddressesSpentFrom') {
                        const addresses = body.addresses;

                        return { states: map(addresses, () => false) };
                    } else if (body.command === 'findTransactions') {
                        const addresses = body.addresses;

                        return { hashes: map(addresses, () => EMPTY_HASH_TXBYTES) };
                    } else if (body.command === 'getTransactionsToApprove') {
                        return {
                            trunkTransaction: newZeroValueAttachedTransactionBaseTrunk,
                            branchTransaction: newZeroValueAttachedTransactionBaseBranch,
                        };
                    } else if (body.command === 'attachToTangle') {
                        return { txs: newZeroValueTransactionBytes };
                    } else if (body.command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            latestMilestone: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidSubtangleMilestone: LATEST_SOLID_SUBTANGLE_MILESTONE,
                            latestMilestoneIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            latestSolidSubtangleMilestoneIndex: LATEST_SOLID_SUBTANGLE_MILESTONE_INDEX,
                        };
                    } else if (body.command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('should throw with an error "Address already attached."', () => {
            const accountState = mockAccounts.accountInfo[accountName];

            return addressesUtils
                .attachAndFormatAddress()(
                    latestAddressWithoutChecksum,
                    latestAddressIndex,
                    latestAddressBalance,
                    seedStore,
                    accountState,
                    null,
                )
                .then(() => {
                    throw new Error();
                })
                .catch((error) => {
                    expect(error.message).to.equal('Address already attached.');
                });
        });
    });

    describe('when does not find transaction hashes for specified address', () => {
        beforeEach(() => {
            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    if (body.command === 'wereAddressesSpentFrom') {
                        const addresses = body.addresses;

                        return { states: map(addresses, () => false) };
                    } else if (body.command === 'findTransactions') {
                        return { hashes: [] };
                    } else if (body.command === 'getTransactionsToApprove') {
                        return {
                            trunkTransaction: newZeroValueAttachedTransactionBaseTrunk,
                            branchTransaction: newZeroValueAttachedTransactionBaseBranch,
                        };
                    } else if (body.command === 'attachToTangle') {
                        return { txs: newZeroValueTransactionBytes };
                    } else if (body.command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                            latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                            lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                        };
                    } else if (body.command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });
        // TODO
        it('should return an object with formatted address data', () => {
            const accountState = mockAccounts.accountInfo[accountName];

            return addressesUtils
                .attachAndFormatAddress()(
                    latestAddressWithoutChecksum,
                    latestAddressIndex,
                    latestAddressBalance,
                    seedStore,
                    accountState,
                    null,
                )
                .then((result) => {
                    expect(result.attachedAddressObject).to.eql(latestAddressObject);
                });
        });

        it('should return an object with newly attached transaction object', () => {
            const accountState = mockAccounts.accountInfo[accountName];

            return addressesUtils
                .attachAndFormatAddress()(
                    latestAddressWithoutChecksum,
                    latestAddressIndex,
                    latestAddressBalance,
                    seedStore,
                    accountState,
                    null,
                )
                .then((result) => {
                    expect(result.attachedTransactions).to.eql(newZeroValueAttachedTransaction);
                });
        });
    });
});

describe('#syncAddresses', () => {
    let seedStore;

    before(() => {
        seedStore = {
            generateAddress: ({ index }) => {
                const addressMap = {
                    [latestAddressIndex + 1]: 'a'.repeat(64),
                    [latestAddressIndex + 2]: 'b'.repeat(64),
                    [latestAddressIndex + 3]: 'c'.repeat(64),
                };

                return Promise.resolve(addressMap[index]);
            },
        };
    });

    describe('when latest address is unused (balance = 0, spent = false, size(hashes) = 0)', () => {
        beforeEach(() => {
            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    if (body.command === 'wereAddressesSpentFrom') {
                        const addresses = body.addresses;

                        return { states: map(addresses, () => false) };
                    } else if (body.command === 'findTransactions') {
                        return { hashes: [] };
                    } else if (body.command === 'getBalances') {
                        return { balances: map(body.addresses, () => '0') };
                    } else if (body.command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                            latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                            lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                        };
                    } else if (body.command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('should return existing address data', () => {
            return addressesUtils
                .syncAddresses()(seedStore, mockAddressData, transactions)
                .then((newAddressData) => {
                    expect(newAddressData).to.eql(mockAddressData);
                });
        });
    });

    describe('when the latest address is used (balance > 0) or (spent = true) or size(hashes) > 0', () => {
        beforeEach(() => {
            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    const { command, addresses } = body;

                    const resultMap = {
                        [latestAddressWithoutChecksum]: {
                            spent: false,
                            hashes: ['0'.repeat(64)],
                            balance: '0',
                        },
                        ['a'.repeat(64)]: {
                            spent: false,
                            hashes: [],
                            balance: '10',
                        },
                        ['b'.repeat(64)]: {
                            spent: true,
                            hashes: [],
                            balance: '0',
                        },
                        ['c'.repeat(64)]: {
                            spent: false,
                            hashes: [],
                            balance: '0',
                        },
                    };

                    if (command === 'wereAddressesSpentFrom') {
                        return {
                            states: reduce(
                                addresses,
                                (acc, address) => {
                                    acc.push(resultMap[address].spent);

                                    return acc;
                                },
                                [],
                            ),
                        };
                    } else if (body.command === 'findTransactions') {
                        return {
                            hashes: reduce(
                                addresses,
                                (acc, address) => {
                                    if (address in resultMap) {
                                        acc = [...acc, ...resultMap[address].hashes];
                                    }

                                    return acc;
                                },
                                [],
                            ),
                        };
                    } else if (command === 'getBalances') {
                        return {
                            balances: reduce(
                                addresses,
                                (acc, address) => {
                                    acc.push(resultMap[address].balance);

                                    return acc;
                                },
                                [],
                            ),
                        };
                    } else if (body.command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                            latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                            lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                        };
                    } else if (body.command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('should add latest address data', () => {
            return addressesUtils
                .syncAddresses()(seedStore, mockAddressData, transactions)
                .then((updatedAddressData) => {
                    const newAddressData = [
                        {
                            address: 'a'.repeat(64),
                            index: 10,
                            spent: {
                                local: false,
                                remote: false,
                            },
                            balance: 10,
                            checksum: 'f5541cc3',
                        },
                        {
                            address: 'b'.repeat(64),
                            index: 11,
                            spent: {
                                local: false,
                                remote: true,
                            },
                            balance: 0,
                            checksum: 'b73c2236',
                        },
                        {
                            address: 'c'.repeat(64),
                            index: 12,
                            spent: {
                                local: false,
                                remote: false,
                            },
                            balance: 0,
                            checksum: 'c65712df',
                        },
                    ];

                    const expectedAddressData = [...mockAddressData, ...newAddressData];

                    expect(updatedAddressData).to.eql(expectedAddressData);
                });
        });
    });
});

describe('#categoriseAddressesBySpentStatus', () => {
    let addresses;
    let sandbox;

    before(() => {
        addresses = ['a'.repeat(64), 'b'.repeat(64), 'c'.repeat(64), 'd'.repeat(64)];
    });

    beforeEach(() => {
        sandbox = sinon.sandbox.create();

        sandbox.stub(quorum, 'wereAddressesSpentFrom').resolves([false, true, false, true]);
    });

    afterEach(() => {
        quorum.wereAddressesSpentFrom.restore();
        sandbox.restore();
    });

    it('should categorise spent addresses', () => {
        return addressesUtils
            .categoriseAddressesBySpentStatus()(addresses)
            .then((result) => {
                expect(result.spent).to.eql(['b'.repeat(64), 'd'.repeat(64)]);
            });
    });

    it('should categorise unspent addresses', () => {
        return addressesUtils
            .categoriseAddressesBySpentStatus()(addresses)
            .then((result) => {
                expect(result.unspent).to.eql(['a'.repeat(64), 'c'.repeat(64)]);
            });
    });
});

describe('#getLatestAddress', () => {
    describe('withChecksum = true', () => {
        it('should return address (with checksum) with highest index', () => {
            const result = addressesUtils.getLatestAddress(mockAddressData, true);
            expect(result).to.equal(latestAddressWithChecksum);
        });
    });

    describe('withChecksum = false', () => {
        it('should return address (without checksum) with highest index', () => {
            const result = addressesUtils.getLatestAddress(mockAddressData);
            expect(result).to.equal(latestAddressWithoutChecksum);
        });
    });
});

describe('#getLatestAddressObject', () => {
    it('should return address object with highest index', () => {
        const result = addressesUtils.getLatestAddressObject(mockAddressData);
        expect(result).to.eql(latestAddressObject);
    });
});

describe('#findSpendStatusesFromTransactions', () => {
    it('should return spend status true for addresses used as inputs', () => {
        const addresses = ['a'.repeat(64), 'b'.repeat(64), 'c'.repeat(64)];
        const transactionObjects = [
            {
                address: 'a'.repeat(64),
                value: -1,
            },
            {
                address: 'b'.repeat(64),
                value: 0,
            },
            {
                address: 'b'.repeat(64),
                value: -1,
            },
            {
                address: 'c'.repeat(64),
                value: 0,
            },
        ];

        const result = addressesUtils.findSpendStatusesFromTransactions(addresses, transactionObjects);
        expect(result).to.eql([true, true, false]);
    });
});

describe('#transformAddressDataToInputs', () => {
    it('should assign "security" passed as second argument to each transformed input', () => {
        const inputs = addressesUtils.transformAddressDataToInputs(mockAddressData, 3);

        each(inputs, (input) => expect(input.security).to.equal(3));
    });

    it('should assign correct keyIndex, address and balance to each input', () => {
        const inputs = addressesUtils.transformAddressDataToInputs(mockAddressData);

        each(mockAddressData, (addressObject) => {
            const { address, balance, index } = addressObject;
            const input = find(inputs, { address });

            expect(input.address).to.equal(address);
            expect(input.balance).to.equal(balance);
            expect(input.keyIndex).to.equal(index);
        });
    });
});

describe('#filterAddressDataWithPendingOutgoingTransactions', () => {
    it('should filter address data with pending outgoing transactions', () => {
        const result = addressesUtils.filterAddressDataWithPendingOutgoingTransactions(mockAddressData, transactions);

        const addressesWithPendingOutgoingTransactions = [
            // Part of unconfirmedValueTransactions.
            'c212548bd3c4b596bf24b16c36aaa69a5ecaf5a8240232380b0a26539b6b8619',
            // Part of failedTransactionsWithCorrectTransactionHashes
            '5e4d98d49f63da581da73e0ba6d620a8139ed9a06dea03b40e5ddcf0563f8194',
            // Part of failedTransactionsWithIncorrectTransactionHashes
            'fcb610407fba6820c44cbc800205013cd92707412c990ffc6669f5477346cffb',
        ];

        const expectedAddressData = filter(
            mockAddressData,
            (addressObject) => !includes(addressesWithPendingOutgoingTransactions, addressObject.address),
        );

        expect(result).to.eql(expectedAddressData);
    });
});

describe('#isAnyAddressSpent', () => {
    let addresses;

    before(() => {
        addresses = map(['a', 'b', 'c', '0'], (char) => char.repeat(64));
    });

    describe('when all addresses are unspent', () => {
        beforeEach(() => {
            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    const { addresses, command } = body;

                    if (command === 'wereAddressesSpentFrom') {
                        return { states: map(addresses, () => false) };
                    } else if (command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                            latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                            lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                        };
                    } else if (command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('should return false', () => {
            return addressesUtils
                .isAnyAddressSpent()(addresses)
                .then((isSpent) => expect(isSpent).to.equal(false));
        });
    });

    describe('when all addresses are spent', () => {
        beforeEach(() => {
            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    const { addresses, command } = body;

                    if (command === 'wereAddressesSpentFrom') {
                        return { states: map(addresses, () => true) };
                    } else if (command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                            latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                            lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                        };
                    } else if (command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('should return true', () => {
            return addressesUtils
                .isAnyAddressSpent()(addresses)
                .then((isSpent) => expect(isSpent).to.equal(true));
        });
    });

    describe('when some addresses are spent', () => {
        beforeEach(() => {
            nock('http://localhost:14265', {
                reqheaders: {
                    'Content-Type': 'application/json',
                    'X-HELIX-API-Version': IRI_API_VERSION,
                },
                filteringScope: () => true,
            })
                .filteringRequestBody(() => '*')
                .persist()
                .post('/', '*')
                .reply(200, (_, body) => {
                    const { addresses, command } = body;

                    if (command === 'wereAddressesSpentFrom') {
                        return { states: map(addresses, (_, idx) => idx % 2 === 0) };
                    } else if (command === 'getNodeInfo') {
                        return {
                            appVersion: '1',
                            currentRoundIndex: NODE_INFO_CURRENT_ROUND_INDEX,
                            latestSolidRoundHash: NODE_INFO_LATEST_SOLID_ROUND_HASH,
                            latestSolidRoundIndex: NODE_INFO_LATEST_SOLID_ROUND_HASH_INDEX,
                            roundStartIndex: NODE_INFO_ROUND_START_INDEX,
                            lastSnapshottedRoundIndex: NODE_INFO_LATEST_SNAPSHOTTED_ROUND_INDEX,
                        };
                    } else if (command === 'getTransactionStrings') {
                        return {
                            txs: includes(body.hashes, NODE_INFO_LATEST_SOLID_ROUND_HASH)
                                ? milestoneBytes
                                : map(body.hashes, () => EMPTY_TRANSACTION_HEX),
                        };
                    }

                    return {};
                });
        });

        afterEach(() => {
            nock.cleanAll();
        });

        it('should return true', () => {
            return addressesUtils
                .isAnyAddressSpent()(addresses)
                .then((isSpent) => expect(isSpent).to.equal(true));
        });
    });
});
