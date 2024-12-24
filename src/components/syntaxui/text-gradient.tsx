import { cn } from '@/lib/utils'
import { HTMLAttributes, PropsWithChildren } from 'react'

const TextGradient = ({
  children,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => {
  return (
    <div
      {...props}
      className={cn(
        'animate-textGradient bg-gradient-to-r from-[#F22E76] via-[#F241E6] to-[#F2A444] bg-clip-text text-lg font-semibold text-transparent',
        props.className,
      )}
    >
      {children}
    </div>
  )
}

export default TextGradient
