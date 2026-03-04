import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Button } from './ui/button';

type ModalType = 'success' | 'error' | 'confirm' | 'info';

interface CustomModalProps {
  show: boolean;
  type: ModalType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function CustomModal({
  show,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel'
}: CustomModalProps) {
  if (!show) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-300">
      <div className={`bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border-2 ${
        type === 'success' ? 'border-green-300' :
        type === 'error' ? 'border-red-300' :
        type === 'confirm' ? 'border-orange-300' :
        'border-blue-300'
      } animate-in zoom-in-95 duration-300`}>
        {/* Header */}
        <div className={`p-4 bg-gradient-to-r ${
          type === 'success' ? 'from-green-500 to-green-600' :
          type === 'error' ? 'from-red-500 to-red-600' :
          type === 'confirm' ? 'from-orange-500 to-orange-600' :
          'from-blue-500 to-blue-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {type === 'success' && <CheckCircle2 className="w-6 h-6 text-white" />}
              {type === 'error' && <AlertCircle className="w-6 h-6 text-white" />}
              {type === 'confirm' && <Info className="w-6 h-6 text-white" />}
              {type === 'info' && <Info className="w-6 h-6 text-white" />}
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className={`p-4 border-t-2 border-gray-100 bg-gray-50 ${
          type === 'confirm' ? 'flex gap-3' : ''
        }`}>
          {type === 'confirm' ? (
            <>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl h-11 font-semibold text-sm"
              >
                {cancelText}
              </Button>
              <Button
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl h-11 font-semibold text-sm shadow-lg"
              >
                {confirmText}
              </Button>
            </>
          ) : (
            <Button
              onClick={handleConfirm}
              className={`w-full bg-gradient-to-r ${
                type === 'success' ? 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' :
                type === 'error' ? 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' :
                'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
              } text-white rounded-xl h-11 font-semibold text-sm shadow-lg`}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
