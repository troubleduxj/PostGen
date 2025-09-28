import React from 'react';
import { Asset } from '@/stores/assetLibraryStore';

interface OnlineAssetBrowserProps {
  source: 'unsplash' | 'iconify';
  onAssetSelect: (asset: Asset) => void;
  className?: string;
}

const OnlineAssetBrowser: React.FC<OnlineAssetBrowserProps> = ({
  source,
  onAssetSelect,
  className = ''
}) => {
  return (
    <div className={`online-asset-browser ${className}`}>
      <div className="text-center text-gray-500 py-8">
        {source === 'unsplash' ? 'Unsplash' : 'Iconify'} integration coming soon...
      </div>
    </div>
  );
};

export { OnlineAssetBrowser };
export default OnlineAssetBrowser;