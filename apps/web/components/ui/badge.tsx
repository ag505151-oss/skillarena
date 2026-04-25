import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        purple: 'border-transparent bg-[#534AB7]/10 text-[#534AB7]',
        teal: 'border-transparent bg-[#1D9E75]/10 text-[#1D9E75]',
        amber: 'border-transparent bg-[#EF9F27]/10 text-[#EF9F27]',
        red: 'border-transparent bg-[#E24B4A]/10 text-[#E24B4A]',
        green: 'border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        success: 'border-transparent bg-[#1D9E75]/10 text-[#1D9E75]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
