'use client';

import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';

function Collapsible({
  ...props
}: any) {
  const ComponentCollapsiblePrimitiveRoot = CollapsiblePrimitive.Root as any;
  return <ComponentCollapsiblePrimitiveRoot data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  ...props
}: any) {
  const Component = CollapsiblePrimitive.CollapsibleTrigger as any;
  return (
    <Component
      data-slot="collapsible-trigger"
      {...props}
    />
  );
}

function CollapsibleContent({
  ...props
}: any) {
  const Component = CollapsiblePrimitive.CollapsibleContent as any;
  return (
    <Component
      data-slot="collapsible-content"
      {...props}
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
