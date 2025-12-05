import React from 'react';
import { MapPin, Users } from 'lucide-react';

const LocationTable = ({ locations }) => {
    // Calculate total accesses
    const totalAccess = locations.reduce((sum, loc) => sum + loc.count, 0);

    // Get top 10 locations
    const topLocations = locations.slice(0, 10);

    return (
        <div className="location-table-container">
            <div className="location-table-header">
                <MapPin size={24} />
                <h3>Acessos por Localização</h3>
            </div>

            <div className="location-table">
                <table>
                    <thead>
                        <tr>
                            <th>País</th>
                            <th>Estado</th>
                            <th>Cidade</th>
                            <th>Bairro</th>
                            <th>Acessos</th>
                            <th>%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {topLocations.length > 0 ? (
                            topLocations.map((location, index) => {
                                const percentage = ((location.count / totalAccess) * 100).toFixed(1);

                                return (
                                    <tr key={index}>
                                        <td>
                                            <div className="location-cell">
                                                <span className="country-flag">
                                                    {location.country === 'Brasil' ? '🇧🇷' :
                                                        location.country === 'Portugal' ? '🇵🇹' :
                                                            location.country === 'Estados Unidos' ? '🇺🇸' : '🌍'}
                                                </span>
                                                {location.country}
                                            </div>
                                        </td>
                                        <td>{location.state}</td>
                                        <td>{location.city}</td>
                                        <td>{location.district}</td>
                                        <td>
                                            <div className="access-count">
                                                <Users size={14} />
                                                <span>{location.count}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="percentage-bar">
                                                <div
                                                    className="percentage-fill"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                                <span className="percentage-text">{percentage}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="no-data">
                                    Nenhum dado de localização disponível
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {locations.length > 10 && (
                <div className="location-table-footer">
                    Mostrando 10 de {locations.length} localizações
                </div>
            )}
        </div>
    );
};

export default LocationTable;
