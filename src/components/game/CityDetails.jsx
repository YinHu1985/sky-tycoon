import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/useGameStore';
import { CITIES } from '../../data/cities';
import { PLANE_TYPES } from '../../data/planes';
import { PROPERTY_TYPES } from '../../data/properties';
import { calculateCityRelationship, getCityAttributes } from '../../lib/modifiers';
import { formatMoney } from '../../lib/utils';
import { Building, Plane, Heart, Building2, Briefcase, Plus, Bus, UtensilsCrossed, Wrench, X } from 'lucide-react';

export const CityDetails = ({ cityId }) => {
  const city = CITIES.find(c => c.id === cityId);

  const { company, routes, buyProperty, sellProperty } = useGameStore(useShallow(state => {
    const playerCompany = state.companies.find(c => c.id === state.playerCompanyId);
    return {
      company: playerCompany,
      routes: playerCompany ? playerCompany.routes : [],
      buyProperty: state.buyProperty,
      sellProperty: state.sellProperty
    };
  }));

  if (!city) return null;

  const cityRoutes = routes.filter(r => r.sourceId === cityId || r.targetId === cityId);

  // Calculate relationship
  const relationship = calculateCityRelationship(company, cityId);

  // Calculate effective attributes
  const { biz, tour } = getCityAttributes(company, city);

  // Get properties in this city
  const cityProperties = company.properties ? company.properties.filter(p => p.cityId === cityId) : [];

  const handleBuyProperty = (propertyType) => {
    const propConfig = PROPERTY_TYPES[propertyType];
    if (company.money < propConfig.baseCost) {
      useGameStore.getState().addNotification('Insufficient funds', 'error');
      return;
    }
    buyProperty(propertyType, cityId, propConfig.baseCost);
    useGameStore.getState().addNotification(`Purchased ${propConfig.name}!`, 'success');
  };

  const handleSellProperty = (propertyId, propertyName, sellValue) => {
    sellProperty(propertyId);
    useGameStore.getState().addNotification(
      `Sold ${propertyName} for ${formatMoney(sellValue)}`,
      'success'
    );
  };

  const getPropertyIcon = (iconName) => {
    switch(iconName) {
      case 'Building2': return Building2;
      case 'Briefcase': return Briefcase;
      case 'Bus': return Bus;
      case 'UtensilsCrossed': return UtensilsCrossed;
      case 'Wrench': return Wrench;
      default: return Building;
    }
  };

  return (
    <div className="w-[350px] flex flex-col gap-4">
      {/* City Image Header */}
      {city.image && (
        <div className="relative rounded-lg overflow-hidden">
          <img
            src={city.image}
            alt={city.name}
            loading="lazy"
            className="w-full h-36 object-cover bg-slate-800"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
          <h2 className="absolute bottom-2 left-3 text-2xl font-bold text-white drop-shadow-lg">
            {city.name}
          </h2>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-slate-700 p-4 rounded border border-slate-600">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800 p-2 rounded text-center">
            <div className="text-xs text-slate-400 uppercase">Business</div>
            <div className="text-xl font-bold text-sky-400">{Math.round(biz)}</div>
          </div>
          <div className="bg-slate-800 p-2 rounded text-center">
            <div className="text-xs text-slate-400 uppercase">Tourism</div>
            <div className="text-xl font-bold text-pink-400">{Math.round(tour)}</div>
          </div>
        </div>
      </div>

      {/* City Relationship */}
      <div className="bg-slate-700 p-3 rounded border border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-pink-400" />
            <span className="text-sm text-slate-300">City Relationship</span>
          </div>
          <div className="text-xl font-bold text-pink-400">{relationship.toFixed(0)}</div>
        </div>
        <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-pink-500 transition-all duration-300"
            style={{ width: `${relationship}%` }}
          />
        </div>
      </div>

      {/* Properties Owned */}
      <div>
        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
          <Building size={16} /> Your Properties ({cityProperties.length})
        </h4>

        {cityProperties.length > 0 ? (
          <div className="space-y-2">
            {cityProperties.map(prop => {
              const propType = PROPERTY_TYPES[prop.type];
              const Icon = getPropertyIcon(propType.icon);
              const sellValue = prop.purchaseCost * 0.5;
              const netIncome = (prop.weeklyIncome || 0) - (prop.weeklyMaintCost || 0);

              return (
                <div key={prop.id} className="bg-slate-700 p-2 rounded border border-slate-600 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-sky-400" />
                      <span className="font-bold text-white">{propType.name}</span>
                    </div>
                    <button
                      onClick={() => handleSellProperty(prop.id, propType.name, sellValue)}
                      className="p-1 bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                      title={`Sell for ${formatMoney(sellValue)}`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="text-xs text-slate-400 flex justify-between">
                    <span>Income: {formatMoney(prop.weeklyIncome || 0)}/wk</span>
                    <span>Cost: {formatMoney(prop.weeklyMaintCost || 0)}/wk</span>
                  </div>
                  <div className="text-xs font-bold mt-1" style={{ color: netIncome >= 0 ? '#4ade80' : '#f87171' }}>
                    Net: {formatMoney(netIncome)}/wk
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-slate-500 text-sm italic text-center py-2 bg-slate-800/50 rounded">
            No properties owned in this city.
          </div>
        )}
      </div>

      {/* Buy Properties */}
      <div>
        <h4 className="font-bold text-white mb-2">Available Properties</h4>
        <div className="space-y-2">
          {Object.values(PROPERTY_TYPES).map(propType => {
            const Icon = getPropertyIcon(propType.icon);
            const canAfford = company.money >= propType.baseCost;
            const alreadyOwned = cityProperties.some(p => p.type === propType.id);

            // Skip if already owned
            if (alreadyOwned) {
              return (
                <div key={propType.id} className="bg-slate-800/50 p-3 rounded border border-slate-600 opacity-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={16} className="text-slate-500" />
                      <span className="font-bold text-slate-400">{propType.name}</span>
                    </div>
                    <span className="text-slate-500 font-mono text-xs">
                      Owned
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{propType.description}</p>
                </div>
              );
            }

            return (
              <div key={propType.id} className="bg-slate-700 p-3 rounded border border-slate-600">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-sky-400" />
                    <span className="font-bold text-white">{propType.name}</span>
                  </div>
                  <span className="text-green-400 font-mono text-sm font-bold">
                    {formatMoney(propType.baseCost)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-1">{propType.description}</p>

                {/* Show property stats */}
                <div className="text-xs text-slate-400 mb-2 space-y-0.5">
                  {propType.bizMultiplier > 0 && (
                    <div>Business income: {(propType.bizMultiplier * 100).toFixed(2)}%</div>
                  )}
                  {propType.tourMultiplier > 0 && (
                    <div>Tourism income: {(propType.tourMultiplier * 100).toFixed(2)}%</div>
                  )}
                  <div>Weekly cost: {formatMoney(propType.fixedMaintCost)}</div>
                  {propType.loadFactorBonus > 0 && (
                    <div className="text-green-400">+{(propType.loadFactorBonus * 100).toFixed(0)}% load factor</div>
                  )}
                  {propType.relationshipBonus > 0 && (
                    <div className="text-pink-400">+{propType.relationshipBonus} relationship</div>
                  )}
                  {propType.maintReduction > 0 && (
                    <div className="text-purple-400">-{(propType.maintReduction * 100).toFixed(0)}% flight maintenance</div>
                  )}
                  {propType.serviceReduction > 0 && (
                    <div className="text-cyan-400">-{(propType.serviceReduction * 100).toFixed(0)}% flight operations</div>
                  )}
                </div>

                <button
                  onClick={() => handleBuyProperty(propType.id)}
                  disabled={!canAfford}
                  className="w-full py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold rounded flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus size={12} /> Purchase
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connected Routes */}
      <div>
        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
          <Plane size={16} /> Connected Routes ({cityRoutes.length})
        </h4>
        
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
          {cityRoutes.map(route => {
            const isSource = route.sourceId === cityId;
            const otherCityId = isSource ? route.targetId : route.sourceId;
            const otherCity = CITIES.find(c => c.id === otherCityId);
            const plane = PLANE_TYPES.find(p => p.id === route.planeTypeId);
            
            return (
              <div key={route.id} className="bg-slate-700 p-2 rounded border border-slate-600 text-sm flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <span className={isSource ? "text-green-400" : "text-orange-400"}>
                     {isSource ? "→" : "←"}
                   </span>
                   <span className="font-bold">{otherCity?.name}</span>
                </div>
                <div className="text-xs text-slate-400">
                  {plane?.name}
                </div>
              </div>
            );
          })}
          
          {cityRoutes.length === 0 && (
             <div className="text-slate-500 text-sm italic text-center py-4 bg-slate-800/50 rounded">
               No active routes connected.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
