import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Search, Crown, Award } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { useTranslation } from '../../data/translations';

export const FriendsTab: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const t = useTranslation('pt_BR'); // Assume um idioma padrão para a tradução

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
                    {/* CORREÇÃO: Título com cores para os dois modos */}
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Amigos</h1>
                    {/* CORREÇÃO: Parágrafo com cores para os dois modos */}
                    <p className="text-gray-600 dark:text-gray-400">Conecte-se e motive-se com outros atletas</p>
                </div>

                <Button icon={UserPlus} variant="outline" className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Adicionar Amigo
                </Button>
            </div>

            {/* Search */}
            <Card className="p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="relative">
                    {/* CORREÇÃO: Ícone com cores para os dois modos */}
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar amigos..."
                        // CORREÇÃO: Input com cores para os dois modos
                        className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                </div>
            </Card>

            {/* Pending requests */}
            {pendingRequests.length > 0 && (
                <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {/* CORREÇÃO: Título com cores para os dois modos */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Solicitações Pendentes</h3>

                    <div className="space-y-3">
                        {pendingRequests.map((request) => (
                            // CORREÇÃO: Fundo do card e borda com cores para os dois modos
                            <div key={request.id} className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={request.avatar}
                                        alt={request.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        {/* CORREÇÃO: Texto com cores para os dois modos */}
                                        <h4 className="text-gray-900 dark:text-white font-medium">{request.name}</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{request.mutualFriends} amigos em comum</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* CORREÇÃO: Botões com cores para os dois modos */}
                                    <Button size="sm" variant="primary">Aceitar</Button>
                                    <Button size="sm" variant="ghost" className="text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">Recusar</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Friends list */}
            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                    {/* CORREÇÃO: Ícone com cores para os dois modos */}
                    <Users className="text-blue-600 dark:text-blue-400" size={24} />
                    {/* CORREÇÃO: Título com cores para os dois modos */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Meus Amigos ({friends.length})</h3>
                </div>

                <div className="space-y-4">
                    {friends.map((friend, index) => (
                        <motion.div
                            key={friend.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            // CORREÇÃO: Fundo do card e borda com cores para os dois modos
                            className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/70 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        src={friend.avatar}
                                        alt={friend.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    {/* CORREÇÃO: Borda do status com cores para os dois modos */}
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                                        friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                                    }`} />
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        {/* CORREÇÃO: Nome com cores para os dois modos */}
                                        <h4 className="text-gray-900 dark:text-white font-medium">{friend.name}</h4>
                                        {friend.consecutiveDays >= 30 && (
                                            <Crown className="text-yellow-500 dark:text-yellow-400" size={16} />
                                        )}
                                    </div>
                                    {/* CORREÇÃO: Descrição com cores para os dois modos */}
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">Último treino: {friend.lastWorkout}</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="flex items-center gap-2 mb-1">
                                    {/* CORREÇÃO: Ícone e texto com cores para os dois modos */}
                                    <Award className="text-orange-500 dark:text-orange-400" size={16} />
                                    <span className="text-sm text-orange-600 dark:text-orange-400">{friend.level}</span>
                                </div>
                                {/* CORREÇÃO: Descrição com cores para os dois modos */}
                                <p className="text-gray-600 dark:text-gray-400 text-sm">{friend.consecutiveDays} dias consecutivos</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </Card>

            {/* Leaderboard */}
            <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-6">
                    {/* CORREÇÃO: Ícone com cores para os dois modos */}
                    <Crown className="text-yellow-500 dark:text-yellow-400" />
                    {/* CORREÇÃO: Título com cores para os dois modos */}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Ranking Semanal</h3>
                </div>

                <div className="space-y-3">
                    {friends
                        .sort((a, b) => b.consecutiveDays - a.consecutiveDays)
                        .map((friend, index) => (
                            <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    {/* CORREÇÃO: Número do ranking com cores para os dois modos */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                        index === 0 ? 'bg-yellow-500 text-black' :
                                        index === 1 ? 'bg-gray-400 text-black' :
                                        index === 2 ? 'bg-amber-600 text-white' :
                                        'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-white'
                                    }`}>
                                        {index + 1}
                                    </div>

                                    <img
                                        src={friend.avatar}
                                        alt={friend.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    {/* CORREÇÃO: Nome com cores para os dois modos */}
                                    <span className="text-gray-900 dark:text-white font-medium">{friend.name}</span>
                                </div>

                                {/* CORREÇÃO: Dias com cores para os dois modos */}
                                <span className="text-orange-600 dark:text-orange-400 font-medium">
                                    {friend.consecutiveDays} dias
                                </span>
                            </div>
                        ))}
                </div>
            </Card>
        </div>
    );
};