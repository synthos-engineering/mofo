'use client';

import * as AspectRatioPrimitive from '@radix-ui/react-aspect-ratio';

function AspectRatio({
  ...props
}: any) {
  const ComponentAspectRatioPrimitiveRoot = AspectRatioPrimitive.Root as any;
  return <ComponentAspectRatioPrimitiveRoot data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };
