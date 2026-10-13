import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/site";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`}>
      <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-sharpsave-green-dark/10">
        <Image
          src="/favicon.ico"
          alt={`${APP_NAME} logo`}
          width={48}
          height={48}
          unoptimized
          className="h-full w-full object-contain"
        />
      </span>
      <span className="text-lg font-bold tracking-tight text-sharpsave-green-dark">
        {APP_NAME}
      </span>
    </Link>
  );
}
