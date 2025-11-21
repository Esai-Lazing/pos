import React from 'react';

export const RestaurantIllustration = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
            <linearGradient id="restaurantGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B6B" />
                <stop offset="100%" stopColor="#FF8E8E" />
            </linearGradient>
        </defs>
        {/* Table */}
        <rect x="40" y="120" width="120" height="8" rx="4" fill="url(#restaurantGrad)" />
        {/* Chair 1 */}
        <rect x="30" y="130" width="20" height="20" rx="4" fill="#FF6B6B" opacity="0.7" />
        {/* Chair 2 */}
        <rect x="150" y="130" width="20" height="20" rx="4" fill="#FF6B6B" opacity="0.7" />
        {/* Plate */}
        <circle cx="100" cy="110" r="25" fill="#FFF" stroke="#FF6B6B" strokeWidth="2" />
        {/* Utensils */}
        <rect x="75" y="90" width="3" height="25" rx="1.5" fill="#FF6B6B" />
        <rect x="122" y="90" width="3" height="25" rx="1.5" fill="#FF6B6B" />
        {/* Food */}
        <circle cx="100" cy="110" r="12" fill="#FFD93D" />
    </svg>
);

export const BarIllustration = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
            <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4ECDC4" />
                <stop offset="100%" stopColor="#6EDDD6" />
            </linearGradient>
        </defs>
        {/* Bar counter */}
        <rect x="20" y="100" width="160" height="30" rx="4" fill="url(#barGrad)" />
        {/* Glass 1 */}
        <rect x="50" y="70" width="20" height="30" rx="2" fill="#FFF" opacity="0.9" />
        <rect x="52" y="72" width="16" height="26" rx="1" fill="#4ECDC4" opacity="0.3" />
        {/* Glass 2 */}
        <rect x="90" y="60" width="20" height="40" rx="2" fill="#FFF" opacity="0.9" />
        <rect x="92" y="62" width="16" height="36" rx="1" fill="#4ECDC4" opacity="0.3" />
        {/* Glass 3 */}
        <rect x="130" y="75" width="20" height="25" rx="2" fill="#FFF" opacity="0.9" />
        <rect x="132" y="77" width="16" height="21" rx="1" fill="#4ECDC4" opacity="0.3" />
        {/* Bottle */}
        <rect x="170" y="50" width="15" height="50" rx="2" fill="#2C3E50" />
        <rect x="172" y="52" width="11" height="8" fill="#E74C3C" />
    </svg>
);

export const CafeIllustration = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
            <linearGradient id="cafeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B4513" />
                <stop offset="100%" stopColor="#A0522D" />
            </linearGradient>
        </defs>
        {/* Cup */}
        <path d="M 60 80 L 60 140 L 140 140 L 140 80 L 120 60 L 80 60 Z" fill="url(#cafeGrad)" />
        <path d="M 120 60 L 120 80 L 140 80" fill="#654321" />
        {/* Coffee */}
        <ellipse cx="100" cy="100" rx="35" ry="25" fill="#3E2723" />
        <ellipse cx="100" cy="95" rx="30" ry="20" fill="#5D4037" />
        {/* Steam */}
        <path d="M 85 50 Q 90 40 95 50" stroke="#FFF" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M 100 50 Q 105 40 110 50" stroke="#FFF" strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M 115 50 Q 120 40 125 50" stroke="#FFF" strokeWidth="2" fill="none" opacity="0.6" />
        {/* Saucer */}
        <ellipse cx="100" cy="145" rx="45" ry="8" fill="#D4A574" />
    </svg>
);

export const HotelIllustration = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
            <linearGradient id="hotelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9B59B6" />
                <stop offset="100%" stopColor="#BB79DB" />
            </linearGradient>
        </defs>
        {/* Building */}
        <rect x="50" y="60" width="100" height="120" rx="4" fill="url(#hotelGrad)" />
        {/* Windows row 1 */}
        <rect x="65" y="80" width="15" height="15" rx="2" fill="#FFD700" />
        <rect x="90" y="80" width="15" height="15" rx="2" fill="#FFD700" />
        <rect x="115" y="80" width="15" height="15" rx="2" fill="#FFD700" />
        {/* Windows row 2 */}
        <rect x="65" y="105" width="15" height="15" rx="2" fill="#FFD700" />
        <rect x="90" y="105" width="15" height="15" rx="2" fill="#FFD700" />
        <rect x="115" y="105" width="15" height="15" rx="2" fill="#FFD700" />
        {/* Door */}
        <rect x="85" y="140" width="30" height="40" rx="2" fill="#2C3E50" />
        <circle cx="105" cy="160" r="2" fill="#FFD700" />
        {/* Sign */}
        <rect x="70" y="50" width="60" height="15" rx="2" fill="#E74C3C" />
        <text x="100" y="61" textAnchor="middle" fill="#FFF" fontSize="10" fontWeight="bold">HOTEL</text>
    </svg>
);

export const FastFoodIllustration = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
            <linearGradient id="fastfoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF9800" />
                <stop offset="100%" stopColor="#FFB74D" />
            </linearGradient>
        </defs>
        {/* Bag */}
        <path d="M 70 80 L 70 160 L 130 160 L 130 80 L 120 60 L 80 60 Z" fill="url(#fastfoodGrad)" />
        {/* Handles */}
        <path d="M 80 60 Q 80 50 90 50 Q 100 50 110 50 Q 120 50 120 60" stroke="#FF6F00" strokeWidth="3" fill="none" />
        {/* Fries */}
        <rect x="85" y="90" width="4" height="50" rx="2" fill="#FFD700" />
        <rect x="92" y="85" width="4" height="55" rx="2" fill="#FFD700" />
        <rect x="99" y="88" width="4" height="52" rx="2" fill="#FFD700" />
        <rect x="106" y="90" width="4" height="50" rx="2" fill="#FFD700" />
        <rect x="113" y="87" width="4" height="53" rx="2" fill="#FFD700" />
        {/* Burger */}
        <circle cx="100" cy="100" r="20" fill="#8B4513" />
        <circle cx="100" cy="100" r="15" fill="#FFD700" />
        <circle cx="100" cy="100" r="10" fill="#8B4513" />
    </svg>
);

export const RestaurantBarIllustration = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
            <linearGradient id="restaurantBarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B6B" />
                <stop offset="50%" stopColor="#4ECDC4" />
                <stop offset="100%" stopColor="#6EDDD6" />
            </linearGradient>
        </defs>
        {/* Table (Restaurant side) */}
        <rect x="30" y="120" width="70" height="8" rx="4" fill="#FF6B6B" />
        {/* Bar counter (Bar side) */}
        <rect x="100" y="100" width="70" height="30" rx="4" fill="#4ECDC4" />
        {/* Plate on table */}
        <circle cx="65" cy="110" r="20" fill="#FFF" stroke="#FF6B6B" strokeWidth="2" />
        <circle cx="65" cy="110" r="10" fill="#FFD93D" />
        {/* Glass on bar */}
        <rect x="130" y="70" width="18" height="30" rx="2" fill="#FFF" opacity="0.9" />
        <rect x="132" y="72" width="14" height="26" rx="1" fill="#4ECDC4" opacity="0.3" />
        {/* Bottle on bar */}
        <rect x="155" y="50" width="12" height="50" rx="2" fill="#2C3E50" />
        <rect x="157" y="52" width="8" height="6" fill="#E74C3C" />
    </svg>
);

export const AutreIllustration = () => (
    <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
            <linearGradient id="autreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#95A5A6" />
                <stop offset="100%" stopColor="#BDC3C7" />
            </linearGradient>
        </defs>
        {/* Building */}
        <rect x="60" y="70" width="80" height="100" rx="4" fill="url(#autreGrad)" />
        {/* Door */}
        <rect x="85" y="140" width="30" height="30" rx="2" fill="#34495E" />
        {/* Windows */}
        <rect x="75" y="90" width="20" height="20" rx="2" fill="#3498DB" />
        <rect x="105" y="90" width="20" height="20" rx="2" fill="#3498DB" />
    </svg>
);

export const CategoryIllustrations = {
    'fast-food': FastFoodIllustration,
    'gastronomique': RestaurantIllustration,
    'traditionnel': RestaurantIllustration,
    'italien': () => (
        <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
                <linearGradient id="italienGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E74C3C" />
                    <stop offset="50%" stopColor="#FFF" />
                    <stop offset="100%" stopColor="#27AE60" />
                </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="50" fill="url(#italienGrad)" />
            <circle cx="100" cy="100" r="35" fill="#FFF" />
            <circle cx="100" cy="100" r="20" fill="#E74C3C" />
        </svg>
    ),
    'asiatique': () => (
        <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
                <linearGradient id="asiatiqueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E67E22" />
                    <stop offset="100%" stopColor="#F39C12" />
                </linearGradient>
            </defs>
            <rect x="70" y="80" width="60" height="60" rx="4" fill="url(#asiatiqueGrad)" />
            <circle cx="100" cy="110" r="15" fill="#FFF" />
            <circle cx="100" cy="110" r="8" fill="#E67E22" />
        </svg>
    ),
    'pizzeria': () => (
        <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
                <linearGradient id="pizzaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFD700" />
                    <stop offset="100%" stopColor="#FFA500" />
                </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="60" fill="url(#pizzaGrad)" />
            <circle cx="100" cy="100" r="50" fill="#FFE4B5" />
            <circle cx="85" cy="90" r="5" fill="#E74C3C" />
            <circle cx="115" cy="90" r="5" fill="#E74C3C" />
            <circle cx="100" cy="110" r="5" fill="#E74C3C" />
            <circle cx="90" cy="120" r="5" fill="#27AE60" />
            <circle cx="110" cy="120" r="5" fill="#27AE60" />
        </svg>
    ),
    'grill': () => (
        <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
                <linearGradient id="grillGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E74C3C" />
                    <stop offset="100%" stopColor="#C0392B" />
                </linearGradient>
            </defs>
            <rect x="50" y="100" width="100" height="8" rx="4" fill="#34495E" />
            <rect x="50" y="115" width="100" height="8" rx="4" fill="#34495E" />
            <rect x="50" y="130" width="100" height="8" rx="4" fill="#34495E" />
            <circle cx="100" cy="110" r="20" fill="url(#grillGrad)" />
            <circle cx="100" cy="125" r="18" fill="url(#grillGrad)" />
        </svg>
    ),
    'autre': AutreIllustration,
};

