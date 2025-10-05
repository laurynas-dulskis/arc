import React from 'react';

interface FlightCardProps {
    route: string;
    dates: string;
    price: string;
    duration: string;
    seatsInfo: string;
    seatsAvailable: number;
    seatsTotal: number;
}

const FlightCard: React.FC<FlightCardProps> = ({ 
    route, 
    dates, 
    price, 
    duration,
    seatsAvailable, 
    seatsTotal 
}) => {
    const seatPercentage = Math.round(100 - (seatsAvailable / seatsTotal) * 100);

    return (
        <div className="border border-gray-200 bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition">
            <p className="font-semibold text-gray-800 text-lg">{route}</p>
            <p className="text-gray-600 text-sm mb-2">{dates}</p>
            <p className="text-gray-600 text-sm mb-2">
                <span className="font-bold">{duration}</span>
            </p>
            <div className="mb-2">
                <p className="text-gray-500 text-xs mt-1">
                    <span className="font-bold">{seatsAvailable}</span> of {seatsTotal} seats available
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${seatPercentage}%` }}
                    ></div>
                </div>
            </div>
            <p className="mt-2 text-gray-800 font-bold text-lg">From {price}</p>
        </div>
    );
};

export default FlightCard;