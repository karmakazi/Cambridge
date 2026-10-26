import Image from "next/image";

export default function BrandLogo({ className = "w-36" }: { className?: string }) {
  return (
    <Image
      src="/cambridge-logo-white.png"
      alt="Cambridge Forums"
      width={1148}
      height={275}
      priority
      className={`h-auto ${className}`}
    />
  );
}
