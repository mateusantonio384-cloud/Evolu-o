import React, { useRef } from 'react';
import { ACCENT_COLORS, BACKGROUND_COLORS } from '../constants';

interface AppSettings {
  theme: 'light' | 'dark';
  accentColor: string;
  backgroundImage: string | null;
  backgroundColor: string;
}

interface SettingsPanelProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
}

const ACCENT_COLOR_NAMES = Object.keys(ACCENT_COLORS);

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThemeChange = (theme: 'light' | 'dark') => {
    onSettingsChange({ ...settings, theme });
  };

  const handleAccentColorChange = (color: string) => {
    onSettingsChange({ ...settings, accentColor: color });
  };

  const handleBackgroundColorChange = (colorKey: string) => {
    onSettingsChange({ ...settings, backgroundColor: colorKey });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onSettingsChange({ ...settings, backgroundImage: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onSettingsChange({ ...settings, backgroundImage: null });
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="text-left">
      <div className="space-y-6">
        {/* Background Image Section */}
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Imagem de Fundo</h3>
          <div className="flex space-x-2">
            <button
              onClick={triggerFileSelect}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-500"
            >
              Carregar Imagem
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            {settings.backgroundImage && (
              <button
                onClick={handleRemoveImage}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Remover
              </button>
            )}
          </div>
        </div>
        
        {/* Background Color Section */}
        <div className={`transition-opacity duration-300 ${settings.backgroundImage ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Cor de Fundo</h3>
          {settings.backgroundImage && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 -mt-1">Desativado com imagem de fundo.</p>
          )}
          <div className="flex flex-wrap gap-3">
            {Object.entries(BACKGROUND_COLORS).map(([key, { name, lightClass }]) => (
              <button
                key={key}
                onClick={() => handleBackgroundColorChange(key)}
                className={`w-8 h-8 rounded-full focus:outline-none ring-2 ring-offset-2 dark:ring-offset-zinc-800 flex items-center justify-center ${settings.backgroundColor === key ? 'ring-[rgb(var(--accent-color))]' : 'ring-transparent'}`}
                title={name}
                aria-label={`Selecionar cor de fundo ${name}`}
              >
                <div className={`w-full h-full rounded-full border border-black/10 ${lightClass}`}></div>
              </button>
            ))}
          </div>
        </div>

        {/* Theme Section */}
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Tema</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex-1 px-4 py-2 rounded-lg ${settings.theme === 'light' ? 'bg-[rgb(var(--accent-color))] text-[var(--accent-text-color)]' : 'bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-gray-200'}`}
            >
              Claro
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex-1 px-4 py-2 rounded-lg ${settings.theme === 'dark' ? 'bg-[rgb(var(--accent-color))] text-[var(--accent-text-color)]' : 'bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-gray-200'}`}
            >
              Escuro
            </button>
          </div>
        </div>

        {/* Accent Color Section */}
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">Cor de Destaque</h3>
          <div className="flex flex-wrap gap-3">
            {ACCENT_COLOR_NAMES.map(colorName => (
              <button
                key={colorName}
                onClick={() => handleAccentColorChange(colorName)}
                className={`w-8 h-8 rounded-full focus:outline-none ring-2 ring-offset-2 dark:ring-offset-zinc-800 ${settings.accentColor === colorName ? 'ring-[rgb(var(--accent-color))]' : 'ring-transparent'}`}
                style={{ backgroundColor: `rgb(${ACCENT_COLORS[colorName as keyof typeof ACCENT_COLORS].rgb})` }}
                aria-label={`Selecionar cor ${colorName}`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPanel;