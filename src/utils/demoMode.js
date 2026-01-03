import toast from 'react-hot-toast';

// Demo mode utility - disables all save operations for showcase
export const DEMO_MODE = true;

export const showDemoMessage = () => {
  if (DEMO_MODE) {
    toast.error('This action cannot be performed !', {
      duration: 3000,
      position: 'top-center',
      style: {
        background: '#FEF3C7',
        color: '#92400E',
        border: '1px solid #F59E0B',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: '⚠️',
    });
    return true;
  }
  return false;
};

export const mockApiCall = (successMessage = 'Changes saved successfully!') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (DEMO_MODE) {
        showDemoMessage();
      }
      resolve({ success: true, message: successMessage });
    }, 500);
  });
};

export const disableSaveInDemo = (originalFunction) => {
  return (...args) => {
    if (DEMO_MODE) {
      showDemoMessage();
      return Promise.resolve({ success: false, demo: true });
    }
    return originalFunction(...args);
  };
};