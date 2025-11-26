import React from 'react';

const CharacterCounter = ({ current, max, platform }) => {
    const percentage = (current / max) * 100;

    let colorClass = 'text-success';
    if (percentage > 90) {
        colorClass = 'text-danger';
    } else if (percentage > 75) {
        colorClass = 'text-warning';
    }

    return (
        <div className="d-flex justify-content-between align-items-center mt-2">
            <small className={`fw-bold ${colorClass}`}>
                {current} / {max} caracteres
            </small>
            <div className="progress" style={{ width: '60%', height: '8px' }}>
                <div
                    className={`progress-bar ${percentage > 90 ? 'bg-danger' :
                            percentage > 75 ? 'bg-warning' :
                                'bg-success'
                        }`}
                    role="progressbar"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                    aria-valuenow={current}
                    aria-valuemin="0"
                    aria-valuemax={max}
                ></div>
            </div>
        </div>
    );
};

export default CharacterCounter;
