import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { useTheme } from 'next-themes';

interface LogoProps extends Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'> {
    disabledLink?: boolean;
    className?: string;
    full?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
    ({ disabledLink = false, className, full = true, width = 40, height = 40 }, ref) => {
        const { theme } = useTheme();
        const logoSrc = theme === 'light' ? '/logo.svg' : '/logo-dark.svg';

        const logo = (
            <Image
                src={logoSrc}
                alt={`${siteConfig.name} logo`}
                width={width}
                height={height}
                className={cn(className)}
            />
        );

        if (disabledLink) {
            return (
                <div className="flex items-center">
                    {logo}
                    <span className="ml-2 font-extrabold text-sm">{siteConfig.name}</span>
                </div>
            );
        }

        return (
            <Link href={"/"}>
                <div ref={ref} className="flex items-center space-x-2">
                    {logo}
                    {full ? <span className="text-lg">{siteConfig.name}</span> : null}
                </div>
            </Link>
        );
    }
);

Logo.displayName = 'Logo';

export default Logo;
