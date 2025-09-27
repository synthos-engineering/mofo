'use client';

import { useToast } from '@/hooks/use-toast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';

export function Toaster() {
  const { toasts } = useToast();

  const Component = ToastProvider as any;
  return (
    <Component>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const ToastComponent = Toast as any;
        const TitleComponent = ToastTitle as any;
        const DescriptionComponent = ToastDescription as any;
        const CloseComponent = ToastClose as any;
        return (
          <ToastComponent key={id} {...props}>
            <div className="grid gap-1">
              {title && <TitleComponent>{title}</TitleComponent>}
              {description && (
                <DescriptionComponent>{description}</DescriptionComponent>
              )}
            </div>
            {action}
            <CloseComponent />
          </ToastComponent>
        );
      })}
      {(() => {
        const ViewportComponent = ToastViewport as any;
        return <ViewportComponent />;
      })()}
    </Component>
  );
}
