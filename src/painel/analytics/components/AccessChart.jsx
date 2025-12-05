import React from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';

const AccessChart = ({ timeline, period }) => {
    if (!timeline || Object.keys(timeline).length === 0) {
        return (
            <div className="access-chart-container">
                <div className="chart-header">
                    <BarChart3 size={24} />
                    <h3>Acessos ao Longo do Tempo</h3>
                </div>
                <div className="no-data-chart">
                    <TrendingUp size={48} />
                    <p>Nenhum dado disponível para o período selecionado</p>
                </div>
            </div>
        );
    }

    // Convert timeline object to array and sort
    const data = Object.entries(timeline).map(([label, value]) => ({
        label,
        value
    }));

    // Find max value for scaling
    const maxValue = Math.max(...data.map(d => d.value));
    const chartHeight = 300;

    return (
        <div className="access-chart-container">
            <div className="chart-header">
                <BarChart3 size={24} />
                <h3>Acessos ao Longo do Tempo</h3>
                <span className="period-badge">{period}</span>
            </div>

            <div className="chart-wrapper">
                <div className="chart-y-axis">
                    <span>{maxValue}</span>
                    <span>{Math.floor(maxValue * 0.75)}</span>
                    <span>{Math.floor(maxValue * 0.5)}</span>
                    <span>{Math.floor(maxValue * 0.25)}</span>
                    <span>0</span>
                </div>

                <div className="chart-content">
                    <div className="chart-bars" style={{ height: `${chartHeight}px` }}>
                        {data.map((item, index) => {
                            const barHeight = maxValue > 0
                                ? (item.value / maxValue) * chartHeight
                                : 0;

                            return (
                                <div key={index} className="bar-wrapper">
                                    <div
                                        className="bar"
                                        style={{ height: `${barHeight}px` }}
                                        data-value={item.value}
                                    >
                                        <div className="bar-fill" />
                                        <span className="bar-value">{item.value}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="chart-x-axis">
                        {data.map((item, index) => (
                            <div key={index} className="x-label">
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="chart-footer">
                <div className="chart-legend">
                    <div className="legend-item">
                        <div className="legend-color" />
                        <span>Número de Acessos</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessChart;
