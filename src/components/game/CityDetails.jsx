import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/useGameStore';
import { CITIES } from '../../data/cities';
import { PLANE_TYPES } from '../../data/planes';
import { PROPERTY_TYPES } from '../../data/properties';
import { calculateCityRelationship } from '../../lib/modifiers';
import { formatMoney } from '../../lib/utils';
import { Building, Plane, MapPin, Heart, Building2, Briefcase, Plus } from 'lucide-react';

export const CityDetails = ({ cityId }) => {
  const city = CITIES.find(c => c.id === cityId);

  const { company, routes, buyProperty } = useGameStore(useShallow(state => ({
    company: state.company,
    routes: state.company.routes,
    buyProperty: state.buyProperty
  })));

  if (!city) return null;

  const cityRoutes = routes.filter(r => r.sourceId === cityId || r.targetId === cityId);

  // Calculate relationship
  const relationship = calculateCityRelationship(company, cityId);

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

  return (
    <div className="w-[350px] flex flex-col gap-4">
      {/* Header Info */}
      <div className="bg-slate-700 p-4 rounded border border-slate-600">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <MapPin size={16} />
          <span className="text-sm uppercase tracking-wider">{city.country}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-slate-800 p-2 rounded text-center">
            <div className="text-xs text-slate-400 uppercase">Business</div>
            <div className="text-xl font-bold text-sky-400">{city.biz}</div>
          </div>
          <div className="bg-slate-800 p-2 rounded text-center">
            <div className="text-xs text-slate-400 uppercase">Tourism</div>
            <div className="text-xl font-bold text-pink-400">{city.tour}</div>
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
              const Icon = propType.icon === 'Building2' ? Building2 : Briefcase;
              return (
                <div key={prop.id} className="bg-slate-700 p-2 rounded border border-slate-600 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} className="text-sky-400" />
                    <span className="font-bold text-white">{propType.name}</span>
                  </div>
                  <div className="text-xs text-slate-400 flex justify-between">
                    <span>Income: {formatMoney(prop.weeklyIncome || 0)}/wk</span>
                    <span>Cost: {formatMoney(prop.weeklyMaintCost || 0)}/wk</span>
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
            const Icon = propType.icon === 'Building2' ? Building2 : Briefcase;
            const canAfford = company.money >= propType.baseCost;

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
                <p className="text-xs text-slate-400 mb-2">{propType.description}</p>
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
