import { Toaster } from 'sileo';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      options={{
        fill: '#12121a',
        roundness: 10,
        styles: {
          title: '!text-[#e2e8f0]',
          description: '!text-[#94a3b8]',
          badge: '!bg-[#1e1e2e] !border !border-[#7c3aed]/30',
        },
      }}
    />
  );
}
