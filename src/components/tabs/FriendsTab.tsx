import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Search, Crown, Award } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { useTranslation } from '../../data/translations';

export const FriendsTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock friends data
  const friends = [
    {
      id: '1',
      name: 'Ana Silva',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'online',
      consecutiveDays: 15,
      lastWorkout: '2 horas atrás',
      level: 'Dedicado',
    },
    {
      id: '2',
      name: 'Carlos Santos',
      avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'offline',
      consecutiveDays: 8,
      lastWorkout: '1 dia atrás',
      level: 'Consistente',
    },
    {
      id: '3',
      name: 'Marina Costa',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'online',
      consecutiveDays: 32,
      lastWorkout: '30 min atrás',
      level: 'Besta',
    },
  ];

  const pendingRequests = [
    {
      id: '4',
      name: 'Rafael Lima',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400',
      mutualFriends: 2,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Amigos</h1>
          <p className="text-gray-400">Conecte-se e motive-se com outros atletas</p>
        </div>
        
        <Button icon={UserPlus} variant="outline">
          Adicionar Amigo
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar amigos..."
            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </Card>

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Solicitações Pendentes</h3>
          
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={request.avatar}
                    alt={request.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-white font-medium">{request.name}</h4>
                    <p className="text-gray-400 text-sm">{request.mutualFriends} amigos em comum</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="primary">Aceitar</Button>
                  <Button size="sm" variant="ghost">Recusar</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Friends list */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-blue-400" size={24} />
          <h3 className="text-lg font-bold text-white">Meus Amigos ({friends.length})</h3>
        </div>

        <div className="space-y-4">
          {friends.map((friend, index) => (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                    friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-medium">{friend.name}</h4>
                    {friend.consecutiveDays >= 30 && (
                      <Crown className="text-yellow-400" size={16} />
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">Último treino: {friend.lastWorkout}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="text-orange-400" size={16} />
                  <span className="text-sm text-orange-400">{friend.level}</span>
                </div>
                <p className="text-gray-400 text-sm">{friend.consecutiveDays} dias consecutivos</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Leaderboard */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Crown className="text-yellow-400" />
          Ranking Semanal
        </h3>
        
        <div className="space-y-3">
          {friends
            .sort((a, b) => b.consecutiveDays - a.consecutiveDays)
            .map((friend, index) => (
              <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-black' :
                    index === 1 ? 'bg-gray-400 text-black' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    'bg-gray-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  
                  <span className="text-white font-medium">{friend.name}</span>
                </div>
                
                <span className="text-orange-400 font-medium">
                  {friend.consecutiveDays} dias
                </span>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};