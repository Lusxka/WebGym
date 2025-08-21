import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Globe, Palette, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Card } from '../Card';
import { Button } from '../Button';
import { ConfirmationModal } from '../ConfirmationModal';
import { ToastNotification } from '../ToastNotification';
import { useTranslation } from '../../data/translations';
import { UserProfile } from '../../context/AppContext';

interface UserPreferences {
    darkMode: boolean;
    language: 'pt_BR' | 'en_US';
}

export const SettingsTab: React.FC = () => {
    // Pega o estado, o dispatch e a função de atualização do perfil do contexto
    const { state, updateUserProfile, dispatch } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastConfig, setToastConfig] = useState({
        title: '',
        message: '',
        type: 'success' as 'success' | 'error'
    });
    
    const parsedPreferences = useMemo((): UserPreferences => {
        try {
            if (state.user?.preferencias && typeof state.user.preferencias === 'string') {
                return JSON.parse(state.user.preferencias);
            }
        } catch (error) { console.error("Falha ao fazer parse das preferências:", error); }
        return { darkMode: state.darkMode, language: 'pt_BR' };
    }, [state.user?.preferencias, state.darkMode]);

    const t = useTranslation(parsedPreferences.language);

    const [formData, setFormData] = useState({
        nome: state.user?.nome || '',
        idade: state.user?.idade?.toString() || '',
        peso: state.user?.peso?.toString() || '',
        altura: state.user?.altura?.toString() || '',
        sexo: state.user?.sexo || 'masculino',
        nivel: state.user?.nivel || 'iniciante',
        objetivo: (state.user as UserProfile)?.objetivo || '',
    });

    const [preferences, setPreferences] = useState({
        shareWorkouts: state.user?.compartilhar_treinos ?? false,
        shareDiets: state.user?.compartilhar_dietas ?? false,
        language: parsedPreferences.language,
    });

    // Sincroniza o estado local do formulário com o estado global do contexto
    useEffect(() => {
        if (state.user) {
            setFormData({
                nome: state.user.nome || '',
                idade: state.user.idade?.toString() || '',
                peso: state.user.peso?.toString() || '',
                altura: state.user.altura?.toString() || '',
                sexo: state.user.sexo || 'masculino',
                nivel: state.user.nivel || 'iniciante',
                objetivo: state.user.objetivo || '',
            });
            const currentParsedPreferences = state.user.preferencias ? JSON.parse(state.user.preferencias) : {};
            setPreferences({
                shareWorkouts: state.user.compartilhar_treinos ?? false,
                shareDiets: state.user.compartilhar_dietas ?? false,
                language: currentParsedPreferences.language ?? 'pt_BR',
            });
        }
    }, [state.user]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateUserProfile({
                nome: formData.nome,
                idade: formData.idade ? parseInt(formData.idade) : null,
                peso: formData.peso ? parseFloat(formData.peso) : null,
                altura: formData.altura ? parseInt(formData.altura) : null,
                sexo: formData.sexo,
                nivel: formData.nivel,
                objetivo: formData.objetivo,
                compartilhar_treinos: preferences.shareWorkouts,
                compartilhar_dietas: preferences.shareDiets,
                preferencias: JSON.stringify({
                    darkMode: state.darkMode,
                    language: preferences.language
                }),
            });
            
            // Fechar o modal de confirmação
            setShowConfirmModal(false);
            
            // Mostrar notificação de sucesso
            setToastConfig({
                title: 'Perfil Atualizado!',
                message: 'Suas informações foram salvas com sucesso.',
                type: 'success'
            });
            setShowToast(true);
            
        } catch (error) {
            setShowConfirmModal(false);
            
            // Mostrar notificação de erro
            setToastConfig({
                title: 'Erro ao Salvar',
                message: 'Não foi possível salvar suas alterações. Tente novamente.',
                type: 'error'
            });
            setShowToast(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveClick = () => {
        setShowConfirmModal(true);
    };

    const ToggleSwitch = ({ enabled, onClick }: { enabled: boolean, onClick: () => void }) => (
        <button
            type="button"
            onClick={onClick}
            // CORREÇÃO: Fundo do switch com cores para os dois modos
            className={`relative flex items-center w-14 h-8 rounded-full transition-colors ${
                enabled ? 'bg-blue-600 justify-end' : 'bg-gray-400 dark:bg-gray-600 justify-start'
            }`}
        >
            <motion.div
                className="w-6 h-6 bg-white rounded-full mx-1 shadow-md"
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
            />
        </button>
    );

    const handleDarkModeToggle = () => {
        dispatch({ type: 'SET_DARK_MODE', payload: !state.darkMode });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                {/* CORREÇÃO: Título com cores para os dois modos */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('settings')}</h1>
                {/* CORREÇÃO: Parágrafo com cores para os dois modos */}
                <p className="text-gray-600 dark:text-gray-400">Gerencie suas informações pessoais e preferências</p>
            </div>

            {/* Informações Pessoais */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    {/* CORREÇÃO: Ícone com cores para os dois modos */}
                    <User className="text-blue-600 dark:text-blue-400" size={24} />
                    {/* CORREÇÃO: Título com cores para os dois modos */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('personalData')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nome */}
                    <div>
                        {/* CORREÇÃO: Label com cores para os dois modos */}
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('name')}</label>
                        {/* CORREÇÃO: Input com cores para os dois modos */}
                        <input type="text" value={formData.nome} onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    {/* Idade */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('age')}</label>
                        <input type="number" value={formData.idade} onChange={(e) => setFormData(prev => ({ ...prev, idade: e.target.value }))} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    {/* Peso */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('weight')} (kg)</label>
                        <input type="number" step="0.1" value={formData.peso} onChange={(e) => setFormData(prev => ({ ...prev, peso: e.target.value }))} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    {/* Altura */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('height')} (cm)</label>
                        <input type="number" value={formData.altura} onChange={(e) => setFormData(prev => ({ ...prev, altura: e.target.value }))} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    {/* Gênero */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('gender')}</label>
                        {/* CORREÇÃO: Select com cores para os dois modos */}
                        <select value={formData.sexo} onChange={(e) => setFormData(prev => ({ ...prev, sexo: e.target.value as 'masculino' | 'feminino' }))} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                            <option value="masculino">Masculino</option>
                            <option value="feminino">Feminino</option>
                        </select>
                    </div>
                    {/* Nível */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{t('level')}</label>
                        <select value={formData.nivel} onChange={(e) => setFormData(prev => ({ ...prev, nivel: e.target.value as 'iniciante' | 'intermediario' | 'avancado' }))} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                            <option value="iniciante">{t('beginner')}</option>
                            <option value="intermediario">{t('intermediate')}</option>
                            <option value="avancado">{t('advanced')}</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Preferências */}
            <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    {/* CORREÇÃO: Ícone com cores para os dois modos */}
                    <Palette className="text-purple-600 dark:text-purple-400" size={24} />
                    {/* CORREÇÃO: Título com cores para os dois modos */}
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('preferences')}</h2>
                </div>
                <div className="space-y-6">
                    {/* Idioma */}
                    <div>
                        {/* CORREÇÃO: Label com cores para os dois modos */}
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2"><Globe className="inline w-4 h-4 mr-2" />{t('language')}</label>
                        <select value={preferences.language} onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value as any }))} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                            <option value="pt_BR">Português (Brasil)</option>
                            <option value="en_US">English (US)</option>
                        </select>
                    </div>
                    <div className="space-y-4">
                        {/* Toggles */}
                        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                            <div>
                                <h3 className="text-gray-900 dark:text-white font-medium">{t('darkMode')}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Usar tema escuro na interface</p>
                            </div>
                            <ToggleSwitch enabled={state.darkMode} onClick={handleDarkModeToggle} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                            <div>
                                <h3 className="text-gray-900 dark:text-white font-medium">{t('shareWorkouts')}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Permitir que amigos vejam seus treinos</p>
                            </div>
                            <ToggleSwitch enabled={preferences.shareWorkouts} onClick={() => setPreferences(prev => ({ ...prev, shareWorkouts: !prev.shareWorkouts }))} />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                            <div>
                                <h3 className="text-gray-900 dark:text-white font-medium">{t('shareDiets')}</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Permitir que amigos vejam sua dieta</p>
                            </div>
                            <ToggleSwitch enabled={preferences.shareDiets} onClick={() => setPreferences(prev => ({ ...prev, shareDiets: !prev.shareDiets }))} />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Botão Salvar */}
            <div className="flex justify-end">
                <Button onClick={handleSaveClick} icon={Save} size="lg" disabled={isLoading}>
                    {t('save')}
                </Button>
            </div>

            {/* Modal de Confirmação */}
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleSave}
                title="Salvar Alterações"
                message="Tem certeza de que deseja salvar todas as alterações feitas no seu perfil? Esta ação não pode ser desfeita."
                type="info"
                confirmText="Salvar Alterações"
                cancelText="Cancelar"
                isLoading={isLoading}
            />

            {/* Notificação Toast */}
            <ToastNotification
                isOpen={showToast}
                onClose={() => setShowToast(false)}
                title={toastConfig.title}
                message={toastConfig.message}
                type={toastConfig.type}
                duration={4000}
            />
        </div>
    );
};