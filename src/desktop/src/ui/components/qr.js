import React from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qr.js/lib/QRCode';

/**
 * SVG QR component
 */
export default class QR extends React.PureComponent {
    static propTypes = {
        /** QR code content */
        data: PropTypes.string.isRequired,
    };

    render() {
        const { data } = this.props;

        const qr = new QRCode(-1, 1);

        qr.addData(data);
        qr.make();

        const cells = qr.modules;

        return (
            <svg width="90" height="90" viewBox={`0 0 ${cells.length} ${cells.length}`} style={{marginTop:'-60px',position:'absolute'}}>
                {cells.map((row, rowIndex) => {
                    return row.map((cell, cellIndex) => (
                        <rect
                        height={1}
                        key={cellIndex}
                        style={{ fill: cell ? '#ffffff' : 'none' }}
                        width={1}
                        x={cellIndex}
                        y={rowIndex}
                        />
                    ));
                })}
            </svg>
        );
    }
}
