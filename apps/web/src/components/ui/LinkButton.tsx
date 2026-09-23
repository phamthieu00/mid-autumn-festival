import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/cn'
import type { ButtonProps } from './Button'
import { buttonClasses } from './buttonStyles'

export function LinkButton({
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: LinkProps & Pick<ButtonProps, 'variant' | 'size'>) {
  return <Link className={cn(buttonClasses(variant, size), className)} {...props} />
}
